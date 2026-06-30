-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- Enable UUID generation for database-side audit snapshots
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('AVAILABLE', 'DOUBTFUL', 'INJURED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LiveEventType" AS ENUM ('GOAL', 'CARD', 'SUBSTITUTION', 'VAR', 'INJURY', 'PERIOD', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'he',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" UUID NOT NULL,
    "external_id" TEXT,
    "name" TEXT NOT NULL,
    "country" TEXT,
    "type" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" UUID NOT NULL,
    "competition_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "external_id" TEXT,
    "competition_id" UUID,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "country" TEXT,
    "type" TEXT NOT NULL DEFAULT 'club',
    "ranking" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "external_id" TEXT,
    "team_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "shirt_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "external_id" TEXT,
    "competition_id" UUID NOT NULL,
    "season_id" UUID NOT NULL,
    "home_team_id" UUID NOT NULL,
    "away_team_id" UUID NOT NULL,
    "kickoff_at" TIMESTAMP(3) NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "venue" TEXT,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "minute" INTEGER,
    "match_importance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "stage" TEXT NOT NULL DEFAULT 'league',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_statistics" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "home_team_id" UUID NOT NULL,
    "away_team_id" UUID NOT NULL,
    "home_expected_goals" DOUBLE PRECISION,
    "away_expected_goals" DOUBLE PRECISION,
    "home_shots" INTEGER,
    "away_shots" INTEGER,
    "home_shots_on_target" INTEGER,
    "away_shots_on_target" INTEGER,
    "home_possession" DOUBLE PRECISION,
    "away_possession" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'demo',
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_form_snapshots" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_five_goals_for" DOUBLE PRECISION NOT NULL,
    "last_five_goals_against" DOUBLE PRECISION NOT NULL,
    "last_ten_goals_for" DOUBLE PRECISION NOT NULL,
    "last_ten_goals_against" DOUBLE PRECISION NOT NULL,
    "home_goals_for" DOUBLE PRECISION NOT NULL,
    "home_goals_against" DOUBLE PRECISION NOT NULL,
    "away_goals_for" DOUBLE PRECISION NOT NULL,
    "away_goals_against" DOUBLE PRECISION NOT NULL,
    "xg_for" DOUBLE PRECISION,
    "xg_against" DOUBLE PRECISION,
    "opponent_strength_average" DOUBLE PRECISION NOT NULL,
    "rest_days" INTEGER NOT NULL,
    "fixture_congestion_index" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "team_form_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "standings" (
    "id" UUID NOT NULL,
    "competition_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "played" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "goal_diff" INTEGER NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineups" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "player_id" UUID,
    "player_name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "is_starting" BOOLEAN NOT NULL DEFAULT false,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "availability" "Availability" NOT NULL DEFAULT 'AVAILABLE',
    "source" TEXT NOT NULL DEFAULT 'demo',
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lineups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "injuries" (
    "id" UUID NOT NULL,
    "match_id" UUID,
    "team_id" UUID NOT NULL,
    "player_id" UUID,
    "player_name" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "severity" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expected_end" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'demo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "injuries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_events" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "external_id" TEXT,
    "type" "LiveEventType" NOT NULL,
    "minute" INTEGER NOT NULL,
    "team_id" UUID,
    "player_name" TEXT,
    "description" TEXT NOT NULL,
    "payload_json" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "odds_snapshots" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "bookmaker" TEXT NOT NULL,
    "home_odds" DOUBLE PRECISION NOT NULL,
    "draw_odds" DOUBLE PRECISION NOT NULL,
    "away_odds" DOUBLE PRECISION NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "odds_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_versions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parameters_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_runs" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "model_version_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "input_json" JSONB NOT NULL,
    "output_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_predictions" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "model_version_id" UUID NOT NULL,
    "home_expected_goals" DOUBLE PRECISION NOT NULL,
    "away_expected_goals" DOUBLE PRECISION NOT NULL,
    "home_win_probability" DOUBLE PRECISION NOT NULL,
    "draw_probability" DOUBLE PRECISION NOT NULL,
    "away_win_probability" DOUBLE PRECISION NOT NULL,
    "over_2_5_probability" DOUBLE PRECISION NOT NULL,
    "both_teams_score_probability" DOUBLE PRECISION NOT NULL,
    "exact_score_matrix_json" JSONB NOT NULL,
    "top_score_predictions_json" JSONB NOT NULL,
    "winner_confidence" DOUBLE PRECISION NOT NULL,
    "exact_score_confidence" DOUBLE PRECISION NOT NULL,
    "data_quality_score" DOUBLE PRECISION NOT NULL,
    "source_agreement_score" DOUBLE PRECISION NOT NULL,
    "explanation_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_predictions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "predicted_home_score" INTEGER NOT NULL,
    "predicted_away_score" INTEGER NOT NULL,
    "confidence_level" INTEGER NOT NULL,
    "comment" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_at" TIMESTAMP(3),
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "is_exact" BOOLEAN NOT NULL DEFAULT false,
    "is_outcome_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_prediction_snapshots" (
    "id" UUID NOT NULL,
    "user_prediction_id" UUID NOT NULL,
    "predicted_home_score" INTEGER NOT NULL,
    "predicted_away_score" INTEGER NOT NULL,
    "confidence_level" INTEGER NOT NULL,
    "comment" TEXT,
    "change_reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_prediction_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crowd_prediction_snapshots" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "home_win_probability" DOUBLE PRECISION NOT NULL,
    "draw_probability" DOUBLE PRECISION NOT NULL,
    "away_win_probability" DOUBLE PRECISION NOT NULL,
    "average_home_score" DOUBLE PRECISION NOT NULL,
    "average_away_score" DOUBLE PRECISION NOT NULL,
    "participant_count" INTEGER NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crowd_prediction_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_snapshots" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "exact_hits" INTEGER NOT NULL,
    "outcome_hits" INTEGER NOT NULL,
    "prediction_count" INTEGER NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_jobs" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "records_fetched" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "metadata_json" JSONB,

    CONSTRAINT "sync_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value_json" JSONB NOT NULL,
    "description" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "before_json" JSONB,
    "after_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "competitions_external_id_key" ON "competitions"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_competition_id_name_key" ON "seasons"("competition_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_external_id_key" ON "teams"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "players_external_id_key" ON "players"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_external_id_key" ON "matches"("external_id");

-- CreateIndex
CREATE INDEX "matches_kickoff_at_idx" ON "matches"("kickoff_at");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "match_statistics_match_id_source_key" ON "match_statistics"("match_id", "source");

-- CreateIndex
CREATE INDEX "team_form_snapshots_team_id_captured_at_idx" ON "team_form_snapshots"("team_id", "captured_at");

-- CreateIndex
CREATE UNIQUE INDEX "standings_competition_id_team_id_captured_at_key" ON "standings"("competition_id", "team_id", "captured_at");

-- CreateIndex
CREATE INDEX "lineups_match_id_team_id_idx" ON "lineups"("match_id", "team_id");

-- CreateIndex
CREATE INDEX "injuries_team_id_status_idx" ON "injuries"("team_id", "status");

-- CreateIndex
CREATE INDEX "live_events_match_id_minute_idx" ON "live_events"("match_id", "minute");

-- CreateIndex
CREATE UNIQUE INDEX "live_events_match_id_external_id_key" ON "live_events"("match_id", "external_id");

-- CreateIndex
CREATE INDEX "odds_snapshots_match_id_captured_at_idx" ON "odds_snapshots"("match_id", "captured_at");

-- CreateIndex
CREATE UNIQUE INDEX "model_versions_version_key" ON "model_versions"("version");

-- CreateIndex
CREATE INDEX "model_runs_match_id_created_at_idx" ON "model_runs"("match_id", "created_at");

-- CreateIndex
CREATE INDEX "model_predictions_match_id_created_at_idx" ON "model_predictions"("match_id", "created_at");

-- CreateIndex
CREATE INDEX "user_predictions_match_id_idx" ON "user_predictions"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_predictions_user_id_match_id_key" ON "user_predictions"("user_id", "match_id");

-- CreateIndex
CREATE INDEX "user_prediction_snapshots_user_prediction_id_created_at_idx" ON "user_prediction_snapshots"("user_prediction_id", "created_at");

-- CreateIndex
CREATE INDEX "crowd_prediction_snapshots_match_id_captured_at_idx" ON "crowd_prediction_snapshots"("match_id", "captured_at");

-- CreateIndex
CREATE INDEX "leaderboard_snapshots_captured_at_rank_idx" ON "leaderboard_snapshots"("captured_at", "rank");

-- CreateIndex
CREATE INDEX "sync_jobs_provider_entity_started_at_idx" ON "sync_jobs"("provider", "entity", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_key_key" ON "app_settings"("key");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_statistics" ADD CONSTRAINT "match_statistics_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_statistics" ADD CONSTRAINT "match_statistics_home_team_id_fkey" FOREIGN KEY ("home_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_statistics" ADD CONSTRAINT "match_statistics_away_team_id_fkey" FOREIGN KEY ("away_team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_form_snapshots" ADD CONSTRAINT "team_form_snapshots_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_competition_id_fkey" FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "standings" ADD CONSTRAINT "standings_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineups" ADD CONSTRAINT "lineups_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "injuries" ADD CONSTRAINT "injuries_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "injuries" ADD CONSTRAINT "injuries_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "injuries" ADD CONSTRAINT "injuries_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "odds_snapshots" ADD CONSTRAINT "odds_snapshots_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_runs" ADD CONSTRAINT "model_runs_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_runs" ADD CONSTRAINT "model_runs_model_version_id_fkey" FOREIGN KEY ("model_version_id") REFERENCES "model_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_predictions" ADD CONSTRAINT "model_predictions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_predictions" ADD CONSTRAINT "model_predictions_model_version_id_fkey" FOREIGN KEY ("model_version_id") REFERENCES "model_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_predictions" ADD CONSTRAINT "user_predictions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prediction_snapshots" ADD CONSTRAINT "user_prediction_snapshots_user_prediction_id_fkey" FOREIGN KEY ("user_prediction_id") REFERENCES "user_predictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crowd_prediction_snapshots" ADD CONSTRAINT "crowd_prediction_snapshots_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain constraints
ALTER TABLE "matches"
  ADD CONSTRAINT "matches_scores_non_negative"
  CHECK (
    ("home_score" IS NULL OR "home_score" >= 0)
    AND ("away_score" IS NULL OR "away_score" >= 0)
    AND ("minute" IS NULL OR "minute" >= 0)
    AND "match_importance" BETWEEN 0 AND 1
  );

ALTER TABLE "match_statistics"
  ADD CONSTRAINT "match_statistics_non_negative"
  CHECK (
    ("home_expected_goals" IS NULL OR "home_expected_goals" >= 0)
    AND ("away_expected_goals" IS NULL OR "away_expected_goals" >= 0)
    AND ("home_shots" IS NULL OR "home_shots" >= 0)
    AND ("away_shots" IS NULL OR "away_shots" >= 0)
    AND ("home_shots_on_target" IS NULL OR "home_shots_on_target" >= 0)
    AND ("away_shots_on_target" IS NULL OR "away_shots_on_target" >= 0)
    AND ("home_possession" IS NULL OR "home_possession" BETWEEN 0 AND 100)
    AND ("away_possession" IS NULL OR "away_possession" BETWEEN 0 AND 100)
  );

ALTER TABLE "team_form_snapshots"
  ADD CONSTRAINT "team_form_snapshots_metric_ranges"
  CHECK (
    "last_five_goals_for" >= 0
    AND "last_five_goals_against" >= 0
    AND "last_ten_goals_for" >= 0
    AND "last_ten_goals_against" >= 0
    AND "home_goals_for" >= 0
    AND "home_goals_against" >= 0
    AND "away_goals_for" >= 0
    AND "away_goals_against" >= 0
    AND ("xg_for" IS NULL OR "xg_for" >= 0)
    AND ("xg_against" IS NULL OR "xg_against" >= 0)
    AND "opponent_strength_average" BETWEEN 0 AND 1
    AND "rest_days" >= 0
    AND "fixture_congestion_index" BETWEEN 0 AND 1
  );

ALTER TABLE "lineups"
  ADD CONSTRAINT "lineups_player_name_not_blank"
  CHECK (length(trim("player_name")) > 0);

ALTER TABLE "injuries"
  ADD CONSTRAINT "injuries_severity_range"
  CHECK ("severity" BETWEEN 0 AND 1);

ALTER TABLE "odds_snapshots"
  ADD CONSTRAINT "odds_snapshots_decimal_odds_valid"
  CHECK ("home_odds" > 1 AND "draw_odds" > 1 AND "away_odds" > 1);

ALTER TABLE "model_predictions"
  ADD CONSTRAINT "model_predictions_probability_ranges"
  CHECK (
    "home_expected_goals" BETWEEN 0.15 AND 4.5
    AND "away_expected_goals" BETWEEN 0.15 AND 4.5
    AND "home_win_probability" BETWEEN 0 AND 1
    AND "draw_probability" BETWEEN 0 AND 1
    AND "away_win_probability" BETWEEN 0 AND 1
    AND "over_2_5_probability" BETWEEN 0 AND 1
    AND "both_teams_score_probability" BETWEEN 0 AND 1
    AND "winner_confidence" BETWEEN 0 AND 1
    AND "exact_score_confidence" BETWEEN 0 AND 1
    AND "data_quality_score" BETWEEN 0 AND 1
    AND "source_agreement_score" BETWEEN 0 AND 1
  );

ALTER TABLE "model_predictions"
  ADD CONSTRAINT "model_predictions_1x2_probability_total"
  CHECK (abs(("home_win_probability" + "draw_probability" + "away_win_probability") - 1) <= 0.001);

ALTER TABLE "user_predictions"
  ADD CONSTRAINT "user_predictions_score_and_confidence_ranges"
  CHECK (
    "predicted_home_score" >= 0
    AND "predicted_away_score" >= 0
    AND "confidence_level" BETWEEN 1 AND 5
    AND "points_awarded" >= 0
  );

ALTER TABLE "user_prediction_snapshots"
  ADD CONSTRAINT "user_prediction_snapshots_score_and_confidence_ranges"
  CHECK (
    "predicted_home_score" >= 0
    AND "predicted_away_score" >= 0
    AND "confidence_level" BETWEEN 1 AND 5
  );

ALTER TABLE "crowd_prediction_snapshots"
  ADD CONSTRAINT "crowd_prediction_snapshots_probability_ranges"
  CHECK (
    "home_win_probability" BETWEEN 0 AND 1
    AND "draw_probability" BETWEEN 0 AND 1
    AND "away_win_probability" BETWEEN 0 AND 1
    AND abs(("home_win_probability" + "draw_probability" + "away_win_probability") - 1) <= 0.001
    AND "average_home_score" >= 0
    AND "average_away_score" >= 0
    AND "participant_count" >= 0
  );

-- Prediction locking and snapshot audit
CREATE OR REPLACE FUNCTION prevent_late_user_prediction()
RETURNS TRIGGER AS $$
DECLARE
  kickoff TIMESTAMP(3);
BEGIN
  SELECT "kickoff_at" INTO kickoff FROM "matches" WHERE "id" = NEW."match_id";

  IF kickoff IS NOT NULL AND NEW."submitted_at" >= kickoff THEN
    RAISE EXCEPTION 'Predictions cannot be submitted after kickoff';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_late_user_prediction_insert
BEFORE INSERT ON "user_predictions"
FOR EACH ROW
EXECUTE FUNCTION prevent_late_user_prediction();

CREATE OR REPLACE FUNCTION snapshot_user_prediction_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    OLD."predicted_home_score" IS DISTINCT FROM NEW."predicted_home_score"
    OR OLD."predicted_away_score" IS DISTINCT FROM NEW."predicted_away_score"
    OR OLD."confidence_level" IS DISTINCT FROM NEW."confidence_level"
    OR OLD."comment" IS DISTINCT FROM NEW."comment"
  ) THEN
    INSERT INTO "user_prediction_snapshots" (
      "id",
      "user_prediction_id",
      "predicted_home_score",
      "predicted_away_score",
      "confidence_level",
      "comment",
      "change_reason",
      "created_at"
    )
    VALUES (
      gen_random_uuid(),
      OLD."id",
      OLD."predicted_home_score",
      OLD."predicted_away_score",
      OLD."confidence_level",
      OLD."comment",
      'before_update',
      CURRENT_TIMESTAMP
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER snapshot_user_prediction_update
BEFORE UPDATE ON "user_predictions"
FOR EACH ROW
EXECUTE FUNCTION snapshot_user_prediction_change();
