using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.Services;

/// <summary>
/// Service for calculating and rating calendar availability for team training sessions.
/// Color coding:
/// - Green (4+ players available)
/// - Yellow (3 players available)
/// - Red (0-2 players available)
/// </summary>
public class AvailabilityCalculatorService
{
    public enum AvailabilityRating
    {
        Green,  // 4+ players
        Yellow, // 3 players
        Red     // 0-2 players
    }

    public AvailabilityRating RateAvailability(Team team, DateTime date, List<Block> blocks)
    {
        var availableCount = 0;

        foreach (var player in team.Players)
        {
            if (player.Status is "aktiv" or "RES" && !IsPlayerBlocked(player, date, blocks))
            {
                availableCount++;
            }
        }

        return availableCount switch
        {
            >= 4 => AvailabilityRating.Green,
            3 => AvailabilityRating.Yellow,
            _ => AvailabilityRating.Red
        };
    }

    public List<(DateTime Date, AvailabilityRating Rating)> RateDateRange(
        Team team,
        DateTime startDate,
        DateTime endDate,
        List<Block> blocks)
    {
        var ratings = new List<(DateTime, AvailabilityRating)>();

        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            var rating = RateAvailability(team, date, blocks);
            ratings.Add((date, rating));
        }

        return ratings;
    }

    private bool IsPlayerBlocked(Player player, DateTime date, List<Block> blocks)
    {
        return blocks.Any(b =>
            b.PlayerId == player.Id &&
            b.Date.Date == date.Date
        );
    }
}
