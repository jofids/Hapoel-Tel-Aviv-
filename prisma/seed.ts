import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
  demoCompetitions,
  demoCrowdSnapshots,
  demoFormSnapshots,
  demoIds,
  demoInjuries,
  demoLineups,
  demoMatches,
  demoOddsSnapshots,
  demoSeasons,
  demoStandings,
  demoTeams
} from "../src/lib/demo-data/football-demo-data";
import { runPredictionEngine } from "../src/lib/prediction/engine";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl)
});

async function main() {
  await cleanDemoRecords();

  await prisma.user.upsert({
    where: { email: "demo@predict-football.local" },
    update: {},
    create: {
      id: demoIds.demoUser,
      email: "demo@predict-football.local",
      profile: {
        create: {
          displayName: "Demo Predictor",
          locale: "he"
        }
      }
    }
  });

  for (const competition of demoCompetitions) {
    await prisma.competition.upsert({
      where: { id: competition.id },
      update: {
        name: competition.name,
        country: competition.country,
        type: competition.type,
        level: competition.level,
        externalId: competition.externalId
      },
      create: {
        id: competition.id,
        name: competition.name,
        country: competition.country,
        type: competition.type,
        level: competition.level,
        externalId: competition.externalId
      }
    });
  }

  for (const season of demoSeasons) {
    await prisma.season.upsert({
      where: {
        competitionId_name: {
          competitionId: season.competitionId,
          name: season.name
        }
      },
      update: {
        startsAt: season.startsAt,
        endsAt: season.endsAt
      },
      create: {
        id: season.id,
        competitionId: season.competitionId,
        name: season.name,
        startsAt: season.startsAt,
        endsAt: season.endsAt
      }
    });
  }

  for (const team of demoTeams) {
    const competitionId =
      team.type === "club" ? demoIds.competitionPremierLeague : demoIds.competitionWorldFriendlies;

    await prisma.team.upsert({
      where: { id: team.id },
      update: {
        name: team.name,
        shortName: team.shortName,
        country: team.country,
        type: team.type,
        ranking: team.ranking,
        externalId: team.externalId,
        competitionId
      },
      create: {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        country: team.country,
        type: team.type,
        ranking: team.ranking,
        externalId: team.externalId,
        competitionId
      }
    });
  }

  const players = [
    { teamId: demoIds.norway, name: "Erling Haaland", position: "FW", shirtNumber: 9 },
    { teamId: demoIds.norway, name: "Martin Odegaard", position: "MF", shirtNumber: 10 },
    { teamId: demoIds.iraq, name: "Aymen Hussein", position: "FW", shirtNumber: 18 },
    { teamId: demoIds.arsenal, name: "Bukayo Saka", position: "FW", shirtNumber: 7 },
    { teamId: demoIds.liverpool, name: "Mohamed Salah", position: "FW", shirtNumber: 11 }
  ];

  for (const player of players) {
    await prisma.player.create({
      data: player
    });
  }

  for (const match of demoMatches) {
    await prisma.match.upsert({
      where: { id: match.id },
      update: {
        kickoffAt: match.kickoffAt,
        status: match.status,
        venue: match.venue,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        minute: match.minute,
        stage: match.stage,
        matchImportance: match.matchImportance
      },
      create: {
        id: match.id,
        externalId: match.externalId,
        competitionId: match.competitionId,
        seasonId: match.seasonId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        kickoffAt: match.kickoffAt,
        status: match.status,
        venue: match.venue,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        minute: match.minute,
        stage: match.stage,
        matchImportance: match.matchImportance
      }
    });
  }

  for (const standing of demoStandings) {
    await prisma.standing.create({
      data: standing
    });
  }

  for (const snapshot of demoFormSnapshots) {
    await prisma.teamFormSnapshot.create({
      data: snapshot
    });
  }

  for (const match of demoMatches) {
    await prisma.matchStatistic.upsert({
      where: {
        matchId_source: {
          matchId: match.id,
          source: "demo"
        }
      },
      update: {},
      create: {
        matchId: match.id,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeExpectedGoals: null,
        awayExpectedGoals: null,
        homeShots: null,
        awayShots: null,
        source: "demo"
      }
    });
  }

  for (const lineup of demoLineups) {
    await prisma.lineup.create({
      data: lineup
    });
  }

  for (const injury of demoInjuries) {
    await prisma.injury.create({
      data: injury
    });
  }

  for (const odds of demoOddsSnapshots) {
    await prisma.oddsSnapshot.upsert({
      where: { id: odds.id },
      update: {
        homeOdds: odds.homeOdds,
        drawOdds: odds.drawOdds,
        awayOdds: odds.awayOdds,
        capturedAt: odds.capturedAt
      },
      create: odds
    });
  }

  for (const crowd of demoCrowdSnapshots) {
    await prisma.crowdPredictionSnapshot.create({
      data: {
        matchId: crowd.matchId,
        homeWinProbability: crowd.homeWinProbability,
        drawProbability: crowd.drawProbability,
        awayWinProbability: crowd.awayWinProbability,
        averageHomeScore: crowd.homeWinProbability * 2,
        averageAwayScore: crowd.awayWinProbability * 2,
        participantCount: crowd.participantCount,
        capturedAt: crowd.capturedAt
      }
    });
  }

  await prisma.modelVersion.upsert({
    where: { version: "poisson-mvp-1.0.0" },
    update: {},
    create: {
      id: demoIds.modelVersion,
      name: "Poisson MVP",
      version: "poisson-mvp-1.0.0",
      description: "Transparent Poisson model with weighted source blending.",
      parametersJson: {
        scoreMatrixMaxGoals: 6,
        expectedGoalsCap: [0.15, 4.5],
        defaultWeights: {
          model: 0.55,
          market: 0.3,
          crowd: 0.15
        }
      }
    }
  });

  for (const match of demoMatches) {
    const homeTeam = demoTeams.find((team) => team.id === match.homeTeamId);
    const awayTeam = demoTeams.find((team) => team.id === match.awayTeamId);
    const homeForm = demoFormSnapshots.find((snapshot) => snapshot.teamId === match.homeTeamId);
    const awayForm = demoFormSnapshots.find((snapshot) => snapshot.teamId === match.awayTeamId);

    if (!homeTeam || !awayTeam || !homeForm || !awayForm) {
      continue;
    }

    const prediction = runPredictionEngine({
      match,
      homeTeam,
      awayTeam,
      homeForm,
      awayForm,
      lineups: demoLineups.filter((lineup) => lineup.matchId === match.id),
      injuries: demoInjuries.filter((injury) => injury.matchId === match.id),
      oddsSnapshots: demoOddsSnapshots.filter((odds) => odds.matchId === match.id),
      crowdSnapshot: demoCrowdSnapshots.find((snapshot) => snapshot.matchId === match.id)
    });

    await prisma.modelPrediction.create({
      data: {
        matchId: match.id,
        modelVersionId: demoIds.modelVersion,
        homeExpectedGoals: prediction.homeExpectedGoals,
        awayExpectedGoals: prediction.awayExpectedGoals,
        homeWinProbability: prediction.blendedOutcomeProbabilities.homeWin,
        drawProbability: prediction.blendedOutcomeProbabilities.draw,
        awayWinProbability: prediction.blendedOutcomeProbabilities.awayWin,
        over25Probability: prediction.over25Probability,
        bothTeamsScoreProbability: prediction.bothTeamsScoreProbability,
        exactScoreMatrixJson: prediction.blendedScoreMatrix,
        topScorePredictionsJson: prediction.blendedTopScorePredictions,
        winnerConfidence: prediction.confidence.winnerConfidence,
        exactScoreConfidence: prediction.confidence.exactScoreConfidence,
        dataQualityScore: prediction.confidence.dataQualityScore,
        sourceAgreementScore: prediction.confidence.sourceAgreementScore,
        explanationJson: prediction.explanation
      }
    });
  }

  await prisma.appSetting.upsert({
    where: { key: "prediction_source_weights" },
    update: {
      valueJson: {
        model: 0.55,
        market: 0.3,
        crowd: 0.15
      }
    },
    create: {
      key: "prediction_source_weights",
      valueJson: {
        model: 0.55,
        market: 0.3,
        crowd: 0.15
      },
      description: "Default blended prediction source weights."
    }
  });

  await prisma.syncJob.create({
    data: {
      provider: "demo",
      entity: "seed",
      status: "completed",
      finishedAt: new Date(),
      recordsFetched:
        demoCompetitions.length +
        demoTeams.length +
        demoMatches.length +
        demoOddsSnapshots.length +
        demoCrowdSnapshots.length,
      metadataJson: {
        label: "Demo Mode – Data is not live"
      }
    }
  });
}

async function cleanDemoRecords() {
  const matchIds = demoMatches.map((match) => match.id);
  const teamIds = demoTeams.map((team) => team.id);

  await prisma.modelPrediction.deleteMany({ where: { matchId: { in: matchIds } } });
  await prisma.modelRun.deleteMany({ where: { matchId: { in: matchIds } } });
  await prisma.crowdPredictionSnapshot.deleteMany({ where: { matchId: { in: matchIds } } });
  await prisma.oddsSnapshot.deleteMany({ where: { matchId: { in: matchIds } } });
  await prisma.liveEvent.deleteMany({ where: { matchId: { in: matchIds } } });
  await prisma.injury.deleteMany({ where: { OR: [{ matchId: { in: matchIds } }, { teamId: { in: teamIds } }] } });
  await prisma.lineup.deleteMany({ where: { matchId: { in: matchIds } } });
  await prisma.matchStatistic.deleteMany({ where: { matchId: { in: matchIds } } });
  await prisma.teamFormSnapshot.deleteMany({ where: { teamId: { in: teamIds } } });
  await prisma.standing.deleteMany({ where: { teamId: { in: teamIds } } });
  await prisma.player.deleteMany({ where: { teamId: { in: teamIds } } });
  await prisma.syncJob.deleteMany({ where: { provider: "demo", entity: "seed" } });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
