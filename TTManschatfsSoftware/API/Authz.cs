using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Data;

namespace TTManschatfsSoftware.API;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Spieler = "Spieler";
    public const string Mannschaftsfuehrer = "Mannschaftsfuehrer";
    public const string Vereinsleiter = "Vereinsleiter";
    public const string Turnierleiter = "Turnierleiter";

    public const string All = $"{Admin},{Spieler},{Mannschaftsfuehrer},{Vereinsleiter},{Turnierleiter}";
    public const string ClubManagement = $"{Admin},{Vereinsleiter}";
    public const string FixtureManagement = $"{Admin},{Mannschaftsfuehrer}";
    public const string TournamentManagement = $"{Admin},{Turnierleiter}";
}

public static class ClaimsPrincipalExtensions
{
    public static bool IsAdmin(this ClaimsPrincipal user) => user.IsInRole(Roles.Admin);
    public static bool IsClubManager(this ClaimsPrincipal user) => user.IsAdmin() || user.IsInRole(Roles.Vereinsleiter);
    public static bool IsTournamentManager(this ClaimsPrincipal user) => user.IsAdmin() || user.IsInRole(Roles.Turnierleiter);

    public static Guid? UserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(value, out var id) ? id : null;
    }

    public static Guid? PlayerId(this ClaimsPrincipal user)
    {
        var value = user.FindFirst("playerId")?.Value;
        return Guid.TryParse(value, out var id) ? id : null;
    }
}

public abstract class AuthControllerBase : ControllerBase
{
    protected async Task<bool> CanManageFixtureTeam(ApplicationDbContext context, Guid teamId)
    {
        if (User.IsAdmin())
            return true;

        if (!User.IsInRole(Roles.Mannschaftsfuehrer))
            return false;

        var playerId = User.PlayerId();
        if (!playerId.HasValue)
            return false;

        return await context.Players.AnyAsync(player => player.Id == playerId.Value && player.TeamId == teamId);
    }
}
