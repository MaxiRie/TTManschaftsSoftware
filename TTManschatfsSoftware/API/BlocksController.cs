using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Data;
using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.API;

[ApiController]
[Route("api/[controller]")]
public class BlocksController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public BlocksController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Block>>> GetAll()
    {
        return Ok(await _context.Blocks
            .Include(b => b.Player)
            .ToListAsync());
    }

    [HttpGet("player/{playerId}")]
    public async Task<ActionResult<IEnumerable<Block>>> GetByPlayer(Guid playerId)
    {
        return Ok(await _context.Blocks
            .Where(b => b.PlayerId == playerId)
            .OrderBy(b => b.Date)
            .ToListAsync());
    }

    [HttpPost]
    public async Task<ActionResult<Block>> Create([FromBody] CreateBlockDto dto)
    {
        var block = new Block
        {
            PlayerId = dto.PlayerId,
            Date = dto.Date,
            Reason = dto.Reason
        };

        _context.Blocks.Add(block);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = block.Id }, block);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Block>> GetById(Guid id)
    {
        var block = await _context.Blocks
            .Include(b => b.Player)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (block == null)
            return NotFound();

        return Ok(block);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var block = await _context.Blocks.FindAsync(id);
        if (block == null)
            return NotFound();

        _context.Blocks.Remove(block);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class CreateBlockDto
{
    public Guid PlayerId { get; set; }
    public DateTime Date { get; set; }
    public string? Reason { get; set; }
}
