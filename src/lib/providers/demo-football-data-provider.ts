import {
  demoCompetitions,
  demoFormSnapshots,
  demoInjuries,
  demoLineups,
  demoLiveEvents,
  demoMatches,
  demoStandings,
  demoTeams
} from "@/lib/demo-data/football-demo-data";
import type { FootballDataProvider } from "@/lib/providers/football-data-provider";

export class DemoFootballDataProvider implements FootballDataProvider {
  async getCompetitions() {
    return demoCompetitions;
  }

  async getTeams() {
    return demoTeams;
  }

  async getTeamById(teamId: string) {
    return demoTeams.find((team) => team.id === teamId) ?? null;
  }

  async getUpcomingMatches() {
    return demoMatches.filter((match) => match.status === "SCHEDULED");
  }

  async getMatchById(matchId: string) {
    return demoMatches.find((match) => match.id === matchId) ?? null;
  }

  async getTeamRecentMatches(teamId: string) {
    return demoMatches.filter((match) => match.homeTeamId === teamId || match.awayTeamId === teamId);
  }

  async getStandings(competitionId: string) {
    return demoStandings.filter((standing) => standing.competitionId === competitionId);
  }

  async getLineups(matchId: string) {
    return demoLineups.filter((lineup) => lineup.matchId === matchId);
  }

  async getInjuries(matchId: string) {
    return demoInjuries.filter((injury) => injury.matchId === matchId);
  }

  async getLiveEvents(matchId: string) {
    return demoLiveEvents.filter((event) => event.matchId === matchId);
  }

  async getTeamFormSnapshot(teamId: string) {
    return demoFormSnapshots.find((snapshot) => snapshot.teamId === teamId) ?? null;
  }
}
