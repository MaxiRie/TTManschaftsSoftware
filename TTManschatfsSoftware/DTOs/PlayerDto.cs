namespace TTManschatfsSoftware.DTOs;

public class PlayerDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Qttr { get; set; }
    public DateTime QttrDate { get; set; }
    public string Status { get; set; } = "aktiv";
    public string? SeasonNote { get; set; }
    public bool IsSpvMarked { get; set; }
    public Guid? TeamId { get; set; }
}

public class CreatePlayerDto
{
    public string Name { get; set; } = string.Empty;
    public int Qttr { get; set; }
    public DateTime QttrDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "aktiv";
    public string? SeasonNote { get; set; }
}

public class UpdatePlayerDto
{
    public string? Name { get; set; }
    public int? Qttr { get; set; }
    public DateTime? QttrDate { get; set; }
    public string? Status { get; set; }
    public string? SeasonNote { get; set; }
    public Guid? TeamId { get; set; }
}
