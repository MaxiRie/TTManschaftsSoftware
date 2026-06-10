using Microsoft.AspNetCore.Mvc;
using TTManschatfsSoftware.Data;
using TTManschatfsSoftware.Data.Repositories;
using TTManschatfsSoftware.Domain;
using TTManschatfsSoftware.DTOs;

namespace TTManschatfsSoftware.API;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly TeamRepository _teamRepository;
    private readonly ApplicationDbContext _context;

    public TeamsController(ApplicationDbContext context)
    {
        _context = context;
        _teamRepository = new TeamRepository(context);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetAll()
    {
        var teams = await _teamRepository.GetAllAsync();
        return Ok(teams.Select(MapToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TeamDto>> GetById(Guid id)
    {
        var team = await _teamRepository.GetByIdAsync(id);
        if (team == null)
            return NotFound();
        return Ok(MapToDto(team));
    }

    [HttpPost]
    public async Task<ActionResult<TeamDto>> Create([FromBody] CreateTeamDto dto)
    {
        var team = new Team
        {
            Name = dto.Name,
            League = dto.League,
            TargetSize = dto.TargetSize,
            SeasonId = dto.SeasonId
        };

        var created = await _teamRepository.CreateAsync(team);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToDto(created));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TeamDto>> Update(Guid id, [FromBody] UpdateTeamDto dto)
    {
        var team = await _teamRepository.GetByIdAsync(id);
        if (team == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Name))
            team.Name = dto.Name;
        if (!string.IsNullOrEmpty(dto.League))
            team.League = dto.League;
        if (dto.TargetSize.HasValue)
            team.TargetSize = dto.TargetSize.Value;

        team.UpdatedAt = DateTime.UtcNow;
        var updated = await _teamRepository.UpdateAsync(team);
        return Ok(MapToDto(updated));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _teamRepository.DeleteAsync(id);
        if (!success)
            return NotFound();
        return NoContent();
    }

    [HttpPost("{teamId}/players/{playerId}")]
    public async Task<IActionResult> AddPlayer(Guid teamId, Guid playerId)
    {
        await _teamRepository.AddPlayerAsync(teamId, playerId);
        return NoContent();
    }

    [HttpDelete("{teamId}/players/{playerId}")]
    public async Task<IActionResult> RemovePlayer(Guid teamId, Guid playerId)
    {
        await _teamRepository.RemovePlayerAsync(teamId, playerId);
        return NoContent();
    }

    private static TeamDto MapToDto(Team team)
    {
        return new TeamDto
        {
            Id = team.Id,
            Name = team.Name,
            League = team.League,
            TargetSize = team.TargetSize,
            Players = team.Players.Select(p => new PlayerDto
            {
                Id = p.Id,
                Name = p.Name,
                Qttr = p.Qttr,
                QttrDate = p.QttrDate,
                Status = p.Status,
                SeasonNote = p.SeasonNote,
                IsSpvMarked = p.IsSpvMarked,
                TeamId = p.TeamId
            }).ToList(),
            SeasonId = team.SeasonId
        };
    }
}
