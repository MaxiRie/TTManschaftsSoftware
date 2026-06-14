using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.Data;

public static class SvenProjectImporter
{
    public static async Task ImportAsync(ApplicationDbContext context, string jsonPath)
    {
        if (!File.Exists(jsonPath))
            throw new FileNotFoundException("Sven project JSON was not found.", jsonPath);

        await ClearPlanningDataAsync(context);

        using var document = JsonDocument.Parse(await File.ReadAllTextAsync(jsonPath));
        var root = document.RootElement;
        var now = DateTime.UtcNow;
        var teamIds = new Dictionary<string, Guid>();
        var playerIds = new Dictionary<string, Guid>();
        var fixtureIds = new Dictionary<string, Guid>();

        var settings = root.GetProperty("settings");
        var seasonJson = settings.GetProperty("season");
        var season = new Season
        {
            Id = Guid.NewGuid(),
            Label = GetString(seasonJson, "label", "Import"),
            StartDate = ParseDate(GetString(seasonJson, "start", DateTime.UtcNow.ToString("yyyy-MM-dd"))),
            EndDate = ParseDate(GetString(seasonJson, "end", DateTime.UtcNow.ToString("yyyy-MM-dd"))),
            ExcludeHolidays = GetBool(settings, "excludeHolidays", true),
            ExcludeSchoolBreaks = GetBool(settings, "excludeSchoolBreaks", false),
            CreatedAt = now,
            UpdatedAt = now
        };
        context.Seasons.Add(season);

        foreach (var teamJson in root.GetProperty("teams").EnumerateArray())
        {
            var oldId = GetString(teamJson, "id", Guid.NewGuid().ToString());
            var id = Guid.NewGuid();
            teamIds[oldId] = id;
            context.Teams.Add(new Team
            {
                Id = id,
                Name = GetString(teamJson, "name", "Mannschaft"),
                League = GetString(teamJson, "league", ""),
                TargetSize = GetInt(teamJson, "targetSize", 4),
                SeasonId = season.Id,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        foreach (var playerJson in root.GetProperty("players").EnumerateArray())
        {
            var oldId = GetString(playerJson, "id", Guid.NewGuid().ToString());
            var id = Guid.NewGuid();
            var oldTeamId = GetString(playerJson, "teamId", "");
            playerIds[oldId] = id;

            context.Players.Add(new Player
            {
                Id = id,
                Name = GetString(playerJson, "name", "").Trim(),
                Qttr = GetInt(playerJson, "qttr", 0),
                QttrDate = ParseOptionalDate(GetString(playerJson, "qttrDate", "")) ?? now,
                Status = GetString(playerJson, "status", "aktiv"),
                SeasonNote = GetString(playerJson, "seasonNote", ""),
                IsSpvMarked = GetBool(playerJson, "manualSpv", false),
                TeamId = teamIds.TryGetValue(oldTeamId, out var teamId) ? teamId : null,
                CreatedAt = now,
                UpdatedAt = now
            });
        }

        if (settings.TryGetProperty("hallSlots", out var hallSlotsJson))
        {
            foreach (var slotJson in hallSlotsJson.EnumerateArray())
            {
                context.HallSlots.Add(new HallSlot
                {
                    Id = Guid.NewGuid(),
                    SeasonId = season.Id,
                    Weekday = GetInt(slotJson, "weekday", 1),
                    Hall = GetString(slotJson, "hall", ""),
                    Court = GetString(slotJson, "court", ""),
                    Time = string.IsNullOrWhiteSpace(GetString(slotJson, "time", "")) ? "19:30" : GetString(slotJson, "time", "19:30"),
                    CreatedAt = now
                });
            }
        }

        foreach (var fixtureJson in root.GetProperty("fixtures").EnumerateArray())
        {
            var oldTeamId = GetString(fixtureJson, "teamId", "");
            if (!teamIds.TryGetValue(oldTeamId, out var teamId))
                continue;

            var oldId = GetString(fixtureJson, "id", Guid.NewGuid().ToString());
            var fixtureId = Guid.NewGuid();
            fixtureIds[oldId] = fixtureId;
            var confirmedDate = ParseOptionalDate(GetString(fixtureJson, "confirmedDate", ""));
            var startTime = GetString(fixtureJson, "startTime", "");

            context.Fixtures.Add(new Fixture
            {
                Id = fixtureId,
                TeamId = teamId,
                Opponent = GetString(fixtureJson, "opponent", "").Trim(),
                Venue = NormalizeVenue(GetString(fixtureJson, "venue", "Heim")),
                Status = NormalizeStatus(GetString(fixtureJson, "status", "offen")),
                ConfirmedDate = confirmedDate.HasValue ? ApplyTime(confirmedDate.Value, startTime) : null,
                Hall = GetString(fixtureJson, "hall", ""),
                CreatedAt = now,
                UpdatedAt = now
            });

            if (fixtureJson.TryGetProperty("preferredDates", out var preferredDatesJson))
            {
                var priority = 0;
                foreach (var dateJson in preferredDatesJson.EnumerateArray())
                {
                    var date = ParseOptionalDate(dateJson.GetString() ?? "");
                    if (!date.HasValue)
                        continue;

                    context.FixtureDates.Add(new FixtureDate
                    {
                        Id = Guid.NewGuid(),
                        FixtureId = fixtureId,
                        Date = ApplyTime(date.Value, startTime),
                        Priority = priority++
                    });
                }
            }

            if (fixtureJson.TryGetProperty("lineup", out var lineupJson))
            {
                var position = 1;
                foreach (var playerIdJson in lineupJson.EnumerateArray())
                {
                    var oldPlayerId = playerIdJson.GetString() ?? "";
                    if (!playerIds.TryGetValue(oldPlayerId, out var playerId))
                        continue;

                    context.LineupEntries.Add(new LineupEntry
                    {
                        Id = Guid.NewGuid(),
                        FixtureId = fixtureId,
                        PlayerId = playerId,
                        Position = position++,
                        IsSubstitute = false
                    });
                }
            }
        }

        foreach (var blockJson in root.GetProperty("blocks").EnumerateArray())
        {
            var oldPlayerId = GetString(blockJson, "playerId", "");
            var date = ParseOptionalDate(GetString(blockJson, "date", ""));
            if (!date.HasValue || !playerIds.TryGetValue(oldPlayerId, out var playerId))
                continue;

            context.Blocks.Add(new Block
            {
                Id = Guid.NewGuid(),
                PlayerId = playerId,
                Date = date.Value,
                Reason = GetString(blockJson, "reason", "Sperrtermin"),
                CreatedAt = now
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task ClearPlanningDataAsync(ApplicationDbContext context)
    {
        await context.TournamentMatches.ExecuteDeleteAsync();
        await context.TournamentParticipants.ExecuteDeleteAsync();
        await context.Tournaments.ExecuteDeleteAsync();
        await context.Availabilities.ExecuteDeleteAsync();
        await context.LineupEntries.ExecuteDeleteAsync();
        await context.FixtureDates.ExecuteDeleteAsync();
        await context.Blocks.ExecuteDeleteAsync();
        await context.Fixtures.ExecuteDeleteAsync();
        await context.HallSlots.ExecuteDeleteAsync();
        await context.Players.ExecuteDeleteAsync();
        await context.Teams.ExecuteDeleteAsync();
        await context.Seasons.ExecuteDeleteAsync();
    }

    private static string GetString(JsonElement element, string name, string fallback)
    {
        return element.TryGetProperty(name, out var value) && value.ValueKind != JsonValueKind.Null
            ? value.ToString()
            : fallback;
    }

    private static int GetInt(JsonElement element, string name, int fallback)
    {
        return element.TryGetProperty(name, out var value) && value.TryGetInt32(out var result) ? result : fallback;
    }

    private static bool GetBool(JsonElement element, string name, bool fallback)
    {
        return element.TryGetProperty(name, out var value) && value.ValueKind is JsonValueKind.True or JsonValueKind.False
            ? value.GetBoolean()
            : fallback;
    }

    private static DateTime ParseDate(string value)
    {
        return DateTime.SpecifyKind(DateTime.Parse(value).Date, DateTimeKind.Utc);
    }

    private static DateTime? ParseOptionalDate(string value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : ParseDate(value);
    }

    private static DateTime ApplyTime(DateTime date, string time)
    {
        if (TimeSpan.TryParse(time, out var parsed))
            return DateTime.SpecifyKind(date.Date.Add(parsed), DateTimeKind.Utc);

        return date;
    }

    private static string NormalizeVenue(string value)
    {
        return value is "Auswaerts" or "Auswärts" ? "Auswaerts" : "Heim";
    }

    private static string NormalizeStatus(string value)
    {
        return value is "bestaetigt" or "bestätigt" ? "bestaetigt" : value;
    }
}
