import type { CrowdWisdomSnapshot, Lineup, OddsSnapshot, TeamFormSnapshot } from "@/lib/domain/football";
import type { ConfidenceBreakdown, OutcomeProbabilities, ScoreProbability } from "@/lib/prediction/types";

type ConfidenceInput = {
  outcomeProbabilities: OutcomeProbabilities;
  modelOutcomeProbabilities: OutcomeProbabilities;
  marketOutcomeProbabilities?: OutcomeProbabilities;
  crowdSnapshot?: CrowdWisdomSnapshot;
  scoreMatrix: ScoreProbability[];
  homeForm: TeamFormSnapshot;
  awayForm: TeamFormSnapshot;
  lineups: Lineup[];
  oddsSnapshots?: OddsSnapshot[];
};

export function calculateConfidence(input: ConfidenceInput): ConfidenceBreakdown {
  const predictionClarity = calculatePredictionClarity(input.outcomeProbabilities);
  const dataQualityScore = calculateDataQuality(input);
  const sourceAgreementScore = calculateSourceAgreement(input);
  const winnerConfidence = clamp01(predictionClarity * dataQualityScore * sourceAgreementScore);
  const exactScoreConfidence = clamp01(Math.max(...input.scoreMatrix.map((cell) => cell.probability)) * dataQualityScore);

  return {
    winnerConfidence,
    exactScoreConfidence,
    dataQualityScore,
    sourceAgreementScore,
    verbalConfidence: verbalConfidence(winnerConfidence)
  };
}

function calculatePredictionClarity(probabilities: OutcomeProbabilities) {
  const values = [probabilities.homeWin, probabilities.draw, probabilities.awayWin].sort((a, b) => b - a);
  const gap = values[0] - values[1];
  const entropy = -values.reduce((sum, value) => sum + (value > 0 ? value * Math.log2(value) : 0), 0);
  const normalizedEntropy = entropy / Math.log2(3);

  return clamp01(0.45 + gap * 0.75 + (1 - normalizedEntropy) * 0.35);
}

function calculateDataQuality(input: ConfidenceInput) {
  const formCompleteness = [input.homeForm, input.awayForm].every((form) => form.lastFiveGoalsFor >= 0) ? 0.25 : 0;
  const advancedStats = input.homeForm.xgFor && input.awayForm.xgFor ? 0.2 : 0.08;
  const lineupAvailability = input.lineups.length > 0 ? 0.18 : 0.06;
  const oddsAvailability = input.oddsSnapshots && input.oddsSnapshots.length > 0 ? 0.17 : 0.04;
  const crowdAvailability = input.crowdSnapshot && input.crowdSnapshot.participantCount >= 20 ? 0.1 : 0.03;
  const freshness = input.oddsSnapshots?.[0]
    ? freshnessScore(input.oddsSnapshots[0].capturedAt) * 0.1
    : 0.04;

  return clamp01(formCompleteness + advancedStats + lineupAvailability + oddsAvailability + crowdAvailability + freshness);
}

function calculateSourceAgreement(input: ConfidenceInput) {
  const sources: OutcomeProbabilities[] = [input.modelOutcomeProbabilities];

  if (input.marketOutcomeProbabilities) {
    sources.push(input.marketOutcomeProbabilities);
  }

  if (input.crowdSnapshot) {
    sources.push({
      homeWin: input.crowdSnapshot.homeWinProbability,
      draw: input.crowdSnapshot.drawProbability,
      awayWin: input.crowdSnapshot.awayWinProbability
    });
  }

  if (sources.length === 1) {
    return 0.72;
  }

  const winners = sources.map(topOutcome);
  const majorityWinner = winners
    .map((winner) => ({ winner, count: winners.filter((value) => value === winner).length }))
    .sort((a, b) => b.count - a.count)[0];
  const winnerAgreement = majorityWinner.count / sources.length;
  const averageDistance =
    sources.reduce((sum, source) => sum + distance(source, input.modelOutcomeProbabilities), 0) / sources.length;

  return clamp01(0.35 + winnerAgreement * 0.45 + (1 - averageDistance) * 0.2);
}

function topOutcome(probabilities: OutcomeProbabilities) {
  return Object.entries(probabilities).sort(([, a], [, b]) => b - a)[0][0];
}

function distance(left: OutcomeProbabilities, right: OutcomeProbabilities) {
  return (
    Math.abs(left.homeWin - right.homeWin) +
    Math.abs(left.draw - right.draw) +
    Math.abs(left.awayWin - right.awayWin)
  );
}

function freshnessScore(date: Date) {
  const ageHours = Math.max(0, Date.now() - date.getTime()) / 3_600_000;
  return clamp01(1 - ageHours / 72);
}

function verbalConfidence(score: number): "Low" | "Medium" | "High" {
  if (score >= 0.68) {
    return "High";
  }

  if (score >= 0.42) {
    return "Medium";
  }

  return "Low";
}

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}
