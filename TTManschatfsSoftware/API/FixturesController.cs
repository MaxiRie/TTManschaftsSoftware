using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Data;
using TTManschatfsSoftware.Domain;
using TTManschatfsSoftware.DTOs;

namespace TTManschatfsSoftware.API;

[ApiController]
[Route("api/[controller]")]
public class FixturesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FixturesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FixtureDto>>> GetAll()
    {
        var fixtures = await _context.Fixtures
            .Include(f => f.PreferredDates)
            .Include(f => f.Lineup)
                .ThenInclude(l => l.Player)
            .ToListAsync();

        return Ok(fixtures.Select(MapToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FixtureDto>> GetById(Guid id)
    {
        var fixture = await _context.Fixtures
            .Include(f => f.PreferredDates)
            .Include(f => f.Lineup)
                .ThenInclude(l => l.Player)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (fixture == null)
            return NotFound();

        return Ok(MapToDto(fixture));
    }

    [HttpPost]
    public async Task<ActionResult<FixtureDto>> Create([FromBody] CreateFixtureDto dto)
    {
        var fixture = new Fixture
        {
            TeamId = dto.TeamId,
            Opponent = dto.Opponent,
            Venue = dto.Venue,
            Status = "offen"
        };

        _context.Fixtures.Add(fixture);
        await _context.SaveChangesAsync();

        foreach (var date in dto.PreferredDates)
        {
            var fixtureDate = new FixtureDate
            {
                FixtureId = fixture.Id,
                Date = date,
                Priority = dto.PreferredDates.IndexOf(date)
            };
            _context.FixtureDates.Add(fixtureDate);
        }

        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = fixture.Id }, MapToDto(fixture));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FixtureDto>> Update(Guid id, [FromBody] UpdateFixtureDto dto)
    {
        var fixture = await _context.Fixtures
            .Include(f => f.PreferredDates)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (fixture == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Opponent))
            fixture.Opponent = dto.Opponent;
        if (!string.IsNullOrEmpty(dto.Venue))
            fixture.Venue = dto.Venue;
        if (!string.IsNullOrEmpty(dto.Status))
            fixture.Status = dto.Status;
        if (dto.ConfirmedDate.HasValue)
            fixture.ConfirmedDate = dto.ConfirmedDate.Value;
        if (!string.IsNullOrEmpty(dto.Hall))
            fixture.Hall = dto.Hall;

        fixture.UpdatedAt = DateTime.UtcNow;
        _context.Fixtures.Update(fixture);
        await _context.SaveChangesAsync();

        return Ok(MapToDto(fixture));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var fixture = await _context.Fixtures.FindAsync(id);
        if (fixture == null)
            return NotFound();

        _context.Fixtures.Remove(fixture);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static FixtureDto MapToDto(Fixture fixture)
    {
        return new FixtureDto
        {
            Id = fixture.Id,
            TeamId = fixture.TeamId,
            Opponent = fixture.Opponent,
            Venue = fixture.Venue,
            Status = fixture.Status,
            ConfirmedDate = fixture.ConfirmedDate,
            Hall = fixture.Hall,
            PreferredDates = fixture.PreferredDates.OrderBy(d => d.Priority).Select(d => d.Date).ToList(),
            Lineup = fixture.Lineup.Select(l => new LineupEntryDto
            {
                PlayerId = l.PlayerId,
                PlayerName = l.Player?.Name ?? "",
                Position = l.Position,
                IsSubstitute = l.IsSubstitute
            }).ToList()
        };
    }
}
