using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.Services;

public class JwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAt) CreateToken(AppUser user, IEnumerable<string> roles)
    {
        var expiresAt = DateTime.UtcNow.AddHours(8);
        var header = new Dictionary<string, object>
        {
            ["alg"] = "HS256",
            ["typ"] = "JWT"
        };
        var payload = new Dictionary<string, object>
        {
            ["sub"] = user.Id.ToString(),
            ["name"] = user.UserName,
            ["email"] = user.Email,
            ["roles"] = roles.ToArray(),
            ["playerId"] = user.PlayerId?.ToString() ?? string.Empty,
            ["iat"] = ToUnixTime(DateTime.UtcNow),
            ["exp"] = ToUnixTime(expiresAt)
        };

        var unsignedToken = $"{Base64Url(JsonSerializer.SerializeToUtf8Bytes(header))}.{Base64Url(JsonSerializer.SerializeToUtf8Bytes(payload))}";
        var signature = Sign(unsignedToken);
        return ($"{unsignedToken}.{signature}", expiresAt);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var parts = token.Split('.');
        if (parts.Length != 3)
            return null;

        var unsignedToken = $"{parts[0]}.{parts[1]}";
        var expectedSignature = Sign(unsignedToken);
        if (!CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(parts[2]), Encoding.ASCII.GetBytes(expectedSignature)))
            return null;

        var payloadJson = Encoding.UTF8.GetString(Base64UrlDecode(parts[1]));
        using var payload = JsonDocument.Parse(payloadJson);
        var root = payload.RootElement;
        if (!root.TryGetProperty("exp", out var exp) || DateTime.UtcNow >= FromUnixTime(exp.GetInt64()))
            return null;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, root.GetProperty("sub").GetString() ?? string.Empty),
            new(ClaimTypes.Name, root.GetProperty("name").GetString() ?? string.Empty),
            new(ClaimTypes.Email, root.GetProperty("email").GetString() ?? string.Empty),
            new("playerId", root.TryGetProperty("playerId", out var playerId) ? playerId.GetString() ?? string.Empty : string.Empty)
        };

        if (root.TryGetProperty("roles", out var roles))
        {
            foreach (var role in roles.EnumerateArray())
            {
                var value = role.GetString();
                if (!string.IsNullOrWhiteSpace(value))
                    claims.Add(new Claim(ClaimTypes.Role, value));
            }
        }

        return new ClaimsPrincipal(new ClaimsIdentity(claims, "Bearer"));
    }

    private string Sign(string unsignedToken)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(GetSecret()));
        return Base64Url(hmac.ComputeHash(Encoding.UTF8.GetBytes(unsignedToken)));
    }

    private string GetSecret()
    {
        var secret = _configuration["Jwt:SecretKey"] ?? Environment.GetEnvironmentVariable("TTMANNSCHAFT_JWT_SECRET");
        if (string.IsNullOrWhiteSpace(secret))
            throw new InvalidOperationException("JWT secret is missing. Set Jwt:SecretKey or TTMANNSCHAFT_JWT_SECRET.");

        if (Encoding.UTF8.GetByteCount(secret) < 32)
            throw new InvalidOperationException("JWT secret must be at least 256 bit / 32 UTF-8 bytes.");

        return secret;
    }

    private static long ToUnixTime(DateTime dateTime) => new DateTimeOffset(dateTime).ToUnixTimeSeconds();

    private static DateTime FromUnixTime(long value) => DateTimeOffset.FromUnixTimeSeconds(value).UtcDateTime;

    private static string Base64Url(byte[] input)
    {
        return Convert.ToBase64String(input).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static byte[] Base64UrlDecode(string input)
    {
        var padded = input.Replace('-', '+').Replace('_', '/');
        padded = padded.PadRight(padded.Length + (4 - padded.Length % 4) % 4, '=');
        return Convert.FromBase64String(padded);
    }
}
