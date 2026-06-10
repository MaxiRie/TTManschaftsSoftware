using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.Data.Repositories;

public class TeamRepository
{
    private readonly ApplicationDbContext _context;

    public TeamRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Team>> GetAllAsync()
    {
        return await _context.Teams
            .Include(t => t.Players)
            .Include(t => t.Fixtures)
            .Include(t => t.Season)
            .ToListAsync();
    }

    public async Task<Team?> GetByIdAsync(Guid id)
    {
        return await _context.Teams
            .Include(t => t.Players)
            .Include(t => t.Fixtures)
            .Include(t => t.Season)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<List<Team>> GetBySeasonAsync(Guid seasonId)
    {
        return await _context.Teams
            .Include(t => t.Players)
            .Where(t => t.SeasonId == seasonId)
            .ToListAsync();
    }

    public async Task<Team> CreateAsync(Team team)
    {
        _context.Teams.Add(team);
        await _context.SaveChangesAsync();
        return team;
    }

    public async Task<Team> UpdateAsync(Team team)
    {
        _context.Teams.Update(team);
        await _context.SaveChangesAsync();
        return team;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var team = await GetByIdAsync(id);
        if (team == null) return false;

        _context.Teams.Remove(team);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task AddPlayerAsync(Guid teamId, Guid playerId)
    {
        var team = await GetByIdAsync(teamId);
        var player = await _context.Players.FindAsync(playerId);

        if (team != null && player != null)
        {
            player.TeamId = teamId;
            _context.Players.Update(player);
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemovePlayerAsync(Guid teamId, Guid playerId)
    {
        var player = await _context.Players.FindAsync(playerId);
        if (player != null && player.TeamId == teamId)
        {
            player.TeamId = null;
            _context.Players.Update(player);
            await _context.SaveChangesAsync();
        }
    }
}
