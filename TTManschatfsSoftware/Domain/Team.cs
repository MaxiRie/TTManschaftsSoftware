namespace TTManschatfsSoftware.Domain;

/// <summary>
/// Represents a team for a season.
/// </summary>
public class Team
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// League level from TTVN (Niedersachsenliga to 5. Kreisklasse)
    /// </summary>
    public string League { get; set; } = string.Empty;
    
    /// <summary>
    /// Target size for the team
    /// </summary>
    public int TargetSize { get; set; } = 6;
    
    /// <summary>
    /// Order of players in the lineup (QTTR descending)
    /// </summary>
    public virtual ICollection<Player> Players { get; set; } = new List<Player>();
    
    public virtual ICollection<Fixture> Fixtures { get; set; } = new List<Fixture>();
    
    public Guid? SeasonId { get; set; }
    public virtual Season? Season { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
