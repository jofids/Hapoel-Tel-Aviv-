import type {
  Competition,
  CrowdWisdomSnapshot,
  Injury,
  Lineup,
  LiveEvent,
  Match,
  OddsSnapshot,
  Season,
  Standing,
  Team,
  TeamFormSnapshot
} from "@/lib/domain/football";

export const demoIds = {
  competitionWorldFriendlies: "11111111-1111-4111-8111-111111111111",
  competitionPremierLeague: "22222222-2222-4222-8222-222222222222",
  season2026: "33333333-3333-4333-8333-333333333333",
  seasonPremier2026: "44444444-4444-4444-8444-444444444444",
  norway: "55555555-5555-4555-8555-555555555555",
  iraq: "66666666-6666-4666-8666-666666666666",
  arsenal: "77777777-7777-4777-8777-777777777777",
  liverpool: "88888888-8888-4888-8888-888888888888",
  matchNorwayIraq: "99999999-9999-4999-8999-999999999999",
  matchArsenalLiverpool: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  modelVersion: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  demoUser: "cccccccc-cccc-4ccc-8ccc-cccccccccccc"
};

const futureDate = (daysFromNow: number, hour = 19) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
};

export const demoCompetitions: Competition[] = [
  {
    id: demoIds.competitionWorldFriendlies,
    externalId: "demo-world-friendlies",
    name: "International Friendlies",
    country: "Global",
    type: "international",
    level: 2
  },
  {
    id: demoIds.competitionPremierLeague,
    externalId: "demo-premier-league",
    name: "Premier League",
    country: "England",
    type: "club",
    level: 1
  }
];

export const demoSeasons: Season[] = [
  {
    id: demoIds.season2026,
    competitionId: demoIds.competitionWorldFriendlies,
    name: "2026",
    startsAt: new Date("2026-01-01T00:00:00.000Z"),
    endsAt: new Date("2026-12-31T23:59:59.000Z")
  },
  {
    id: demoIds.seasonPremier2026,
    competitionId: demoIds.competitionPremierLeague,
    name: "2026/27",
    startsAt: new Date("2026-08-01T00:00:00.000Z"),
    endsAt: new Date("2027-05-31T23:59:59.000Z")
  }
];

export const demoTeams: Team[] = [
  {
    id: demoIds.norway,
    externalId: "demo-norway",
    name: "Norway",
    shortName: "NOR",
    country: "Norway",
    type: "national",
    ranking: 27
  },
  {
    id: demoIds.iraq,
    externalId: "demo-iraq",
    name: "Iraq",
    shortName: "IRQ",
    country: "Iraq",
    type: "national",
    ranking: 58
  },
  {
    id: demoIds.arsenal,
    externalId: "demo-arsenal",
    name: "Arsenal",
    shortName: "ARS",
    country: "England",
    type: "club",
    ranking: 6
  },
  {
    id: demoIds.liverpool,
    externalId: "demo-liverpool",
    name: "Liverpool",
    shortName: "LIV",
    country: "England",
    type: "club",
    ranking: 4
  }
];

export const demoMatches: Match[] = [
  {
    id: demoIds.matchNorwayIraq,
    externalId: "demo-norway-iraq-2026",
    competitionId: demoIds.competitionWorldFriendlies,
    seasonId: demoIds.season2026,
    homeTeamId: demoIds.norway,
    awayTeamId: demoIds.iraq,
    kickoffAt: futureDate(7, 18),
    status: "SCHEDULED",
    venue: "Ullevaal Stadion",
    stage: "friendly",
    matchImportance: 0.35
  },
  {
    id: demoIds.matchArsenalLiverpool,
    externalId: "demo-arsenal-liverpool-2026",
    competitionId: demoIds.competitionPremierLeague,
    seasonId: demoIds.seasonPremier2026,
    homeTeamId: demoIds.arsenal,
    awayTeamId: demoIds.liverpool,
    kickoffAt: futureDate(10, 16),
    status: "SCHEDULED",
    venue: "Emirates Stadium",
    stage: "league",
    matchImportance: 0.82
  }
];

export const demoStandings: Standing[] = [
  {
    competitionId: demoIds.competitionPremierLeague,
    teamId: demoIds.liverpool,
    position: 2,
    played: 24,
    points: 52,
    goalDiff: 28
  },
  {
    competitionId: demoIds.competitionPremierLeague,
    teamId: demoIds.arsenal,
    position: 3,
    played: 24,
    points: 50,
    goalDiff: 24
  }
];

export const demoFormSnapshots: TeamFormSnapshot[] = [
  {
    teamId: demoIds.norway,
    lastFiveGoalsFor: 2.4,
    lastFiveGoalsAgainst: 0.8,
    lastTenGoalsFor: 2.1,
    lastTenGoalsAgainst: 1.0,
    homeGoalsFor: 2.2,
    homeGoalsAgainst: 0.7,
    awayGoalsFor: 1.8,
    awayGoalsAgainst: 1.2,
    xgFor: 2.05,
    xgAgainst: 0.88,
    opponentStrengthAverage: 0.63,
    restDays: 5,
    fixtureCongestionIndex: 0.2
  },
  {
    teamId: demoIds.iraq,
    lastFiveGoalsFor: 1.1,
    lastFiveGoalsAgainst: 1.2,
    lastTenGoalsFor: 1.25,
    lastTenGoalsAgainst: 1.15,
    homeGoalsFor: 1.4,
    homeGoalsAgainst: 0.9,
    awayGoalsFor: 0.95,
    awayGoalsAgainst: 1.35,
    xgFor: 1.0,
    xgAgainst: 1.3,
    opponentStrengthAverage: 0.51,
    restDays: 4,
    fixtureCongestionIndex: 0.35
  },
  {
    teamId: demoIds.arsenal,
    lastFiveGoalsFor: 2.0,
    lastFiveGoalsAgainst: 0.9,
    lastTenGoalsFor: 1.85,
    lastTenGoalsAgainst: 0.95,
    homeGoalsFor: 2.25,
    homeGoalsAgainst: 0.75,
    awayGoalsFor: 1.55,
    awayGoalsAgainst: 1.1,
    xgFor: 1.95,
    xgAgainst: 0.93,
    opponentStrengthAverage: 0.77,
    restDays: 6,
    fixtureCongestionIndex: 0.18
  },
  {
    teamId: demoIds.liverpool,
    lastFiveGoalsFor: 2.2,
    lastFiveGoalsAgainst: 1.1,
    lastTenGoalsFor: 2.05,
    lastTenGoalsAgainst: 1.05,
    homeGoalsFor: 2.35,
    homeGoalsAgainst: 0.85,
    awayGoalsFor: 1.85,
    awayGoalsAgainst: 1.25,
    xgFor: 2.12,
    xgAgainst: 1.02,
    opponentStrengthAverage: 0.79,
    restDays: 4,
    fixtureCongestionIndex: 0.42
  }
];

export const demoLineups: Lineup[] = [
  {
    matchId: demoIds.matchNorwayIraq,
    teamId: demoIds.norway,
    playerName: "Erling Haaland",
    position: "FW",
    isStarting: true,
    isConfirmed: false,
    availability: "AVAILABLE"
  },
  {
    matchId: demoIds.matchNorwayIraq,
    teamId: demoIds.norway,
    playerName: "Martin Odegaard",
    position: "MF",
    isStarting: true,
    isConfirmed: false,
    availability: "AVAILABLE"
  },
  {
    matchId: demoIds.matchNorwayIraq,
    teamId: demoIds.iraq,
    playerName: "Aymen Hussein",
    position: "FW",
    isStarting: true,
    isConfirmed: false,
    availability: "DOUBTFUL"
  },
  {
    matchId: demoIds.matchArsenalLiverpool,
    teamId: demoIds.arsenal,
    playerName: "Bukayo Saka",
    position: "FW",
    isStarting: true,
    isConfirmed: false,
    availability: "AVAILABLE"
  },
  {
    matchId: demoIds.matchArsenalLiverpool,
    teamId: demoIds.liverpool,
    playerName: "Mohamed Salah",
    position: "FW",
    isStarting: true,
    isConfirmed: false,
    availability: "AVAILABLE"
  }
];

export const demoInjuries: Injury[] = [
  {
    matchId: demoIds.matchNorwayIraq,
    teamId: demoIds.iraq,
    playerName: "Demo center back",
    reason: "minor hamstring issue",
    status: "doubtful",
    severity: 0.35,
    startsAt: new Date("2026-06-25T00:00:00.000Z")
  },
  {
    matchId: demoIds.matchArsenalLiverpool,
    teamId: demoIds.liverpool,
    playerName: "Demo rotation midfielder",
    reason: "suspension",
    status: "suspended",
    severity: 0.25,
    startsAt: new Date("2026-06-20T00:00:00.000Z")
  }
];

export const demoLiveEvents: LiveEvent[] = [];

export const demoOddsSnapshots: OddsSnapshot[] = [
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    matchId: demoIds.matchNorwayIraq,
    provider: "demo",
    bookmaker: "Demo Book",
    homeOdds: 1.55,
    drawOdds: 4.1,
    awayOdds: 6.8,
    capturedAt: new Date()
  },
  {
    id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    matchId: demoIds.matchArsenalLiverpool,
    provider: "demo",
    bookmaker: "Demo Book",
    homeOdds: 2.35,
    drawOdds: 3.45,
    awayOdds: 2.95,
    capturedAt: new Date()
  }
];

export const demoCrowdSnapshots: CrowdWisdomSnapshot[] = [
  {
    matchId: demoIds.matchNorwayIraq,
    homeWinProbability: 0.68,
    drawProbability: 0.2,
    awayWinProbability: 0.12,
    participantCount: 214,
    capturedAt: new Date()
  },
  {
    matchId: demoIds.matchArsenalLiverpool,
    homeWinProbability: 0.41,
    drawProbability: 0.27,
    awayWinProbability: 0.32,
    participantCount: 531,
    capturedAt: new Date()
  }
];
