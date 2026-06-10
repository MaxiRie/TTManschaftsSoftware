using TTManschatfsSoftware.Domain;

namespace TTManschatfsSoftware.Services;

/// <summary>
/// TTVN (Tischtennisverband Niedersachsen) validation logic for team compositions.
/// Rules:
/// - Internal Q-TTR tolerance: 35 points
/// - Cross-team Q-TTR tolerance: 50 points
/// - Minimum 4 players per team
/// </summary>
public class TtvnValidator
{
    private const int InternalQttrTolerance = 35;
    private const int CrossTeamQttrTolerance = 50;
    private const int MinimumPlayersPerTeam = 4;

    public (bool IsValid, List<string> Errors) ValidateTeamComposition(Team team)
    {
        var errors = new List<string>();

        if (team.Players.Count < MinimumPlayersPerTeam)
        {
            errors.Add($"Team muss mindestens {MinimumPlayersPerTeam} Spieler haben. Aktuell: {team.Players.Count}");
            return (false, errors);
        }

        var sortedPlayers = team.Players.OrderByDescending(p => p.Qttr).ToList();

        // Check internal Q-TTR tolerance (highest - lowest player)
        var maxQttr = sortedPlayers.First().Qttr;
        var minQttr = sortedPlayers.Last().Qttr;
        var internalDiff = maxQttr - minQttr;

        if (internalDiff > InternalQttrTolerance)
        {
            errors.Add(
                $"Q-TTR Spannweite zu groß: {internalDiff} Punkte (Max: {InternalQttrTolerance}). " +
                $"Stärkster: {sortedPlayers.First().Name} ({maxQttr}), " +
                $"Schwächster: {sortedPlayers.Last().Name} ({minQttr})"
            );
        }

        return (errors.Count == 0, errors);
    }

    public (bool IsValid, List<string> Warnings) CheckCrossTeamQttr(List<Team> teams)
    {
        var warnings = new List<string>();

        for (int i = 0; i < teams.Count; i++)
        {
            var team1 = teams[i];
            var team1LastPlayer = team1.Players.OrderBy(p => p.Qttr).FirstOrDefault();
            
            if (team1LastPlayer == null) continue;

            for (int j = i + 1; j < teams.Count; j++)
            {
                var team2 = teams[j];
                var team2FirstPlayer = team2.Players.OrderByDescending(p => p.Qttr).FirstOrDefault();
                
                if (team2FirstPlayer == null) continue;

                var diff = team2FirstPlayer.Qttr - team1LastPlayer.Qttr;
                
                if (diff > CrossTeamQttrTolerance)
                {
                    warnings.Add(
                        $"Cross-Team Q-TTR überschritten: {team2FirstPlayer.Name} ({team2FirstPlayer.Qttr}) " +
                        $"ist {diff} Punkte über {team1LastPlayer.Name} ({team1LastPlayer.Qttr}). " +
                        $"Max: {CrossTeamQttrTolerance}"
                    );
                }
            }
        }

        return (warnings.Count == 0, warnings);
    }

    /// <summary>
    /// Marks players with SPV (Special Position Value) flag.
    /// SPV is marked if a player scores 50+ points above the last player of the team above.
    /// </summary>
    public void MarkSpvPlayers(List<Team> teams)
    {
        var allPlayers = teams.SelectMany(t => t.Players).ToList();
        
        foreach (var player in allPlayers)
        {
            player.IsSpvMarked = false;
        }

        for (int i = 0; i < teams.Count - 1; i++)
        {
            var teamAboveLastPlayer = teams[i].Players.OrderBy(p => p.Qttr).FirstOrDefault();
            if (teamAboveLastPlayer == null) continue;

            var teamBelowFirstPlayer = teams[i + 1].Players.OrderByDescending(p => p.Qttr).FirstOrDefault();
            if (teamBelowFirstPlayer == null) continue;

            if (teamBelowFirstPlayer.Qttr - teamAboveLastPlayer.Qttr >= 50)
            {
                teamBelowFirstPlayer.IsSpvMarked = true;
            }
        }
    }
}
