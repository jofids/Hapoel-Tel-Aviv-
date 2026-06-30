import type { OutcomeProbabilities, ScoreProbability } from "@/lib/prediction/types";

export const MAX_GOALS = 6;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function poissonProbability(lambda: number, goals: number) {
  if (goals < 0) {
    return 0;
  }

  return (Math.exp(-lambda) * Math.pow(lambda, goals)) / factorial(goals);
}

export function buildScoreMatrix(homeExpectedGoals: number, awayExpectedGoals: number) {
  const matrix: ScoreProbability[] = [];

  for (let homeGoals = 0; homeGoals <= MAX_GOALS; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= MAX_GOALS; awayGoals += 1) {
      matrix.push({
        homeGoals,
        awayGoals,
        probability:
          poissonProbability(homeExpectedGoals, homeGoals) *
          poissonProbability(awayExpectedGoals, awayGoals)
      });
    }
  }

  return normalizeScoreMatrix(matrix);
}

export function outcomeProbabilitiesFromMatrix(matrix: ScoreProbability[]): OutcomeProbabilities {
  const totals = matrix.reduce(
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

  return normalizeOutcomeProbabilities(totals);
}

export function calculateOver25Probability(matrix: ScoreProbability[]) {
  return matrix
    .filter((cell) => cell.homeGoals + cell.awayGoals > 2.5)
    .reduce((sum, cell) => sum + cell.probability, 0);
}

export function calculateBothTeamsScoreProbability(matrix: ScoreProbability[]) {
  return matrix
    .filter((cell) => cell.homeGoals > 0 && cell.awayGoals > 0)
    .reduce((sum, cell) => sum + cell.probability, 0);
}

export function topScorePredictions(matrix: ScoreProbability[], count = 3) {
  return [...matrix].sort((a, b) => b.probability - a.probability).slice(0, count);
}

export function normalizeOutcomeProbabilities(probabilities: OutcomeProbabilities): OutcomeProbabilities {
  const total = probabilities.homeWin + probabilities.draw + probabilities.awayWin;

  if (total <= 0) {
    return { homeWin: 1 / 3, draw: 1 / 3, awayWin: 1 / 3 };
  }

  return {
    homeWin: probabilities.homeWin / total,
    draw: probabilities.draw / total,
    awayWin: probabilities.awayWin / total
  };
}

export function normalizeScoreMatrix(matrix: ScoreProbability[]) {
  const total = matrix.reduce((sum, cell) => sum + cell.probability, 0);

  if (total <= 0) {
    return matrix;
  }

  return matrix.map((cell) => ({
    ...cell,
    probability: cell.probability / total
  }));
}

function factorial(value: number): number {
  if (value <= 1) {
    return 1;
  }

  let result = 1;
  for (let index = 2; index <= value; index += 1) {
    result *= index;
  }

  return result;
}
