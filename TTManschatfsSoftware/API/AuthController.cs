using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Data;
using TTManschatfsSoftware.Domain;
using TTManschatfsSoftware.DTOs;
using TTManschatfsSoftware.Services;

namespace TTManschatfsSoftware.API;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly PasswordHasher _passwordHasher;
    private readonly JwtTokenService _jwtTokenService;

    public AuthController(ApplicationDbContext context, PasswordHasher passwordHasher, JwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResultDto>> Login([FromBody] LoginDto dto)
    {
        var user = await _context.AppUsers
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserName == dto.UserNameOrEmail || u.Email == dto.UserNameOrEmail);

        if (user == null || !user.IsActive || !_passwordHasher.Verify(dto.Password, user.PasswordHash))
            return Unauthorized();

        var roles = user.UserRoles.Select(ur => ur.Role?.Name).OfType<string>().ToList();
        var token = _jwtTokenService.CreateToken(user, roles);
        return Ok(new AuthResultDto
        {
            Token = token.Token,
            ExpiresAt = token.ExpiresAt,
            User = MapToDto(user)
        });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("users")]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterUserDto dto)
    {
        return await CreateUser(dto, dto.Roles.Count > 0 ? dto.Roles : new List<string> { "Spieler" });
    }

    [HttpPost("bootstrap-admin")]
    public async Task<ActionResult<UserDto>> BootstrapAdmin([FromBody] RegisterUserDto dto)
    {
        if (await _context.AppUsers.AnyAsync())
            return Conflict("Bootstrap ist nur erlaubt, solange noch kein Benutzer existiert.");

        return await CreateUser(dto, new List<string> { "Admin" });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        return await GetUser(userId);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _context.AppUsers
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .OrderBy(u => u.UserName)
            .ToListAsync();

        return Ok(users.Select(MapToDto).ToList());
    }

    [Authorize]
    [HttpGet("users/{id}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        var user = await _context.AppUsers
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        return Ok(MapToDto(user));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("roles")]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetRoles()
    {
        var roles = await _context.AppRoles.OrderBy(role => role.Name).ToListAsync();
        return Ok(roles.Select(role => new RoleDto { Name = role.Name, Description = role.Description }));
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("users/{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.AppUsers
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(dto.UserName))
            return BadRequest("Benutzername ist erforderlich.");

        var email = string.IsNullOrWhiteSpace(dto.Email) ? string.Empty : dto.Email.Trim();
        if (await _context.AppUsers.AnyAsync(u => u.Id != id && u.UserName == dto.UserName))
            return Conflict("Benutzername existiert bereits.");
        if (!string.IsNullOrWhiteSpace(email) && await _context.AppUsers.AnyAsync(u => u.Id != id && u.Email == email))
            return Conflict("Benutzername oder E-Mail existiert bereits.");

        user.UserName = dto.UserName.Trim();
        user.Email = email;
        user.PlayerId = dto.PlayerId;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        _context.AppUserRoles.RemoveRange(user.UserRoles);
        var roleResult = await AddRoles(user.Id, dto.Roles.Count > 0 ? dto.Roles : new List<string> { Roles.Spieler });
        if (roleResult != null)
            return roleResult;

        await _context.SaveChangesAsync();
        return await GetUser(id);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("users/{id}/password")]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Passwort ist erforderlich.");

        var user = await _context.AppUsers.FindAsync(id);
        if (user == null)
            return NotFound();

        user.PasswordHash = _passwordHasher.Hash(dto.Password);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static UserDto MapToDto(AppUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            PlayerId = user.PlayerId,
            IsActive = user.IsActive,
            Roles = user.UserRoles.Select(ur => ur.Role?.Name).OfType<string>().ToList()
        };
    }

    private async Task<ActionResult<UserDto>> CreateUser(RegisterUserDto dto, List<string> roleNames)
    {
        if (string.IsNullOrWhiteSpace(dto.UserName) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Benutzername und Passwort sind erforderlich.");

        var email = string.IsNullOrWhiteSpace(dto.Email) ? string.Empty : dto.Email.Trim();
        if (await _context.AppUsers.AnyAsync(u => u.UserName == dto.UserName))
            return Conflict("Benutzername existiert bereits.");
        if (!string.IsNullOrWhiteSpace(email) && await _context.AppUsers.AnyAsync(u => u.Email == email))
            return Conflict("E-Mail existiert bereits.");

        var user = new AppUser
        {
            UserName = dto.UserName,
            Email = email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            PlayerId = dto.PlayerId
        };

        _context.AppUsers.Add(user);
        await _context.SaveChangesAsync();

        var roleResult = await AddRoles(user.Id, roleNames);
        if (roleResult != null)
            return roleResult;

        await _context.SaveChangesAsync();
        var saved = await _context.AppUsers
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstAsync(u => u.Id == user.Id);

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, MapToDto(saved));
    }

    private async Task<ActionResult<UserDto>?> AddRoles(Guid userId, List<string> roleNames)
    {
        foreach (var roleName in roleNames.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var role = await _context.AppRoles.FirstOrDefaultAsync(r => r.Name.ToLower() == roleName.ToLower());
            if (role == null)
                return BadRequest($"Rolle '{roleName}' existiert nicht.");

            _context.AppUserRoles.Add(new AppUserRole { UserId = userId, RoleId = role.Id });
        }

        return null;
    }
}
