using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Data;
using TTManschatfsSoftware.Domain;
using TTManschatfsSoftware.DTOs;

namespace TTManschatfsSoftware.API;

[ApiController]
[Route("api/[controller]")]
public class SeasonsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SeasonsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SeasonDto>>> GetAll()
    {
        var seasons = await _context.Seasons.ToListAsync();
        return Ok(seasons.Select(MapToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SeasonDto>> GetById(Guid id)
    {
        var season = await _context.Seasons.FindAsync(id);
        if (season == null)
            return NotFound();

        return Ok(MapToDto(season));
    }

    [HttpPost]
    public async Task<ActionResult<SeasonDto>> Create([FromBody] CreateSeasonDto dto)
    {
        var season = new Season
        {
            Label = dto.Label,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            ExcludeHolidays = dto.ExcludeHolidays,
            ExcludeSchoolBreaks = dto.ExcludeSchoolBreaks
        };

        _context.Seasons.Add(season);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = season.Id }, MapToDto(season));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SeasonDto>> Update(Guid id, [FromBody] CreateSeasonDto dto)
    {
        var season = await _context.Seasons.FindAsync(id);
        if (season == null)
            return NotFound();

        season.Label = dto.Label;
        season.StartDate = dto.StartDate;
        season.EndDate = dto.EndDate;
        season.ExcludeHolidays = dto.ExcludeHolidays;
        season.ExcludeSchoolBreaks = dto.ExcludeSchoolBreaks;
        season.UpdatedAt = DateTime.UtcNow;

        _context.Seasons.Update(season);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(season));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var season = await _context.Seasons.FindAsync(id);
        if (season == null)
            return NotFound();

        _context.Seasons.Remove(season);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static SeasonDto MapToDto(Season season)
    {
        return new SeasonDto
        {
            Id = season.Id,
            Label = season.Label,
            StartDate = season.StartDate,
            EndDate = season.EndDate,
            ExcludeHolidays = season.ExcludeHolidays,
            ExcludeSchoolBreaks = season.ExcludeSchoolBreaks
        };
    }
}
