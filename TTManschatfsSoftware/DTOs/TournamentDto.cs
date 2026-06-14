namespace TTManschatfsSoftware.DTOs;

public class TournamentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Mode { get; set; } = "Gruppenphase";
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "geplant";
    public Guid? SeasonId { get; set; }
    public List<TournamentParticipantDto> Participants { get; set; } = new();
    public List<TournamentMatchDto> Matches { get; set; } = new();
}

public class CreateTournamentDto
{
    public string Name { get; set; } = string.Empty;
    public string Mode { get; set; } = "Gruppenphase";
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public Guid? SeasonId { get; set; }
}

public class UpdateTournamentDto
{
    public string? Name { get; set; }
    public string? Mode { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Status { get; set; }
    public Guid? SeasonId { get; set; }
}

public class TournamentParticipantDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public int Seed { get; set; }
    public string? GroupName { get; set; }
}

public class AddTournamentParticipantDto
{
    public Guid PlayerId { get; set; }
    public int Seed { get; set; }
    public string? GroupName { get; set; }
}

public class TournamentMatchDto
{
    public Guid Id { get; set; }
    public Guid? Player1Id { get; set; }
    public string? Player1Name { get; set; }
    public Guid? Player2Id { get; set; }
    public string? Player2Name { get; set; }
    public Guid? WinnerPlayerId { get; set; }
    public int Round { get; set; }
    public int MatchNumber { get; set; }
    public string Status { get; set; } = "offen";
    public string? Score { get; set; }
    public DateTime? ScheduledAt { get; set; }
}

public class CreateTournamentMatchDto
{
    public Guid? Player1Id { get; set; }
    public Guid? Player2Id { get; set; }
    public int Round { get; set; } = 1;
    public int MatchNumber { get; set; } = 1;
    public DateTime? ScheduledAt { get; set; }
}

public class UpdateTournamentMatchDto
{
    public Guid? Player1Id { get; set; }
    public Guid? Player2Id { get; set; }
    public Guid? WinnerPlayerId { get; set; }
    public int? Round { get; set; }
    public int? MatchNumber { get; set; }
    public string? Status { get; set; }
    public string? Score { get; set; }
    public DateTime? ScheduledAt { get; set; }
}
