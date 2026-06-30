export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";

export type Competition = {
  id: string;
  externalId?: string;
  name: string;
  country?: string;
  type: "club" | "international";
  level: number;
};

export type Season = {
  id: string;
  competitionId: string;
  name: string;
  startsAt: Date;
  endsAt: Date;
};

export type Team = {
  id: string;
  externalId?: string;
  name: string;
  shortName?: string;
  country?: string;
  type: "club" | "national";
  ranking?: number;
};

export type Player = {
  id: string;
  teamId: string;
  name: string;
  position: string;
  shirtNumber?: number;
};

export type Match = {
  id: string;
  externalId?: string;
  competitionId: string;
  seasonId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: Date;
  status: MatchStatus;
  venue?: string;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  stage: "league" | "group" | "knockout" | "friendly";
  matchImportance: number;
};

export type Standing = {
  competitionId: string;
  teamId: string;
  position: number;
  played: number;
  points: number;
  goalDiff: number;
};

export type TeamFormSnapshot = {
  teamId: string;
  lastFiveGoalsFor: number;
  lastFiveGoalsAgainst: number;
  lastTenGoalsFor: number;
  lastTenGoalsAgainst: number;
  homeGoalsFor: number;
  homeGoalsAgainst: number;
  awayGoalsFor: number;
  awayGoalsAgainst: number;
  xgFor?: number;
  xgAgainst?: number;
  opponentStrengthAverage: number;
  restDays: number;
  fixtureCongestionIndex: number;
};

export type Lineup = {
  matchId: string;
  teamId: string;
  playerId?: string;
  playerName: string;
  position: string;
  isStarting: boolean;
  isConfirmed: boolean;
  availability: "AVAILABLE" | "DOUBTFUL" | "INJURED" | "SUSPENDED";
};

export type Injury = {
  matchId?: string;
  teamId: string;
  playerId?: string;
  playerName: string;
  reason: string;
  status: "injured" | "suspended" | "doubtful";
  severity: number;
  startsAt: Date;
  expectedEnd?: Date;
};

export type LiveEvent = {
  id: string;
  matchId: string;
  type: "GOAL" | "CARD" | "SUBSTITUTION" | "VAR" | "INJURY" | "PERIOD" | "OTHER";
  minute: number;
  teamId?: string;
  playerName?: string;
  description: string;
  occurredAt: Date;
};

export type OddsSnapshot = {
  id: string;
  matchId: string;
  provider: string;
  bookmaker: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  capturedAt: Date;
};

export type CrowdWisdomSnapshot = {
  matchId: string;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  participantCount: number;
  capturedAt: Date;
};
