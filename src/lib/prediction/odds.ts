import type { OddsSnapshot } from "@/lib/domain/football";
import { normalizeOutcomeProbabilities, normalizeScoreMatrix } from "@/lib/prediction/poisson";
import type { BlendingWeights, OutcomeProbabilities, ScoreProbability } from "@/lib/prediction/types";

export function oddsToProbabilities(odds: Pick<OddsSnapshot, "homeOdds" | "drawOdds" | "awayOdds">) {
  const raw = {
    homeWin: 1 / odds.homeOdds,
    draw: 1 / odds.drawOdds,
    awayWin: 1 / odds.awayOdds
  };

  return normalizeOutcomeProbabilities(raw);
}

export function latestOddsSnapshot(oddsSnapshots: OddsSnapshot[] = []) {
  return [...oddsSnapshots].sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime())[0];
}

export function redistributeWeights(
  desiredWeights: BlendingWeights,
  availability: { model: boolean; market: boolean; crowd: boolean }
): BlendingWeights {
  const activeWeight =
    (availability.model ? desiredWeights.model : 0) +
    (availability.market ? desiredWeights.market : 0) +
    (availability.crowd ? desiredWeights.crowd : 0);

  if (activeWeight <= 0) {
    return { model: 1, market: 0, crowd: 0 };
  }

  return {
    model: availability.model ? desiredWeights.model / activeWeight : 0,
    market: availability.market ? desiredWeights.market / activeWeight : 0,
    crowd: availability.crowd ? desiredWeights.crowd / activeWeight : 0
  };
}

export function blendOutcomeProbabilities(
  model: OutcomeProbabilities,
  weights: BlendingWeights,
  sources: {
    market?: OutcomeProbabilities;
    crowd?: OutcomeProbabilities;
  }
): OutcomeProbabilities {
  const adjustedWeights = redistributeWeights(weights, {
    model: true,
    market: Boolean(sources.market),
    crowd: Boolean(sources.crowd)
  });

  return normalizeOutcomeProbabilities({
    homeWin:
      model.homeWin * adjustedWeights.model +
      (sources.market?.homeWin ?? 0) * adjustedWeights.market +
      (sources.crowd?.homeWin ?? 0) * adjustedWeights.crowd,
    draw:
      model.draw * adjustedWeights.model +
      (sources.market?.draw ?? 0) * adjustedWeights.market +
      (sources.crowd?.draw ?? 0) * adjustedWeights.crowd,
    awayWin:
      model.awayWin * adjustedWeights.model +
      (sources.market?.awayWin ?? 0) * adjustedWeights.market +
      (sources.crowd?.awayWin ?? 0) * adjustedWeights.crowd
  });
}

export function reweightScoreMatrixByOutcome(
  matrix: ScoreProbability[],
  targetOutcomeProbabilities: OutcomeProbabilities
) {
  const current = matrix.reduce(
    (acc, cell) => {
      if (cell.homeGoals > cell.awayGoals) {
        acc.homeWin += cell.probability;
      } else if (cell.homeGoals === cell.awayGoals) {
        acc.draw += cell.probability;
      } else {
        acc.awayWin += cell.probability;
      }

      return acc;
    },
    { homeWin: 0, draw: 0, awayWin: 0 }
  );

  const reweighted = matrix.map((cell) => {
    const category =
      cell.homeGoals > cell.awayGoals ? "homeWin" : cell.homeGoals === cell.awayGoals ? "draw" : "awayWin";
    const currentCategoryTotal = current[category];
    const targetCategoryTotal = targetOutcomeProbabilities[category];
    const factor = currentCategoryTotal > 0 ? targetCategoryTotal / currentCategoryTotal : 1;

    return {
      ...cell,
      probability: cell.probability * factor
    };
  });

  return normalizeScoreMatrix(reweighted);
}
