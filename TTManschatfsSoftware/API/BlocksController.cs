using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Data;
using TTManschatfsSoftware.Domain;
using TTManschatfsSoftware.DTOs;

namespace TTManschatfsSoftware.API;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.All)]
public class BlocksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BlocksController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlockDto>>> GetAll()
    {
        var query = _context.Blocks
            .Include(b => b.Player)
            .AsQueryable();

        if (!User.IsClubManager())
        {
            var playerId = User.PlayerId();
            query = query.Where(block => playerId.HasValue && block.PlayerId == playerId.Value);
        }

        var blocks = await query
            .OrderBy(b => b.Date)
            .ToListAsync();

        return Ok(blocks.Select(MapToDto).ToList());
    }

    [HttpGet("player/{playerId}")]
    public async Task<ActionResult<IEnumerable<BlockDto>>> GetByPlayer(Guid playerId)
    {
        if (!User.IsClubManager() && User.PlayerId() != playerId)
            return Forbid();

        var blocks = await _context.Blocks
            .Include(b => b.Player)
            .Where(b => b.PlayerId == playerId)
            .OrderBy(b => b.Date)
            .ToListAsync();

        return Ok(blocks.Select(MapToDto).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<BlockDto>> Create([FromBody] CreateBlockDto dto)
    {
        if (!User.IsClubManager() && User.PlayerId() != dto.PlayerId)
            return Forbid();

        var block = new Block
        {
            PlayerId = dto.PlayerId,
            Date = dto.Date,
            Reason = dto.Reason
        };

        _context.Blocks.Add(block);
        await _context.SaveChangesAsync();
        var created = await _context.Blocks
            .Include(b => b.Player)
            .FirstAsync(b => b.Id == block.Id);

        return CreatedAtAction(nameof(GetById), new { id = block.Id }, MapToDto(created));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlockDto>> GetById(Guid id)
    {
        var block = await _context.Blocks
            .Include(b => b.Player)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (block == null)
            return NotFound();

        return Ok(MapToDto(block));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var block = await _context.Blocks.FindAsync(id);
        if (block == null)
            return NotFound();

        if (!User.IsClubManager() && User.PlayerId() != block.PlayerId)
            return Forbid();

        _context.Blocks.Remove(block);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static BlockDto MapToDto(Block block)
    {
        return new BlockDto
        {
            Id = block.Id,
            PlayerId = block.PlayerId,
            PlayerName = block.Player?.Name ?? string.Empty,
            Date = block.Date,
            Reason = block.Reason,
            CreatedAt = block.CreatedAt
        };
    }
}

public class CreateBlockDto
{
    public Guid PlayerId { get; set; }
    public DateTime Date { get; set; }
    public string? Reason { get; set; }
}
