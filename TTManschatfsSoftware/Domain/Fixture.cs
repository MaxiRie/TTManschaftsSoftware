namespace TTManschatfsSoftware.Domain;

/// <summary>
/// Represents a match/fixture to be played.
/// </summary>
public class Fixture
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid TeamId { get; set; }
    public virtual Team? Team { get; set; }
    
    /// <summary>
    /// Opponent team name
    /// </summary>
    public string Opponent { get; set; } = string.Empty;
    
    /// <summary>
    /// Venue: "Heim" (Home) or "Auswärts" (Away)
    /// </summary>
    public string Venue { get; set; } = "Heim";
    
    /// <summary>
    /// Status: "offen" (open), "geplant" (planned), "bestätigt" (confirmed)
    /// </summary>
    public string Status { get; set; } = "offen";
    
    /// <summary>
    /// Preferred dates for scheduling
    /// </summary>
    public virtual ICollection<FixtureDate> PreferredDates { get; set; } = new List<FixtureDate>();
    
    /// <summary>
    /// Confirmed date and time
    /// </summary>
    public DateTime? ConfirmedDate { get; set; }
    
    /// <summary>
    /// Hall name
    /// </summary>
    public string? Hall { get; set; }
    
    /// <summary>
    /// Suggested/confirmed lineup of players
    /// </summary>
    public virtual ICollection<LineupEntry> Lineup { get; set; } = new List<LineupEntry>();
    
    /// <summary>
    /// Player availabilities for this fixture
    /// </summary>
    public virtual ICollection<Availability> Availabilities { get; set; } = new List<Availability>();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Possible date for a fixture.
/// </summary>
public class FixtureDate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FixtureId { get; set; }
    public virtual Fixture? Fixture { get; set; }
    
    public DateTime Date { get; set; }
    public int Priority { get; set; }
}

/// <summary>
/// Player in a fixture lineup.
/// </summary>
public class LineupEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FixtureId { get; set; }
    public virtual Fixture? Fixture { get; set; }
    
    public Guid PlayerId { get; set; }
    public virtual Player? Player { get; set; }
    
    public int Position { get; set; }
    public bool IsSubstitute { get; set; }
}
