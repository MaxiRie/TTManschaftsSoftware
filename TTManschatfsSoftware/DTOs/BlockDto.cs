namespace TTManschatfsSoftware.DTOs;

public class BlockDto
{
    public Guid Id { get; set; }
    public Guid PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}
