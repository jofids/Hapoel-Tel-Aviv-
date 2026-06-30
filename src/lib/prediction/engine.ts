import { calculateConfidence } from "@/lib/prediction/confidence";
import { calculateExpectedGoals } from "@/lib/prediction/expected-goals";
import { generatePredictionExplanation } from "@/lib/prediction/explanations";
import {
  latestOddsSnapshot,
  blendOutcomeProbabilities,
  oddsToProbabilities,
  reweightScoreMatrixByOutcome
} from "@/lib/prediction/odds";
import {
  buildScoreMatrix,
  calculateBothTeamsScoreProbability,
  calculateOver25Probability,
  outcomeProbabilitiesFromMatrix,
  topScorePredictions
} from "@/lib/prediction/poisson";
import type { PredictionEngineInput, PredictionResult } from "@/lib/prediction/types";

const DEFAULT_COMPETITION_HOME_GOAL_AVERAGE = 1.48;
const DEFAULT_COMPETITION_AWAY_GOAL_AVERAGE = 1.19;

export function runPredictionEngine(input: PredictionEngineInput): PredictionResult {
  const expectedGoals = calculateExpectedGoals({
    match: input.match,
    homeTeam: input.homeTeam,
    awayTeam: input.awayTeam,
    homeForm: input.homeForm,
    awayForm: input.awayForm,
    lineups: input.lineups,
    injuries: input.injuries,
    competitionHomeGoalAverage:
      input.competitionHomeGoalAverage ?? DEFAULT_COMPETITION_HOME_GOAL_AVERAGE,
    competitionAwayGoalAverage:
      input.competitionAwayGoalAverage ?? DEFAULT_COMPETITION_AWAY_GOAL_AVERAGE
  });

  const scoreMatrix = buildScoreMatrix(
    expectedGoals.homeExpectedGoals,
    expectedGoals.awayExpectedGoals
  );
  const outcomeProbabilities = outcomeProbabilitiesFromMatrix(scoreMatrix);
  const oddsSnapshot = latestOddsSnapshot(input.oddsSnapshots);
  const marketOutcomeProbabilities = oddsSnapshot ? oddsToProbabilities(oddsSnapshot) : undefined;
  const crowdOutcomeProbabilities = input.crowdSnapshot
    ? {
        homeWin: input.crowdSnapshot.homeWinProbability,
        draw: input.crowdSnapshot.drawProbability,
        awayWin: input.crowdSnapshot.awayWinProbability
      }
    : undefined;
  const blendedOutcomeProbabilities = blendOutcomeProbabilities(
    outcomeProbabilities,
    {
      model: input.modelWeight ?? 0.55,
      market: input.marketWeight ?? 0.3,
      crowd: input.crowdWeight ?? 0.15
    },
    {
      market: marketOutcomeProbabilities,
      crowd: crowdOutcomeProbabilities
    }
  );
  const blendedScoreMatrix = reweightScoreMatrixByOutcome(
    scoreMatrix,
    blendedOutcomeProbabilities
  );
  const over25Probability = calculateOver25Probability(scoreMatrix);
  const bothTeamsScoreProbability = calculateBothTeamsScoreProbability(scoreMatrix);
  const confidence = calculateConfidence({
    outcomeProbabilities: blendedOutcomeProbabilities,
    modelOutcomeProbabilities: outcomeProbabilities,
    marketOutcomeProbabilities,
    scoreMatrix: blendedScoreMatrix,
    homeForm: input.homeForm,
    awayForm: input.awayForm,
    lineups: input.lineups,
    oddsSnapshots: input.oddsSnapshots,
    crowdSnapshot: input.crowdSnapshot
  });
  const explanation = generatePredictionExplanation({
    factors: expectedGoals.factors,
    lineups: input.lineups,
    oddsSnapshots: input.oddsSnapshots,
    crowdSnapshot: input.crowdSnapshot,
    modelOutcomeProbabilities: outcomeProbabilities,
    marketOutcomeProbabilities
  });

  return {
    homeExpectedGoals: expectedGoals.homeExpectedGoals,
    awayExpectedGoals: expectedGoals.awayExpectedGoals,
    scoreMatrix,
    outcomeProbabilities,
    over25Probability,
    under25Probability: 1 - over25Probability,
    bothTeamsScoreProbability,
    topScorePredictions: topScorePredictions(scoreMatrix),
    blendedOutcomeProbabilities,
    blendedScoreMatrix,
    blendedTopScorePredictions: topScorePredictions(blendedScoreMatrix),
    confidence,
    explanation
  };
}
