namespace TTManschatfsSoftware.Domain;

/// <summary>
/// Represents player availability for a specific fixture.
/// Possible values: "Zusage" (yes), "Absage" (no), "vielleicht" (maybe), "offen" (pending)
/// </summary>
public class Availability
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid PlayerId { get; set; }
    public virtual Player? Player { get; set; }
    
    public Guid FixtureId { get; set; }
    public virtual Fixture? Fixture { get; set; }
    
    public string Status { get; set; } = "offen";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
