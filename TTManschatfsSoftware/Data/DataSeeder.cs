using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.Data;

public static class DataSeeder
{
    public static async Task SeedDataAsync(ApplicationDbContext context)
    {
        // Only seed if database is empty
        if (context.Seasons.Any())
            return;

        // Create Season
        var season = new Season
        {
            Id = Guid.NewGuid(),
            Label = "2025/2026",
            StartDate = new DateTime(2025, 9, 1, 0, 0, 0, DateTimeKind.Utc),
            EndDate = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc)
        };
        context.Seasons.Add(season);
        await context.SaveChangesAsync();

        // Create Teams
        var team1 = new Team
        {
            Id = Guid.NewGuid(),
            Name = "Mannschaft 1",
            League = "Bundesliga",
            SeasonId = season.Id
        };

        var team2 = new Team
        {
            Id = Guid.NewGuid(),
            Name = "Mannschaft 2",
            League = "Oberliga",
            SeasonId = season.Id
        };

        context.Teams.AddRange(team1, team2);
        await context.SaveChangesAsync();

        // Create Players for Team 1
        var players1 = new List<Player>
        {
            new() { Id = Guid.NewGuid(), Name = "Max Müller", Status = "aktiv", TeamId = team1.Id, Qttr = 2150, IsSpvMarked = false },
            new() { Id = Guid.NewGuid(), Name = "Anna Schmidt", Status = "aktiv", TeamId = team1.Id, Qttr = 2090, IsSpvMarked = false },
            new() { Id = Guid.NewGuid(), Name = "Klaus Weber", Status = "aktiv", TeamId = team1.Id, Qttr = 1950, IsSpvMarked = true },
            new() { Id = Guid.NewGuid(), Name = "Julia Fischer", Status = "aktiv", TeamId = team1.Id, Qttr = 1880, IsSpvMarked = false },
            new() { Id = Guid.NewGuid(), Name = "Peter Bauer", Status = "RES", TeamId = team1.Id, Qttr = 1750, IsSpvMarked = false },
            new() { Id = Guid.NewGuid(), Name = "Sandra Meyer", Status = "aktiv", TeamId = team1.Id, Qttr = 2010, IsSpvMarked = false },
        };

        // Create Players for Team 2
        var players2 = new List<Player>
        {
            new() { Id = Guid.NewGuid(), Name = "Thomas Richter", Status = "aktiv", TeamId = team2.Id, Qttr = 2200, IsSpvMarked = false },
            new() { Id = Guid.NewGuid(), Name = "Linda Wagner", Status = "aktiv", TeamId = team2.Id, Qttr = 2040, IsSpvMarked = false },
            new() { Id = Guid.NewGuid(), Name = "Michael Kaiser", Status = "aktiv", TeamId = team2.Id, Qttr = 1920, IsSpvMarked = true },
            new() { Id = Guid.NewGuid(), Name = "Katrin Schulz", Status = "aktiv", TeamId = team2.Id, Qttr = 1860, IsSpvMarked = false },
            new() { Id = Guid.NewGuid(), Name = "Robert Hoffmann", Status = "RES", TeamId = team2.Id, Qttr = 1720, IsSpvMarked = false },
        };

        var allPlayers = players1.Concat(players2).ToList();
        context.Players.AddRange(allPlayers);
        await context.SaveChangesAsync();

        // Create Hall Slots
        var hallSlots = new List<HallSlot>
        {
            new() { Id = Guid.NewGuid(), Hall = "Sporthalle Zentrum", Court = "1", Time = "19:30", SeasonId = season.Id },
            new() { Id = Guid.NewGuid(), Hall = "Sporthalle Zentrum", Court = "2", Time = "19:30", SeasonId = season.Id },
            new() { Id = Guid.NewGuid(), Hall = "Sporthalle Nord", Court = "1", Time = "20:00", SeasonId = season.Id },
            new() { Id = Guid.NewGuid(), Hall = "Sporthalle Süd", Court = "1", Time = "19:15", SeasonId = season.Id },
        };
        context.HallSlots.AddRange(hallSlots);
        await context.SaveChangesAsync();

        // Create Fixtures
        var fixtures = new List<Fixture>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TeamId = team1.Id,
                Opponent = "TTC Berlin",
                Venue = "Heim",
                ConfirmedDate = new DateTime(2025, 10, 15, 19, 30, 0, DateTimeKind.Utc),
                Status = "offen",
                Hall = "Sporthalle Zentrum"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TeamId = team1.Id,
                Opponent = "TTC München",
                Venue = "Auswärts",
                ConfirmedDate = new DateTime(2025, 10, 22, 19, 30, 0, DateTimeKind.Utc),
                Status = "offen"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TeamId = team2.Id,
                Opponent = "TTC Hamburg",
                Venue = "Heim",
                ConfirmedDate = new DateTime(2025, 10, 16, 20, 0, 0, DateTimeKind.Utc),
                Status = "offen",
                Hall = "Sporthalle Nord"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TeamId = team2.Id,
                Opponent = "TTC Frankfurt",
                Venue = "Auswärts",
                ConfirmedDate = new DateTime(2025, 10, 23, 19, 15, 0, DateTimeKind.Utc),
                Status = "offen"
            },
        };
        context.Fixtures.AddRange(fixtures);
        await context.SaveChangesAsync();

        // Create Availabilities for players
        foreach (var fixture in fixtures)
        {
            var fixtureTeamPlayers = fixture.Team!.Players.Where(p => p.Status == "aktiv" || p.Status == "RES").Take(4).ToList();
            
            foreach (var player in fixtureTeamPlayers)
            {
                var availability = new Availability
                {
                    Id = Guid.NewGuid(),
                    PlayerId = player.Id,
                    FixtureId = fixture.Id,
                    Status = Random.Shared.Next(0, 3) switch
                    {
                        0 => "Zusage",
                        1 => "Absage",
                        _ => "offen"
                    }
                };
                context.Availabilities.Add(availability);
            }
        }
        await context.SaveChangesAsync();

        // Create Blocks (Sperrtermine)
        var player1 = allPlayers.First();
        var blocks = new List<Block>
        {
            new() { Id = Guid.NewGuid(), PlayerId = player1.Id, Date = new DateTime(2025, 10, 15, 0, 0, 0, DateTimeKind.Utc), Reason = "Urlaub" },
            new() { Id = Guid.NewGuid(), PlayerId = allPlayers[1].Id, Date = new DateTime(2025, 10, 22, 0, 0, 0, DateTimeKind.Utc), Reason = "Geschäftstermin" },
        };
        context.Blocks.AddRange(blocks);
        await context.SaveChangesAsync();

        // Create Fixture Dates (preferred dates)
        foreach (var fixture in fixtures)
        {
            var fixtureDates = new List<FixtureDate>
            {
                new() { Id = Guid.NewGuid(), FixtureId = fixture.Id, Date = fixture.ConfirmedDate!.Value, Priority = 1 },
                new() { Id = Guid.NewGuid(), FixtureId = fixture.Id, Date = fixture.ConfirmedDate!.Value.AddDays(1), Priority = 2 },
            };
            context.FixtureDates.AddRange(fixtureDates);
        }
        await context.SaveChangesAsync();
    }
}
