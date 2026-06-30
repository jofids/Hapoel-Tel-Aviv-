import type {
  Competition,
  Injury,
  Lineup,
  LiveEvent,
  Match,
  Standing,
  Team,
  TeamFormSnapshot
} from "@/lib/domain/football";

export interface FootballDataProvider {
  getCompetitions(): Promise<Competition[]>;
  getTeams(): Promise<Team[]>;
  getTeamById(teamId: string): Promise<Team | null>;
  getUpcomingMatches(): Promise<Match[]>;
  getMatchById(matchId: string): Promise<Match | null>;
  getTeamRecentMatches(teamId: string): Promise<Match[]>;
  getStandings(competitionId: string): Promise<Standing[]>;
  getLineups(matchId: string): Promise<Lineup[]>;
  getInjuries(matchId: string): Promise<Injury[]>;
  getLiveEvents(matchId: string): Promise<LiveEvent[]>;
  getTeamFormSnapshot(teamId: string): Promise<TeamFormSnapshot | null>;
}
