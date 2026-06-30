# Predict Football

Predict Football is a responsive, RTL-ready football prediction foundation built with Next.js,
TypeScript, PostgreSQL, Prisma, Zod, React Query, Tailwind CSS, and a shadcn-style component
layer.

The application displays statistical predictions only. It does not guarantee match outcomes or
gambling returns.

Footer disclaimer used by the product:

> The system displays statistical predictions only. It is not possible to guarantee the outcome of a
> football match. Gambling may result in financial loss.

## Architecture

- **Frontend shell**: Next.js App Router, TypeScript, Tailwind CSS, RTL layout, dark-mode-compatible
  CSS variables, React Query provider.
- **Database**: PostgreSQL with Prisma ORM and SQL migrations.
- **Provider layer**: `FootballDataProvider` and `OddsProvider` interfaces keep business logic
  independent from specific external APIs.
- **Demo Mode**: used when provider API keys are not configured. It returns deterministic seeded
  demonstration data and exposes the label `Demo Mode – Data is not live`.
- **Live Mode**: enabled by configuring football data and odds provider environment variables.
- **Prediction domain**: transparent Poisson MVP model, odds normalization, source blending,
  confidence scoring, and explanation generation.
- **Server-side operations**: API routes expose upcoming matches, match predictions, and user
  prediction submission.

## Folder Structure

```txt
prisma/
  migrations/                     SQL migrations
  schema.prisma                   Prisma data model
  seed.ts                         Demo seed data
src/
  app/                            Next.js App Router routes
    api/                          Server-side API routes
  components/
    providers/                    React Query provider
    ui/                           shadcn-style UI primitives
  lib/
    config/                       Environment and runtime mode
    db/                           Prisma client factory
    demo-data/                    Demo Mode data foundation
    domain/                       Shared football domain types
    prediction/                   Poisson, odds, blending, confidence, explanations
    providers/                    Data-provider interfaces and implementations
    validation/                   Zod schemas
```

## Database Structure

The initial migration creates:

- `users`
- `profiles`
- `competitions`
- `seasons`
- `teams`
- `players`
- `matches`
- `match_statistics`
- `team_form_snapshots`
- `standings`
- `lineups`
- `injuries`
- `live_events`
- `odds_snapshots`
- `model_versions`
- `model_runs`
- `model_predictions`
- `user_predictions`
- `user_prediction_snapshots`
- `crowd_prediction_snapshots`
- `leaderboard_snapshots`
- `sync_jobs`
- `app_settings`
- `audit_logs`

Important constraints:

- one user prediction per user per match;
- user predictions cannot be submitted after kickoff;
- probabilities are constrained to `0..1`;
- scores and count metrics cannot be negative;
- meaningful user prediction edits create a snapshot through a database trigger.

## Implementation Stages

1. Project setup: Next.js App Router, TypeScript, Tailwind, React Query, Prisma 7 configuration.
2. Database foundation: Prisma schema, PostgreSQL migration, constraints, triggers, demo seed data.
3. Provider architecture: data-provider interfaces, HTTP adapters, working demo providers.
4. Prediction core: Poisson expected-goals model, score matrix, odds conversion, source blending.
5. Trust layer: winner confidence, exact-score confidence, data quality, source agreement, and
   explanation factors.
6. Server operations: API routes and Zod validation.

## Prediction Engine

The MVP model calculates:

- home expected goals;
- away expected goals;
- score probability matrix from `0-0` through `6-6`;
- 1X2 probabilities;
- over/under 2.5 probability;
- both teams to score probability;
- top three exact scores;
- blended 1X2 prediction from model, market odds, and crowd wisdom;
- confidence and explanation details.

Expected goals consider:

- recent goals scored and conceded;
- xG and xGA when available;
- last five and last ten match form;
- opponent strength;
- home and away performance;
- team ranking;
- home advantage;
- rest days;
- fixture congestion;
- injuries and suspensions;
- lineup availability;
- match importance and stage.

Expected goals are capped between `0.15` and `4.5`.

Default blending weights:

- statistical model: `55%`;
- market odds: `30%`;
- crowd wisdom: `15%`.

When a source is unavailable, its weight is redistributed across available sources.

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

The app can start in Demo Mode without a database connection as long as routes that require Prisma
are not called. For database-backed operations, configure `DATABASE_URL`.

## Database Migration

```bash
cp .env.example .env
# edit DATABASE_URL and DIRECT_URL
npm run db:generate
npm run db:migrate
```

The migration SQL is stored in:

```txt
prisma/migrations/20260630065400_init/migration.sql
```

## Seed Data

```bash
npm run db:seed
```

The seed inserts deterministic demonstration data:

- demo competitions, seasons, teams, players, matches;
- team form snapshots;
- lineups and injuries;
- odds snapshots;
- crowd prediction snapshots;
- Poisson model version and model predictions;
- default app settings.

Demo data is clearly identified by the product label:

```txt
Demo Mode – Data is not live
```

## API Routes

```txt
GET  /api/matches
GET  /api/predictions/:matchId
POST /api/user-predictions
```

`POST /api/user-predictions` body:

```json
{
  "userId": "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  "matchId": "99999999-9999-4999-8999-999999999999",
  "predictedHomeScore": 2,
  "predictedAwayScore": 0,
  "confidenceLevel": 4,
  "comment": "Optional note"
}
```

## External API Integration

The code depends on interfaces, not provider-specific response shapes:

```ts
interface FootballDataProvider {
  getCompetitions(): Promise<Competition[]>;
  getTeams(): Promise<Team[]>;
  getTeamById(teamId: string): Promise<Team | null>;
  getUpcomingMatches(): Promise<Match[]>;
  getMatchById(matchId: string): Promise<Match | null>;
  getTeamRecentMatches(teamId: string): Promise<Match[]>;
  getStandings(competitionId: string): Promise<Standing[]>;
  getLineups(matchId: string): Promise<Lineup[]>;
  getInjuries(matchId: string): Promise<Injury[]>;
  getLiveEvents(matchId: string): Promise<LiveEvent[]>;
}

interface OddsProvider {
  getMatchOdds(matchId: string): Promise<OddsSnapshot[]>;
}
```

To connect a live provider:

1. Create an adapter that implements `FootballDataProvider` or `OddsProvider`.
2. Normalize the provider response into the domain types under `src/lib/domain/football.ts`.
3. Register the adapter in `src/lib/providers/provider-factory.ts`.
4. Configure the required environment variables.

The included HTTP adapters expect generic REST endpoints and bearer-token authentication. They are
intended as a complete integration boundary that can be adapted to a specific vendor.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | for DB operations | PostgreSQL connection string used by Prisma |
| `DIRECT_URL` | optional | Direct PostgreSQL URL for managed providers |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Supabase service role key for server-only operations |
| `FOOTBALL_DATA_PROVIDER` | optional | Live football data provider name |
| `FOOTBALL_DATA_API_KEY` | optional | Football data provider API key |
| `FOOTBALL_DATA_API_BASE_URL` | optional | Football data provider base URL |
| `ODDS_PROVIDER` | optional | Live odds provider name |
| `ODDS_API_KEY` | optional | Odds provider API key |
| `ODDS_API_BASE_URL` | optional | Odds provider base URL |
| `PREDICTION_MODEL_WEIGHT` | optional | Default model weight, `0.55` |
| `PREDICTION_MARKET_WEIGHT` | optional | Default market weight, `0.30` |
| `PREDICTION_CROWD_WEIGHT` | optional | Default crowd weight, `0.15` |

## Deployment

1. Provision PostgreSQL or Supabase.
2. Set all production environment variables.
3. Run Prisma migrations:

   ```bash
   npm run db:migrate
   ```

4. Optionally seed demo data in non-production environments:

   ```bash
   npm run db:seed
   ```

5. Build and start:

   ```bash
   npm run build
   npm run start
   ```

For Vercel, set the environment variables in the project dashboard and run migrations from a secure
deployment step or CI job.

## Development Commands

```bash
npm run dev
npm run typecheck
npm run test
npm run build
```