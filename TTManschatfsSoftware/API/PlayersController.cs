using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TTManschatfsSoftware.Data;
using TTManschatfsSoftware.Data.Repositories;
using TTManschatfsSoftware.Domain;
using TTManschatfsSoftware.DTOs;

namespace TTManschatfsSoftware.API;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.All)]
public class PlayersController : ControllerBase
{
    private readonly PlayerRepository _playerRepository;

    public PlayersController(ApplicationDbContext context)
    {
        _playerRepository = new PlayerRepository(context);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlayerDto>>> GetAll()
    {
        var players = await _playerRepository.GetAllAsync();
        return Ok(players.Select(MapToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlayerDto>> GetById(Guid id)
    {
        var player = await _playerRepository.GetByIdAsync(id);
        if (player == null)
            return NotFound();
        return Ok(MapToDto(player));
    }

    [HttpPost]
    [Authorize(Roles = Roles.ClubManagement)]
    public async Task<ActionResult<PlayerDto>> Create([FromBody] CreatePlayerDto dto)
    {
        var player = new Player
        {
            Name = dto.Name,
            Qttr = dto.Qttr,
            QttrDate = dto.QttrDate,
            Status = dto.Status,
            SeasonNote = dto.SeasonNote
        };

        var created = await _playerRepository.CreateAsync(player);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, MapToDto(created));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ClubManagement)]
    public async Task<ActionResult<PlayerDto>> Update(Guid id, [FromBody] UpdatePlayerDto dto)
    {
        var player = await _playerRepository.GetByIdAsync(id);
        if (player == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Name))
            player.Name = dto.Name;
        if (dto.Qttr.HasValue)
            player.Qttr = dto.Qttr.Value;
        if (dto.QttrDate.HasValue)
            player.QttrDate = dto.QttrDate.Value;
        if (!string.IsNullOrEmpty(dto.Status))
            player.Status = dto.Status;
        if (dto.SeasonNote != null)
            player.SeasonNote = dto.SeasonNote;
        if (dto.TeamId.HasValue)
            player.TeamId = dto.TeamId.Value;

        player.UpdatedAt = DateTime.UtcNow;
        var updated = await _playerRepository.UpdateAsync(player);
        return Ok(MapToDto(updated));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.ClubManagement)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var success = await _playerRepository.DeleteAsync(id);
        if (!success)
            return NotFound();
        return NoContent();
    }

    private static PlayerDto MapToDto(Player player)
    {
        return new PlayerDto
        {
            Id = player.Id,
            Name = player.Name,
            Qttr = player.Qttr,
            QttrDate = player.QttrDate,
            Status = player.Status,
            SeasonNote = player.SeasonNote,
            IsSpvMarked = player.IsSpvMarked,
            TeamId = player.TeamId
        };
    }
}
