namespace TTManschatfsSoftware.DTOs;

public class FixtureDto
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public string Opponent { get; set; } = string.Empty;
    public string Venue { get; set; } = "Heim";
    public string Status { get; set; } = "offen";
    public DateTime? ConfirmedDate { get; set; }
    public string? Hall { get; set; }
    public List<DateTime> PreferredDates { get; set; } = new();
    public List<LineupEntryDto> Lineup { get; set; } = new();
}

public class CreateFixtureDto
{
    public Guid TeamId { get; set; }
    public string Opponent { get; set; } = string.Empty;
    public string Venue { get; set; } = "Heim";
    public List<DateTime> PreferredDates { get; set; } = new();
}

public class UpdateFixtureDto
{
    public string? Opponent { get; set; }
    public string? Venue { get; set; }
    public string? Status { get; set; }
    public DateTime? ConfirmedDate { get; set; }
    public string? Hall { get; set; }
}

public class LineupEntryDto
{
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public int Position { get; set; }
    public bool IsSubstitute { get; set; }
}
