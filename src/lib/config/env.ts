import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalUrl = z.preprocess(emptyStringToUndefined, z.string().url().optional());
const optionalString = z.preprocess(emptyStringToUndefined, z.string().optional());

const envSchema = z.object({
  DATABASE_URL: optionalUrl,
  DIRECT_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  FOOTBALL_DATA_PROVIDER: optionalString,
  FOOTBALL_DATA_API_KEY: optionalString,
  FOOTBALL_DATA_API_BASE_URL: optionalUrl,
  ODDS_PROVIDER: optionalString,
  ODDS_API_KEY: optionalString,
  ODDS_API_BASE_URL: optionalUrl,
  PREDICTION_MODEL_WEIGHT: z.coerce.number().min(0).max(1).default(0.55),
  PREDICTION_MARKET_WEIGHT: z.coerce.number().min(0).max(1).default(0.3),
  PREDICTION_CROWD_WEIGHT: z.coerce.number().min(0).max(1).default(0.15)
});

export const env = envSchema.parse(process.env);
