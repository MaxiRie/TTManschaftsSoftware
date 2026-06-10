using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Player> Players { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<Fixture> Fixtures { get; set; }
    public DbSet<FixtureDate> FixtureDates { get; set; }
    public DbSet<LineupEntry> LineupEntries { get; set; }
    public DbSet<Block> Blocks { get; set; }
    public DbSet<Season> Seasons { get; set; }
    public DbSet<HallSlot> HallSlots { get; set; }
    public DbSet<Availability> Availabilities { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Player configurations
        modelBuilder.Entity<Player>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(256);
            entity.Property(p => p.Status).IsRequired().HasMaxLength(50).HasDefaultValue("aktiv");
            entity.HasIndex(p => p.TeamId);
            entity.HasOne(p => p.Team)
                .WithMany(t => t.Players)
                .HasForeignKey(p => p.TeamId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Team configurations
        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(256);
            entity.Property(t => t.League).IsRequired().HasMaxLength(100);
            entity.HasIndex(t => t.SeasonId);
            entity.HasOne(t => t.Season)
                .WithMany(s => s.Teams)
                .HasForeignKey(t => t.SeasonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Fixture configurations
        modelBuilder.Entity<Fixture>(entity =>
        {
            entity.HasKey(f => f.Id);
            entity.Property(f => f.Opponent).IsRequired().HasMaxLength(256);
            entity.Property(f => f.Venue).IsRequired().HasMaxLength(50).HasDefaultValue("Heim");
            entity.Property(f => f.Status).IsRequired().HasMaxLength(50).HasDefaultValue("offen");
            entity.HasIndex(f => f.TeamId);
            entity.HasOne(f => f.Team)
                .WithMany(t => t.Fixtures)
                .HasForeignKey(f => f.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // FixtureDate configurations
        modelBuilder.Entity<FixtureDate>(entity =>
        {
            entity.HasKey(fd => fd.Id);
            entity.HasIndex(fd => fd.FixtureId);
            entity.HasOne(fd => fd.Fixture)
                .WithMany(f => f.PreferredDates)
                .HasForeignKey(fd => fd.FixtureId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // LineupEntry configurations
        modelBuilder.Entity<LineupEntry>(entity =>
        {
            entity.HasKey(le => le.Id);
            entity.HasIndex(le => le.FixtureId);
            entity.HasIndex(le => le.PlayerId);
            entity.HasOne(le => le.Fixture)
                .WithMany(f => f.Lineup)
                .HasForeignKey(le => le.FixtureId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(le => le.Player)
                .WithMany()
                .HasForeignKey(le => le.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Block configurations
        modelBuilder.Entity<Block>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.HasIndex(b => b.PlayerId);
            entity.HasIndex(b => new { b.PlayerId, b.Date });
            entity.HasOne(b => b.Player)
                .WithMany(p => p.Blocks)
                .HasForeignKey(b => b.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Season configurations
        modelBuilder.Entity<Season>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Label).IsRequired().HasMaxLength(256);
        });

        // HallSlot configurations
        modelBuilder.Entity<HallSlot>(entity =>
        {
            entity.HasKey(hs => hs.Id);
            entity.Property(hs => hs.Hall).IsRequired().HasMaxLength(256);
            entity.Property(hs => hs.Court).IsRequired().HasMaxLength(50);
            entity.Property(hs => hs.Time).IsRequired().HasMaxLength(10);
            entity.HasIndex(hs => hs.SeasonId);
            entity.HasOne(hs => hs.Season)
                .WithMany(s => s.HallSlots)
                .HasForeignKey(hs => hs.SeasonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Availability configurations
        modelBuilder.Entity<Availability>(entity =>
        {
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Status).IsRequired().HasMaxLength(50).HasDefaultValue("offen");
            entity.HasIndex(a => a.PlayerId);
            entity.HasIndex(a => a.FixtureId);
            entity.HasIndex(a => new { a.PlayerId, a.FixtureId }).IsUnique();
            entity.HasOne(a => a.Player)
                .WithMany(p => p.Availabilities)
                .HasForeignKey(a => a.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(a => a.Fixture)
                .WithMany(f => f.Availabilities)
                .HasForeignKey(a => a.FixtureId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
