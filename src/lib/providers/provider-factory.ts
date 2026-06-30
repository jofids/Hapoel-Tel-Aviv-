import { env } from "@/lib/config/env";
import { DemoFootballDataProvider } from "@/lib/providers/demo-football-data-provider";
import { DemoOddsProvider } from "@/lib/providers/demo-odds-provider";
import type { FootballDataProvider } from "@/lib/providers/football-data-provider";
import { HttpFootballDataProvider } from "@/lib/providers/http-football-data-provider";
import { HttpOddsProvider } from "@/lib/providers/http-odds-provider";
import type { OddsProvider } from "@/lib/providers/odds-provider";

export function createFootballDataProvider(): FootballDataProvider {
  if (env.FOOTBALL_DATA_API_KEY && env.FOOTBALL_DATA_API_BASE_URL) {
    return new HttpFootballDataProvider({
      apiKey: env.FOOTBALL_DATA_API_KEY,
      baseUrl: env.FOOTBALL_DATA_API_BASE_URL
    });
  }

  return new DemoFootballDataProvider();
}

export function createOddsProvider(): OddsProvider {
  if (env.ODDS_API_KEY && env.ODDS_API_BASE_URL) {
    return new HttpOddsProvider({
      apiKey: env.ODDS_API_KEY,
      baseUrl: env.ODDS_API_BASE_URL
    });
  }

  return new DemoOddsProvider();
}
