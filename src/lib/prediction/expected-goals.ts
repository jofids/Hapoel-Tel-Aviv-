import type { Injury, Lineup, Match, Team, TeamFormSnapshot } from "@/lib/domain/football";
import { clamp } from "@/lib/prediction/poisson";
import type { PredictionFactor } from "@/lib/prediction/types";

type ExpectedGoalsInput = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  homeForm: TeamFormSnapshot;
  awayForm: TeamFormSnapshot;
  lineups: Lineup[];
  injuries: Injury[];
  competitionHomeGoalAverage: number;
  competitionAwayGoalAverage: number;
};

export function calculateExpectedGoals(input: ExpectedGoalsInput) {
  const homeAttackStrength = attackStrength(input.homeForm, "home");
  const awayAttackStrength = attackStrength(input.awayForm, "away");
  const homeDefenseWeakness = defenseWeakness(input.homeForm, "home");
  const awayDefenseWeakness = defenseWeakness(input.awayForm, "away");
  const homeAdvantageFactor = 1.1;
  const homeFormFactor = formFactor(input.homeForm);
  const awayFormFactor = formFactor(input.awayForm);
  const homeLineupFactor = lineupFactor(input.lineups, input.injuries, input.match.homeTeamId);
  const awayLineupFactor = lineupFactor(input.lineups, input.injuries, input.match.awayTeamId);
  const homeRestFactor = restFactor(input.homeForm);
  const awayRestFactor = restFactor(input.awayForm);
  const homeRankingFactor = rankingFactor(input.homeTeam, input.awayTeam);
  const awayRankingFactor = rankingFactor(input.awayTeam, input.homeTeam);
  const importanceFactor = matchImportanceFactor(input.match);

  const homeExpectedGoals = clamp(
    input.competitionHomeGoalAverage *
      homeAttackStrength *
      awayDefenseWeakness *
      homeAdvantageFactor *
      homeFormFactor *
      homeLineupFactor *
      homeRestFactor *
      homeRankingFactor *
      importanceFactor,
    0.15,
    4.5
  );

  const awayExpectedGoals = clamp(
    input.competitionAwayGoalAverage *
      awayAttackStrength *
      homeDefenseWeakness *
      awayFormFactor *
      awayLineupFactor *
      awayRestFactor *
      awayRankingFactor *
      importanceFactor,
    0.15,
    4.5
  );

  return {
    homeExpectedGoals,
    awayExpectedGoals,
    factors: buildExpectedGoalFactors(input, {
      homeAttackStrength,
      awayAttackStrength,
      homeDefenseWeakness,
      awayDefenseWeakness,
      homeFormFactor,
      awayFormFactor,
      homeLineupFactor,
      awayLineupFactor,
      homeRestFactor,
      awayRestFactor,
      homeRankingFactor,
      awayRankingFactor
    })
  };
}

function attackStrength(form: TeamFormSnapshot, side: "home" | "away") {
  const recentScoring = form.lastFiveGoalsFor * 0.45 + form.lastTenGoalsFor * 0.25;
  const locationScoring = side === "home" ? form.homeGoalsFor * 0.2 : form.awayGoalsFor * 0.2;
  const xg = (form.xgFor ?? form.lastTenGoalsFor) * 0.1;

  return clamp((recentScoring + locationScoring + xg) / 1.55, 0.55, 1.65);
}

function defenseWeakness(form: TeamFormSnapshot, side: "home" | "away") {
  const recentConceding = form.lastFiveGoalsAgainst * 0.45 + form.lastTenGoalsAgainst * 0.25;
  const locationConceding = side === "home" ? form.homeGoalsAgainst * 0.2 : form.awayGoalsAgainst * 0.2;
  const xga = (form.xgAgainst ?? form.lastTenGoalsAgainst) * 0.1;

  return clamp((recentConceding + locationConceding + xga) / 1.25, 0.55, 1.65);
}

function formFactor(form: TeamFormSnapshot) {
  const goalBalance = form.lastFiveGoalsFor - form.lastFiveGoalsAgainst;
  const opponentAdjustment = 0.9 + form.opponentStrengthAverage * 0.2;

  return clamp((1 + goalBalance * 0.08) * opponentAdjustment, 0.75, 1.3);
}

function lineupFactor(lineups: Lineup[], injuries: Injury[], teamId: string) {
  const teamLineups = lineups.filter((lineup) => lineup.teamId === teamId);
  const confirmedPenalty = teamLineups.some((lineup) => lineup.isConfirmed) ? 1 : 0.98;
  const unavailableStarters = teamLineups.filter(
    (lineup) => lineup.isStarting && ["INJURED", "SUSPENDED"].includes(lineup.availability)
  ).length;
  const injuryPenalty = injuries
    .filter((injury) => injury.teamId === teamId)
    .reduce((sum, injury) => sum + injury.severity * (injury.status === "suspended" ? 0.05 : 0.04), 0);

  return clamp(confirmedPenalty - unavailableStarters * 0.04 - injuryPenalty, 0.75, 1.05);
}

function restFactor(form: TeamFormSnapshot) {
  const restScore = form.restDays >= 5 ? 1.03 : form.restDays >= 3 ? 1 : 0.94;
  const congestionPenalty = form.fixtureCongestionIndex * 0.08;

  return clamp(restScore - congestionPenalty, 0.88, 1.06);
}

function rankingFactor(team: Team, opponent: Team) {
  if (!team.ranking || !opponent.ranking) {
    return 1;
  }

  const rankingGap = opponent.ranking - team.ranking;
  return clamp(1 + rankingGap * 0.003, 0.85, 1.18);
}

function matchImportanceFactor(match: Match) {
  const stageBoost = match.stage === "knockout" ? 0.96 : match.stage === "group" ? 1.02 : 1;
  const importanceAdjustment = 1 + (match.matchImportance - 0.5) * 0.08;

  return clamp(stageBoost * importanceAdjustment, 0.92, 1.08);
}

function buildExpectedGoalFactors(
  input: ExpectedGoalsInput,
  factors: Record<string, number>
): PredictionFactor[] {
  const lineupMissing = input.lineups.length === 0;
  const injuryImpactHome = 1 - factors.homeLineupFactor;
  const injuryImpactAway = 1 - factors.awayLineupFactor;

  return [
    {
      key: "home_attack_form",
      label: `${input.homeTeam.name} scored an average of ${input.homeForm.lastFiveGoalsFor.toFixed(
        1
      )} goals in its last five matches.`,
      impact: "home",
      strength: Math.abs(factors.homeAttackStrength - 1),
      value: input.homeForm.lastFiveGoalsFor.toFixed(1)
    },
    {
      key: "away_defense",
      label: `${input.awayTeam.name} conceded an average of ${input.awayForm.lastFiveGoalsAgainst.toFixed(
        1
      )} goals in its last five matches.`,
      impact: factors.awayDefenseWeakness > 1 ? "home" : "away",
      strength: Math.abs(factors.awayDefenseWeakness - 1),
      value: input.awayForm.lastFiveGoalsAgainst.toFixed(1)
    },
    {
      key: "away_attack_form",
      label: `${input.awayTeam.name} scored an average of ${input.awayForm.lastFiveGoalsFor.toFixed(
        1
      )} goals in its last five matches.`,
      impact: "away",
      strength: Math.abs(factors.awayAttackStrength - 1),
      value: input.awayForm.lastFiveGoalsFor.toFixed(1)
    },
    {
      key: "ranking_gap",
      label: `The ranking gap changes the attacking expectation by ${Math.abs(
        factors.homeRankingFactor - factors.awayRankingFactor
      ).toFixed(2)}.`,
      impact: factors.homeRankingFactor >= factors.awayRankingFactor ? "home" : "away",
      strength: Math.abs(factors.homeRankingFactor - factors.awayRankingFactor),
      value: `${input.homeTeam.ranking ?? "unknown"} vs ${input.awayTeam.ranking ?? "unknown"}`
    },
    {
      key: "lineup_availability",
      label: lineupMissing
        ? "The prediction is based on partial information because lineup data is not yet available."
        : "Lineup and availability data are included in the expected-goals calculation.",
      impact: injuryImpactHome > injuryImpactAway ? "away" : injuryImpactAway > injuryImpactHome ? "home" : "neutral",
      strength: Math.max(injuryImpactHome, injuryImpactAway, lineupMissing ? 0.12 : 0),
      value: `${input.lineups.length} lineup records`
    },
    {
      key: "rest_days",
      label: `${input.homeTeam.name} has ${input.homeForm.restDays} rest days; ${input.awayTeam.name} has ${input.awayForm.restDays}.`,
      impact: factors.homeRestFactor > factors.awayRestFactor ? "home" : factors.awayRestFactor > factors.homeRestFactor ? "away" : "neutral",
      strength: Math.abs(factors.homeRestFactor - factors.awayRestFactor),
      value: `${input.homeForm.restDays}-${input.awayForm.restDays}`
    }
  ];
}
