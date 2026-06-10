namespace TTManschatfsSoftware.DTOs;

public class SeasonDto
{
    public Guid Id { get; set; }
    public string Label { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool ExcludeHolidays { get; set; }
    public bool ExcludeSchoolBreaks { get; set; }
}

public class CreateSeasonDto
{
    public string Label { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool ExcludeHolidays { get; set; } = true;
    public bool ExcludeSchoolBreaks { get; set; } = true;
}
