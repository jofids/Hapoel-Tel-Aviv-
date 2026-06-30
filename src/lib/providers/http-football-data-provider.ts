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
import type { FootballDataProvider } from "@/lib/providers/football-data-provider";

type HttpFootballDataProviderOptions = {
  baseUrl: string;
  apiKey: string;
};

export class HttpFootballDataProvider implements FootballDataProvider {
  constructor(private readonly options: HttpFootballDataProviderOptions) {}

  getCompetitions() {
    return this.request<Competition[]>("/competitions");
  }

  getTeams() {
    return this.request<Team[]>("/teams");
  }

  getTeamById(teamId: string) {
    return this.request<Team | null>(`/teams/${teamId}`);
  }

  getUpcomingMatches() {
    return this.request<Match[]>("/matches/upcoming");
  }

  getMatchById(matchId: string) {
    return this.request<Match | null>(`/matches/${matchId}`);
  }

  getTeamRecentMatches(teamId: string) {
    return this.request<Match[]>(`/teams/${teamId}/recent-matches`);
  }

  getStandings(competitionId: string) {
    return this.request<Standing[]>(`/competitions/${competitionId}/standings`);
  }

  getLineups(matchId: string) {
    return this.request<Lineup[]>(`/matches/${matchId}/lineups`);
  }

  getInjuries(matchId: string) {
    return this.request<Injury[]>(`/matches/${matchId}/injuries`);
  }

  getLiveEvents(matchId: string) {
    return this.request<LiveEvent[]>(`/matches/${matchId}/live-events`);
  }

  getTeamFormSnapshot(teamId: string) {
    return this.request<TeamFormSnapshot | null>(`/teams/${teamId}/form-snapshot`);
  }

  private async request<T>(path: string): Promise<T> {
    const url = new URL(path, this.options.baseUrl);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        Accept: "application/json"
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Football data provider failed: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}
