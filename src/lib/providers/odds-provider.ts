import type { OddsSnapshot } from "@/lib/domain/football";

export interface OddsProvider {
  getMatchOdds(matchId: string): Promise<OddsSnapshot[]>;
}
