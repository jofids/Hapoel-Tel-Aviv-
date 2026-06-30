import { demoCrowdSnapshots } from "@/lib/demo-data/football-demo-data";
import { createFootballDataProvider, createOddsProvider } from "@/lib/providers/provider-factory";
import { runPredictionEngine } from "@/lib/prediction/engine";

export async function runPredictionForMatch(matchId: string) {
  const footballProvider = createFootballDataProvider();
  const oddsProvider = createOddsProvider();
  const match = await footballProvider.getMatchById(matchId);

  if (!match) {
    return null;
  }

  const homeTeam = await footballProvider.getTeamById(match.homeTeamId);
  const awayTeam = await footballProvider.getTeamById(match.awayTeamId);
  const homeForm = await footballProvider.getTeamFormSnapshot(match.homeTeamId);
  const awayForm = await footballProvider.getTeamFormSnapshot(match.awayTeamId);

  if (!homeTeam || !awayTeam || !homeForm || !awayForm) {
    throw new Error("Prediction inputs are incomplete for this match.");
  }

  const [lineups, injuries, oddsSnapshots] = await Promise.all([
    footballProvider.getLineups(match.id),
    footballProvider.getInjuries(match.id),
    oddsProvider.getMatchOdds(match.id)
  ]);
  const crowdSnapshot = demoCrowdSnapshots.find((snapshot) => snapshot.matchId === match.id);

  return runPredictionEngine({
    match,
    homeTeam,
    awayTeam,
    homeForm,
    awayForm,
    lineups,
    injuries,
    oddsSnapshots,
    crowdSnapshot
  });
}
