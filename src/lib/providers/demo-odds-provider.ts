import { demoOddsSnapshots } from "@/lib/demo-data/football-demo-data";
import type { OddsProvider } from "@/lib/providers/odds-provider";

export class DemoOddsProvider implements OddsProvider {
  async getMatchOdds(matchId: string) {
    return demoOddsSnapshots.filter((odds) => odds.matchId === matchId);
  }
}
