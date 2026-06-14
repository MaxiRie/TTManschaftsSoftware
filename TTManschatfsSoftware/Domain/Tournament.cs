namespace TTManschatfsSoftware.Domain;

public class Tournament
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Mode { get; set; } = "Gruppenphase";
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "geplant";
    public Guid? SeasonId { get; set; }
    public virtual Season? Season { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public virtual ICollection<TournamentParticipant> Participants { get; set; } = new List<TournamentParticipant>();
    public virtual ICollection<TournamentMatch> Matches { get; set; } = new List<TournamentMatch>();
}

public class TournamentParticipant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TournamentId { get; set; }
    public virtual Tournament? Tournament { get; set; }
    public Guid PlayerId { get; set; }
    public virtual Player? Player { get; set; }
    public int Seed { get; set; }
    public string? GroupName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class TournamentMatch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TournamentId { get; set; }
    public virtual Tournament? Tournament { get; set; }
    public Guid? Player1Id { get; set; }
    public virtual Player? Player1 { get; set; }
    public Guid? Player2Id { get; set; }
    public virtual Player? Player2 { get; set; }
    public Guid? WinnerPlayerId { get; set; }
    public virtual Player? WinnerPlayer { get; set; }
    public int Round { get; set; } = 1;
    public int MatchNumber { get; set; } = 1;
    public string Status { get; set; } = "offen";
    public string? Score { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
