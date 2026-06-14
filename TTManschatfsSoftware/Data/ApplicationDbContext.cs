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
    public DbSet<AppUser> AppUsers { get; set; }
    public DbSet<AppRole> AppRoles { get; set; }
    public DbSet<AppUserRole> AppUserRoles { get; set; }
    public DbSet<Tournament> Tournaments { get; set; }
    public DbSet<TournamentParticipant> TournamentParticipants { get; set; }
    public DbSet<TournamentMatch> TournamentMatches { get; set; }

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

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.UserName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.HasIndex(u => u.UserName).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.PlayerId);
            entity.HasOne(u => u.Player)
                .WithMany()
                .HasForeignKey(u => u.PlayerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<AppRole>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.Name).IsRequired().HasMaxLength(50);
            entity.Property(r => r.Description).HasMaxLength(256);
            entity.HasIndex(r => r.Name).IsUnique();
            entity.HasData(
                new AppRole
                {
                    Id = Guid.Parse("7a34b7f4-3c0c-4a84-b2d5-31e8060dc56a"),
                    Name = "Admin",
                    Description = "Vollzugriff auf Verwaltung, Benutzer und Stammdaten"
                },
                new AppRole
                {
                    Id = Guid.Parse("9f5b5611-cb77-43ac-a4e2-df39fbc30a8c"),
                    Name = "Mannschaftsfuehrer",
                    Description = "Punktspiele der eigenen Mannschaft anlegen und bearbeiten"
                },
                new AppRole
                {
                    Id = Guid.Parse("bfc0208f-3408-4a68-a5e5-321677f55eb8"),
                    Name = "Spieler",
                    Description = "Kalender, Punktspiele, Sperrtermine, Turniere und Mannschaften ansehen"
                },
                new AppRole
                {
                    Id = Guid.Parse("a9e78f7c-88f5-4b5d-bd58-5340371d25f2"),
                    Name = "Vereinsleiter",
                    Description = "Spieler, Saisonplanung, Uebersicht und Mannschaften verwalten"
                },
                new AppRole
                {
                    Id = Guid.Parse("a6788e41-1ec4-4c1f-8626-1771ac729fed"),
                    Name = "Turnierleiter",
                    Description = "Turniere erstellen und verwalten"
                });
        });

        modelBuilder.Entity<AppUserRole>(entity =>
        {
            entity.HasKey(ur => new { ur.UserId, ur.RoleId });
            entity.HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Tournament>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(256);
            entity.Property(t => t.Mode).IsRequired().HasMaxLength(50).HasDefaultValue("Gruppenphase");
            entity.Property(t => t.Status).IsRequired().HasMaxLength(50).HasDefaultValue("geplant");
            entity.HasIndex(t => t.SeasonId);
            entity.HasOne(t => t.Season)
                .WithMany()
                .HasForeignKey(t => t.SeasonId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<TournamentParticipant>(entity =>
        {
            entity.HasKey(tp => tp.Id);
            entity.Property(tp => tp.GroupName).HasMaxLength(100);
            entity.HasIndex(tp => new { tp.TournamentId, tp.PlayerId }).IsUnique();
            entity.HasIndex(tp => tp.PlayerId);
            entity.HasOne(tp => tp.Tournament)
                .WithMany(t => t.Participants)
                .HasForeignKey(tp => tp.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(tp => tp.Player)
                .WithMany()
                .HasForeignKey(tp => tp.PlayerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TournamentMatch>(entity =>
        {
            entity.HasKey(tm => tm.Id);
            entity.Property(tm => tm.Status).IsRequired().HasMaxLength(50).HasDefaultValue("offen");
            entity.Property(tm => tm.Score).HasMaxLength(100);
            entity.HasIndex(tm => tm.TournamentId);
            entity.HasIndex(tm => tm.Player1Id);
            entity.HasIndex(tm => tm.Player2Id);
            entity.HasIndex(tm => tm.WinnerPlayerId);
            entity.HasIndex(tm => new { tm.TournamentId, tm.Round, tm.MatchNumber }).IsUnique();
            entity.HasOne(tm => tm.Tournament)
                .WithMany(t => t.Matches)
                .HasForeignKey(tm => tm.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(tm => tm.Player1)
                .WithMany()
                .HasForeignKey(tm => tm.Player1Id)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(tm => tm.Player2)
                .WithMany()
                .HasForeignKey(tm => tm.Player2Id)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(tm => tm.WinnerPlayer)
                .WithMany()
                .HasForeignKey(tm => tm.WinnerPlayerId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
