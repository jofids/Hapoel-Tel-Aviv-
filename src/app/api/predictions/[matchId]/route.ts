import { NextResponse } from "next/server";
import { getRuntimeMode } from "@/lib/config/runtime-mode";
import { runPredictionForMatch } from "@/lib/prediction/run-for-match";
import { matchIdSchema } from "@/lib/validation/prediction";

export async function GET(_request: Request, context: { params: Promise<{ matchId: string }> }) {
  const params = await context.params;
  const parsed = matchIdSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid match id" }, { status: 400 });
  }

  const prediction = await runPredictionForMatch(parsed.data.matchId);

  if (!prediction) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json({
    mode: getRuntimeMode(),
    demoLabel: getRuntimeMode().isDemoMode ? "Demo Mode – Data is not live" : null,
    prediction
  });
}
