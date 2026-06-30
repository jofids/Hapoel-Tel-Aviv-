import { NextResponse } from "next/server";
import { submitUserPrediction } from "@/lib/prediction/user-predictions";
import { userPredictionSchema } from "@/lib/validation/prediction";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = userPredictionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid prediction input" }, { status: 400 });
  }

  try {
    const prediction = await submitUserPrediction(parsed.data);
    return NextResponse.json({ prediction }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not submit prediction.";
    const status = message.includes("kickoff") ? 409 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
