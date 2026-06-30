import { NextResponse } from "next/server";
import { getRuntimeMode } from "@/lib/config/runtime-mode";
import { createFootballDataProvider } from "@/lib/providers/provider-factory";

export async function GET() {
  const provider = createFootballDataProvider();
  const [matches, competitions, teams] = await Promise.all([
    provider.getUpcomingMatches(),
    provider.getCompetitions(),
    provider.getTeams()
  ]);

  return NextResponse.json({
    mode: getRuntimeMode(),
    demoLabel: getRuntimeMode().isDemoMode ? "Demo Mode – Data is not live" : null,
    matches,
    competitions,
    teams
  });
}
