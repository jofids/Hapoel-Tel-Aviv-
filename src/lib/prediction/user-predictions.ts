import { getPrismaClient } from "@/lib/db/prisma";
import type { UserPredictionInput } from "@/lib/validation/prediction";

export async function submitUserPrediction(input: UserPredictionInput) {
  const prisma = getPrismaClient();
  const match = await prisma.match.findUnique({
    where: { id: input.matchId },
    select: { kickoffAt: true }
  });

  if (!match) {
    throw new Error("Match not found.");
  }

  if (new Date() >= match.kickoffAt) {
    throw new Error("Predictions cannot be submitted after kickoff.");
  }

  return prisma.userPrediction.upsert({
    where: {
      userId_matchId: {
        userId: input.userId,
        matchId: input.matchId
      }
    },
    create: {
      userId: input.userId,
      matchId: input.matchId,
      predictedHomeScore: input.predictedHomeScore,
      predictedAwayScore: input.predictedAwayScore,
      confidenceLevel: input.confidenceLevel,
      comment: input.comment
    },
    update: {
      predictedHomeScore: input.predictedHomeScore,
      predictedAwayScore: input.predictedAwayScore,
      confidenceLevel: input.confidenceLevel,
      comment: input.comment,
      submittedAt: new Date()
    }
  });
}
