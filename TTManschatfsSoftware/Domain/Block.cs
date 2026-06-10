namespace TTManschatfsSoftware.Domain;

/// <summary>
/// Represents a blocked date for a player.
/// </summary>
public class Block
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid PlayerId { get; set; }
    public virtual Player? Player { get; set; }
    
    public DateTime Date { get; set; }
    
    public string? Reason { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
