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
public class TournamentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TournamentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TournamentDto>>> GetAll()
    {
        var query = Query();
        if (!User.IsTournamentManager())
        {
            var playerId = User.PlayerId();
            query = query.Where(t => playerId.HasValue && t.Participants.Any(p => p.PlayerId == playerId.Value));
        }

        var tournaments = await query.OrderByDescending(t => t.StartDate)
            .ToListAsync();

        return Ok(tournaments.Select(MapToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TournamentDto>> GetById(Guid id)
    {
        var tournament = await Query().FirstOrDefaultAsync(t => t.Id == id);
        if (tournament == null)
            return NotFound();

        if (!User.IsTournamentManager() && !tournament.Participants.Any(participant => participant.PlayerId == User.PlayerId()))
            return Forbid();

        return Ok(MapToDto(tournament));
    }

    [Authorize(Roles = Roles.TournamentManagement)]
    [HttpPost]
    public async Task<ActionResult<TournamentDto>> Create([FromBody] CreateTournamentDto dto)
    {
        var tournament = new Tournament
        {
            Name = dto.Name,
            Mode = dto.Mode,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            SeasonId = dto.SeasonId
        };

        _context.Tournaments.Add(tournament);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = tournament.Id }, MapToDto(tournament));
    }

    [Authorize(Roles = Roles.TournamentManagement)]
    [HttpPut("{id}")]
    public async Task<ActionResult<TournamentDto>> Update(Guid id, [FromBody] UpdateTournamentDto dto)
    {
        var tournament = await _context.Tournaments.FindAsync(id);
        if (tournament == null)
            return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.Name))
            tournament.Name = dto.Name;
        if (!string.IsNullOrWhiteSpace(dto.Mode))
            tournament.Mode = dto.Mode;
        if (dto.StartDate.HasValue)
            tournament.StartDate = dto.StartDate.Value;
        if (dto.EndDate.HasValue)
            tournament.EndDate = dto.EndDate;
        if (!string.IsNullOrWhiteSpace(dto.Status))
            tournament.Status = dto.Status;
        if (dto.SeasonId.HasValue)
            tournament.SeasonId = dto.SeasonId;

        tournament.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetById(id);
    }

    [Authorize(Roles = Roles.TournamentManagement)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var tournament = await _context.Tournaments.FindAsync(id);
        if (tournament == null)
            return NotFound();

        _context.Tournaments.Remove(tournament);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = Roles.TournamentManagement)]
    [HttpPost("{id}/participants")]
    public async Task<ActionResult<TournamentParticipantDto>> AddParticipant(Guid id, [FromBody] AddTournamentParticipantDto dto)
    {
        if (!await _context.Tournaments.AnyAsync(t => t.Id == id))
            return NotFound();

        if (!await _context.Players.AnyAsync(p => p.Id == dto.PlayerId))
            return BadRequest("Spieler existiert nicht.");

        if (await _context.TournamentParticipants.AnyAsync(tp => tp.TournamentId == id && tp.PlayerId == dto.PlayerId))
            return Conflict("Spieler ist bereits im Turnier.");

        var participant = new TournamentParticipant
        {
            TournamentId = id,
            PlayerId = dto.PlayerId,
            Seed = dto.Seed,
            GroupName = dto.GroupName
        };

        _context.TournamentParticipants.Add(participant);
        await _context.SaveChangesAsync();

        var saved = await _context.TournamentParticipants
            .Include(tp => tp.Player)
            .FirstAsync(tp => tp.Id == participant.Id);

        return Ok(MapParticipant(saved));
    }

    [Authorize(Roles = Roles.TournamentManagement)]
    [HttpDelete("{id}/participants/{participantId}")]
    public async Task<IActionResult> RemoveParticipant(Guid id, Guid participantId)
    {
        var participant = await _context.TournamentParticipants
            .FirstOrDefaultAsync(tp => tp.TournamentId == id && tp.Id == participantId);

        if (participant == null)
            return NotFound();

        _context.TournamentParticipants.Remove(participant);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = Roles.TournamentManagement)]
    [HttpPost("{id}/matches")]
    public async Task<ActionResult<TournamentMatchDto>> CreateMatch(Guid id, [FromBody] CreateTournamentMatchDto dto)
    {
        if (!await _context.Tournaments.AnyAsync(t => t.Id == id))
            return NotFound();

        var match = new TournamentMatch
        {
            TournamentId = id,
            Player1Id = dto.Player1Id,
            Player2Id = dto.Player2Id,
            Round = dto.Round,
            MatchNumber = dto.MatchNumber,
            ScheduledAt = dto.ScheduledAt
        };

        _context.TournamentMatches.Add(match);
        await _context.SaveChangesAsync();

        var saved = await QueryMatch().FirstAsync(tm => tm.Id == match.Id);
        return Ok(MapMatch(saved));
    }

    [Authorize(Roles = Roles.TournamentManagement)]
    [HttpPut("{id}/matches/{matchId}")]
    public async Task<ActionResult<TournamentMatchDto>> UpdateMatch(Guid id, Guid matchId, [FromBody] UpdateTournamentMatchDto dto)
    {
        var match = await _context.TournamentMatches
            .FirstOrDefaultAsync(tm => tm.TournamentId == id && tm.Id == matchId);

        if (match == null)
            return NotFound();

        if (dto.Player1Id.HasValue)
            match.Player1Id = dto.Player1Id;
        if (dto.Player2Id.HasValue)
            match.Player2Id = dto.Player2Id;
        if (dto.WinnerPlayerId.HasValue)
            match.WinnerPlayerId = dto.WinnerPlayerId;
        if (dto.Round.HasValue)
            match.Round = dto.Round.Value;
        if (dto.MatchNumber.HasValue)
            match.MatchNumber = dto.MatchNumber.Value;
        if (!string.IsNullOrWhiteSpace(dto.Status))
            match.Status = dto.Status;
        if (dto.Score != null)
            match.Score = dto.Score;
        if (dto.ScheduledAt.HasValue)
            match.ScheduledAt = dto.ScheduledAt;

        match.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var saved = await QueryMatch().FirstAsync(tm => tm.Id == match.Id);
        return Ok(MapMatch(saved));
    }

    private IQueryable<Tournament> Query()
    {
        return _context.Tournaments
            .Include(t => t.Participants)
                .ThenInclude(tp => tp.Player)
            .Include(t => t.Matches)
                .ThenInclude(tm => tm.Player1)
            .Include(t => t.Matches)
                .ThenInclude(tm => tm.Player2);
    }

    private IQueryable<TournamentMatch> QueryMatch()
    {
        return _context.TournamentMatches
            .Include(tm => tm.Player1)
            .Include(tm => tm.Player2);
    }

    private static TournamentDto MapToDto(Tournament tournament)
    {
        return new TournamentDto
        {
            Id = tournament.Id,
            Name = tournament.Name,
            Mode = tournament.Mode,
            StartDate = tournament.StartDate,
            EndDate = tournament.EndDate,
            Status = tournament.Status,
            SeasonId = tournament.SeasonId,
            Participants = tournament.Participants.OrderBy(tp => tp.Seed).Select(MapParticipant).ToList(),
            Matches = tournament.Matches.OrderBy(tm => tm.Round).ThenBy(tm => tm.MatchNumber).Select(MapMatch).ToList()
        };
    }

    private static TournamentParticipantDto MapParticipant(TournamentParticipant participant)
    {
        return new TournamentParticipantDto
        {
            Id = participant.Id,
            PlayerId = participant.PlayerId,
            PlayerName = participant.Player?.Name ?? string.Empty,
            Seed = participant.Seed,
            GroupName = participant.GroupName
        };
    }

    private static TournamentMatchDto MapMatch(TournamentMatch match)
    {
        return new TournamentMatchDto
        {
            Id = match.Id,
            Player1Id = match.Player1Id,
            Player1Name = match.Player1?.Name,
            Player2Id = match.Player2Id,
            Player2Name = match.Player2?.Name,
            WinnerPlayerId = match.WinnerPlayerId,
            Round = match.Round,
            MatchNumber = match.MatchNumber,
            Status = match.Status,
            Score = match.Score,
            ScheduledAt = match.ScheduledAt
        };
    }
}
