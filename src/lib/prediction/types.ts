import type {
  CrowdWisdomSnapshot,
  Injury,
  Lineup,
  Match,
  OddsSnapshot,
  Team,
  TeamFormSnapshot
} from "@/lib/domain/football";

export type OutcomeProbabilities = {
  homeWin: number;
  draw: number;
  awayWin: number;
};

export type ScoreProbability = {
  homeGoals: number;
  awayGoals: number;
  probability: number;
};

export type PredictionFactor = {
  key: string;
  label: string;
  impact: "home" | "away" | "draw" | "neutral";
  strength: number;
  value: string;
};

export type PredictionExplanation = {
  factors: PredictionFactor[];
  missingInformation: string[];
  summary: string;
};

export type ConfidenceBreakdown = {
  winnerConfidence: number;
  exactScoreConfidence: number;
  dataQualityScore: number;
  sourceAgreementScore: number;
  verbalConfidence: "Low" | "Medium" | "High";
};

export type PredictionEngineInput = {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  homeForm: TeamFormSnapshot;
  awayForm: TeamFormSnapshot;
  lineups: Lineup[];
  injuries: Injury[];
  oddsSnapshots?: OddsSnapshot[];
  crowdSnapshot?: CrowdWisdomSnapshot;
  competitionHomeGoalAverage?: number;
  competitionAwayGoalAverage?: number;
  modelWeight?: number;
  marketWeight?: number;
  crowdWeight?: number;
};

export type PredictionResult = {
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  scoreMatrix: ScoreProbability[];
  outcomeProbabilities: OutcomeProbabilities;
  over25Probability: number;
  under25Probability: number;
  bothTeamsScoreProbability: number;
  topScorePredictions: ScoreProbability[];
  blendedOutcomeProbabilities: OutcomeProbabilities;
  blendedScoreMatrix: ScoreProbability[];
  blendedTopScorePredictions: ScoreProbability[];
  confidence: ConfidenceBreakdown;
  explanation: PredictionExplanation;
};

export type BlendingWeights = {
  model: number;
  market: number;
  crowd: number;
};
