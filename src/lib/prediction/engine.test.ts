import { describe, expect, it } from "vitest";
import {
  demoCrowdSnapshots,
  demoFormSnapshots,
  demoIds,
  demoInjuries,
  demoLineups,
  demoMatches,
  demoOddsSnapshots,
  demoTeams
} from "@/lib/demo-data/football-demo-data";
import { oddsToProbabilities } from "@/lib/prediction/odds";
import { runPredictionEngine } from "@/lib/prediction/engine";

describe("prediction engine", () => {
  it("creates normalized outcome probabilities and a 0-6 score matrix", () => {
    const match = demoMatches.find((item) => item.id === demoIds.matchNorwayIraq);
    const homeTeam = demoTeams.find((team) => team.id === match?.homeTeamId);
    const awayTeam = demoTeams.find((team) => team.id === match?.awayTeamId);
    const homeForm = demoFormSnapshots.find((snapshot) => snapshot.teamId === match?.homeTeamId);
    const awayForm = demoFormSnapshots.find((snapshot) => snapshot.teamId === match?.awayTeamId);

    if (!match || !homeTeam || !awayTeam || !homeForm || !awayForm) {
      throw new Error("Demo fixtures are incomplete.");
    }

    const prediction = runPredictionEngine({
      match,
      homeTeam,
      awayTeam,
      homeForm,
      awayForm,
      lineups: demoLineups.filter((lineup) => lineup.matchId === match.id),
      injuries: demoInjuries.filter((injury) => injury.matchId === match.id),
      oddsSnapshots: demoOddsSnapshots.filter((odds) => odds.matchId === match.id),
      crowdSnapshot: demoCrowdSnapshots.find((snapshot) => snapshot.matchId === match.id)
    });

    const total =
      prediction.blendedOutcomeProbabilities.homeWin +
      prediction.blendedOutcomeProbabilities.draw +
      prediction.blendedOutcomeProbabilities.awayWin;

    expect(prediction.scoreMatrix).toHaveLength(49);
    expect(total).toBeCloseTo(1, 6);
    expect(prediction.homeExpectedGoals).toBeGreaterThanOrEqual(0.15);
    expect(prediction.homeExpectedGoals).toBeLessThanOrEqual(4.5);
    expect(prediction.blendedTopScorePredictions).toHaveLength(3);
    expect(prediction.explanation.factors.length).toBeGreaterThanOrEqual(3);
  });

  it("normalizes bookmaker margin from decimal odds", () => {
    const probabilities = oddsToProbabilities({
      homeOdds: 1.8,
      drawOdds: 3.5,
      awayOdds: 4.6
    });

    expect(probabilities.homeWin + probabilities.draw + probabilities.awayWin).toBeCloseTo(1, 6);
    expect(probabilities.homeWin).toBeGreaterThan(probabilities.awayWin);
  });
});
