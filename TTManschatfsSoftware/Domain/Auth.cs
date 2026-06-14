namespace TTManschatfsSoftware.Domain;

public class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public Guid? PlayerId { get; set; }
    public virtual Player? Player { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public virtual ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
}

public class AppRole
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public virtual ICollection<AppUserRole> UserRoles { get; set; } = new List<AppUserRole>();
}

public class AppUserRole
{
    public Guid UserId { get; set; }
    public virtual AppUser? User { get; set; }
    public Guid RoleId { get; set; }
    public virtual AppRole? Role { get; set; }
}
