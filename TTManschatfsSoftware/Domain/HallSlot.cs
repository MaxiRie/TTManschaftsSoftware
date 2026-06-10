namespace TTManschatfsSoftware.Domain;

/// <summary>
/// Represents a hall time slot for team practice/matches.
/// </summary>
public class HallSlot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SeasonId { get; set; }
    public virtual Season? Season { get; set; }
    
    /// <summary>
    /// Day of week (0=Monday, 6=Sunday)
    /// </summary>
    public int Weekday { get; set; }
    
    public string Hall { get; set; } = string.Empty;
    public string Court { get; set; } = string.Empty;
    
    /// <summary>
    /// Time in HH:mm format (e.g., "19:30")
    /// </summary>
    public string Time { get; set; } = "19:30";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
