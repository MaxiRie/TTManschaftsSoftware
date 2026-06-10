namespace TTManschatfsSoftware.DTOs;

public class TeamDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string League { get; set; } = string.Empty;
    public int TargetSize { get; set; }
    public List<PlayerDto> Players { get; set; } = new();
    public Guid? SeasonId { get; set; }
}

public class CreateTeamDto
{
    public string Name { get; set; } = string.Empty;
    public string League { get; set; } = string.Empty;
    public int TargetSize { get; set; } = 6;
    public Guid? SeasonId { get; set; }
}

public class UpdateTeamDto
{
    public string? Name { get; set; }
    public string? League { get; set; }
    public int? TargetSize { get; set; }
}
