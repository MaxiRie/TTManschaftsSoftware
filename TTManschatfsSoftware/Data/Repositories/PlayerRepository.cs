using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.Data.Repositories;

public class PlayerRepository
{
    private readonly ApplicationDbContext _context;

    public PlayerRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Player>> GetAllAsync()
    {
        return await _context.Players
            .Include(p => p.Team)
            .Include(p => p.Blocks)
            .ToListAsync();
    }

    public async Task<Player?> GetByIdAsync(Guid id)
    {
        return await _context.Players
            .Include(p => p.Team)
            .Include(p => p.Blocks)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<List<Player>> GetByTeamAsync(Guid teamId)
    {
        return await _context.Players
            .Where(p => p.TeamId == teamId)
            .OrderByDescending(p => p.Qttr)
            .ToListAsync();
    }

    public async Task<Player> CreateAsync(Player player)
    {
        _context.Players.Add(player);
        await _context.SaveChangesAsync();
        return player;
    }

    public async Task<Player> UpdateAsync(Player player)
    {
        _context.Players.Update(player);
        await _context.SaveChangesAsync();
        return player;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var player = await GetByIdAsync(id);
        if (player == null) return false;

        _context.Players.Remove(player);
        await _context.SaveChangesAsync();
        return true;
    }
}
