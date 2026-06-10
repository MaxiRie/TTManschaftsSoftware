using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.Services;

/// <summary>
/// Service for suggesting lineups for fixtures based on availability and QTTR ranking.
/// </summary>
public class LineupSuggestionService
{
    private const int DefaultLineupSize = 5;

    public List<Player> SuggestLineup(Fixture fixture, Team team)
    {
        if (fixture.Availabilities == null || !fixture.Availabilities.Any())
        {
            return SuggestByQttr(team);
        }

        var availablePlayers = fixture.Availabilities
            .Where(a => a.Status == "Zusage")
            .Select(a => a.Player)
            .OfType<Player>()
            .ToList();

        if (availablePlayers.Count < 4)
        {
            availablePlayers = SuggestByQttr(team).Take(DefaultLineupSize).ToList();
        }

        return availablePlayers
            .OrderByDescending(p => p.Qttr)
            .Take(DefaultLineupSize)
            .ToList();
    }

    private List<Player> SuggestByQttr(Team team)
    {
        return team.Players
            .Where(p => p.Status is "aktiv" or "RES")
            .OrderByDescending(p => p.Qttr)
            .Take(DefaultLineupSize)
            .ToList();
    }
}
