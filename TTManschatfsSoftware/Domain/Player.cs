namespace TTManschatfsSoftware.Domain;

/// <summary>
/// Represents a player in the table tennis club.
/// </summary>
public class Player
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Qualification Table Tennis Rating - player strength
    /// </summary>
    public int Qttr { get; set; }
    
    /// <summary>
    /// Reference date for QTTR (when rating was last updated)
    /// </summary>
    public DateTime QttrDate { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Player status: aktiv, RES, Ersatz, Jugend, passiv
    /// </summary>
    public string Status { get; set; } = "aktiv";
    
    /// <summary>
    /// Season-specific note
    /// </summary>
    public string? SeasonNote { get; set; }
    
    /// <summary>
    /// SPV (Special Position Value) - marked if player is 50+ points above last player of team above
    /// </summary>
    public bool IsSpvMarked { get; set; }
    
    public Guid? TeamId { get; set; }
    public virtual Team? Team { get; set; }
    
    /// <summary>
    /// Players this player prefers to play with
    /// </summary>
    public virtual ICollection<Player> PreferWithPlayers { get; set; } = new List<Player>();
    
    /// <summary>
    /// Players this player wants to avoid
    /// </summary>
    public virtual ICollection<Player> AvoidWithPlayers { get; set; } = new List<Player>();
    
    public virtual ICollection<Block> Blocks { get; set; } = new List<Block>();
    
    public virtual ICollection<Availability> Availabilities { get; set; } = new List<Availability>();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
