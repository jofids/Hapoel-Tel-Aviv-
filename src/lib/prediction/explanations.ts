import type { CrowdWisdomSnapshot, Lineup, OddsSnapshot } from "@/lib/domain/football";
import type { OutcomeProbabilities, PredictionExplanation, PredictionFactor } from "@/lib/prediction/types";

type ExplanationInput = {
  factors: PredictionFactor[];
  lineups: Lineup[];
  oddsSnapshots?: OddsSnapshot[];
  crowdSnapshot?: CrowdWisdomSnapshot;
  modelOutcomeProbabilities: OutcomeProbabilities;
  marketOutcomeProbabilities?: OutcomeProbabilities;
};

export function generatePredictionExplanation(input: ExplanationInput): PredictionExplanation {
  const sourceAgreementFactor = buildSourceAgreementFactor(input);
  const factors = [...input.factors, ...(sourceAgreementFactor ? [sourceAgreementFactor] : [])]
    .filter((factor) => factor.strength > 0.03)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5);

  const missingInformation = [
    ...(input.lineups.length === 0
      ? ["The prediction is based on partial information because lineup data is not yet available."]
      : []),
    ...(!input.oddsSnapshots || input.oddsSnapshots.length === 0
      ? ["Market odds are not available, so the blended prediction relies on model and community data."]
      : []),
    ...(!input.crowdSnapshot
      ? ["Crowd wisdom is not available yet for this match."]
      : [])
  ];

  return {
    factors,
    missingInformation,
    summary: buildSummary(factors, missingInformation)
  };
}

function buildSourceAgreementFactor(input: ExplanationInput): PredictionFactor | null {
  if (!input.marketOutcomeProbabilities) {
    return null;
  }

  const modelWinner = topOutcome(input.modelOutcomeProbabilities);
  const marketWinner = topOutcome(input.marketOutcomeProbabilities);

  if (modelWinner !== marketWinner) {
    return {
      key: "source_disagreement",
      label: "The statistical model and the market do not fully agree on the leading outcome.",
      impact: "neutral",
      strength: 0.18,
      value: `${modelWinner} vs ${marketWinner}`
    };
  }

  return {
    key: "source_agreement",
    label: `The statistical model and the market agree on ${formatOutcome(modelWinner)}.`,
    impact: modelWinner === "homeWin" ? "home" : modelWinner === "awayWin" ? "away" : "draw",
    strength: 0.22,
    value: modelWinner
  };
}

function buildSummary(factors: PredictionFactor[], missingInformation: string[]) {
  if (factors.length === 0 && missingInformation.length > 0) {
    return missingInformation[0];
  }

  if (factors.length === 0) {
    return "The prediction is based on the available statistical inputs.";
  }

  return `The prediction is mainly influenced by ${factors
    .slice(0, 3)
    .map((factor) => factor.key.replaceAll("_", " "))
    .join(", ")}.`;
}

function topOutcome(probabilities: OutcomeProbabilities) {
  return Object.entries(probabilities).sort(([, a], [, b]) => b - a)[0][0] as keyof OutcomeProbabilities;
}

function formatOutcome(outcome: keyof OutcomeProbabilities) {
  if (outcome === "homeWin") {
    return "a home win";
  }

  if (outcome === "awayWin") {
    return "an away win";
  }

  return "a draw";
}
