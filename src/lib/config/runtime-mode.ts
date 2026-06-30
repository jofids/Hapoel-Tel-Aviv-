import { env } from "@/lib/config/env";

export type RuntimeMode = {
  isDemoMode: boolean;
  footballDataProvider: string;
  oddsProvider: string;
};

export function getRuntimeMode(): RuntimeMode {
  const hasFootballProvider = Boolean(env.FOOTBALL_DATA_PROVIDER && env.FOOTBALL_DATA_API_KEY);
  const hasOddsProvider = Boolean(env.ODDS_PROVIDER && env.ODDS_API_KEY);

  return {
    isDemoMode: !hasFootballProvider || !hasOddsProvider,
    footballDataProvider: hasFootballProvider ? env.FOOTBALL_DATA_PROVIDER ?? "live" : "demo",
    oddsProvider: hasOddsProvider ? env.ODDS_PROVIDER ?? "live" : "demo"
  };
}
