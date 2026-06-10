namespace TTManschatfsSoftware.Domain;

/// <summary>
/// Represents a season period.
/// </summary>
public class Season
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    /// <summary>
    /// Season label (e.g., "Rückrunde 25/26")
    /// </summary>
    public string Label { get; set; } = string.Empty;
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    /// <summary>
    /// Exclude holidays from possible fixture dates
    /// </summary>
    public bool ExcludeHolidays { get; set; } = true;
    
    /// <summary>
    /// Exclude school breaks from possible fixture dates
    /// </summary>
    public bool ExcludeSchoolBreaks { get; set; } = true;
    
    public virtual ICollection<Team> Teams { get; set; } = new List<Team>();
    public virtual ICollection<HallSlot> HallSlots { get; set; } = new List<HallSlot>();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
