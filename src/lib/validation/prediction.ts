import { z } from "zod";

export const matchIdSchema = z.object({
  matchId: z.string().uuid()
});

export const userPredictionSchema = z.object({
  userId: z.string().uuid(),
  matchId: z.string().uuid(),
  predictedHomeScore: z.number().int().min(0).max(30),
  predictedAwayScore: z.number().int().min(0).max(30),
  confidenceLevel: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional()
});

export const predictionWeightsSchema = z.object({
  modelWeight: z.number().min(0).max(1).default(0.55),
  marketWeight: z.number().min(0).max(1).default(0.3),
  crowdWeight: z.number().min(0).max(1).default(0.15)
});

export type UserPredictionInput = z.infer<typeof userPredictionSchema>;
