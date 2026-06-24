import { prisma } from "@/lib/prisma";
import { rebuildRankings }
from "./rebuild-rankings";

function getMatchOutcome(
  homeGoals: number,
  awayGoals: number
) {
  if (homeGoals > awayGoals) return "home";
  if (awayGoals > homeGoals) return "away";
  return "draw";
}

function calculateGroupStagePoints(
  predictionHome: number,
  predictionAway: number,
  resultHome: number,
  resultAway: number
) {
  let resultPoints = 0;
  let exactScorePoints = 0;

  const predictedOutcome =
    getMatchOutcome(
      predictionHome,
      predictionAway
    );

  const actualOutcome =
    getMatchOutcome(
      resultHome,
      resultAway
    );

  if (predictedOutcome === actualOutcome) {
    resultPoints = 1;
  }

  if (
    predictionHome === resultHome &&
    predictionAway === resultAway
  ) {
    exactScorePoints = 3;
  }

  return {
    resultPoints,
    exactScorePoints,
    qualifiedPoints: 0,
    points:
      resultPoints +
      exactScorePoints
  };
}

function calculateKnockoutPoints(
  stage: string,
  predictionHome: number,
  predictionAway: number,
  resultHome: number,
  resultAway: number,
  predictionQualifiedTeamId?: string | null,
  actualQualifiedTeamId?: string | null
) {
  let qualifiedPoints = 0;
  let exactScorePoints = 0;

  let qualifiedValue = 0;
  let exactValue = 0;

  switch (stage) {
    case "round_of_32":
    case "round_of_16":
      qualifiedValue = 2;
      exactValue = 4;
      break;

    case "quarter_final":
      qualifiedValue = 3;
      exactValue = 6;
      break;

    case "semi_final":
      qualifiedValue = 4;
      exactValue = 8;
      break;

    case "final":
      qualifiedValue = 6;
      exactValue = 12;
      break;
  }

  if (
    predictionQualifiedTeamId &&
    actualQualifiedTeamId &&
    predictionQualifiedTeamId === actualQualifiedTeamId
  ) {
    qualifiedPoints =
      qualifiedValue;
  }

  if (
    predictionHome === resultHome &&
    predictionAway === resultAway
  ) {
    exactScorePoints =
      exactValue;
  }

  return {
    resultPoints: 0,
    exactScorePoints,
    qualifiedPoints,
    points:
      qualifiedPoints +
      exactScorePoints
  };
}

export async function processMatchResult(
  matchId: string
) {
  const match =
    await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        result: true
      }
    });

  if (!match?.result) {
    return;
  }

  const predictions =
    await prisma.prediction.findMany({
      where: {
        matchId
      }
    });

  for (const prediction of predictions) {
    let score;

    if (
      match.stage ===
      "group_stage"
    ) {
      score =
        calculateGroupStagePoints(
          prediction.homeGoals,
          prediction.awayGoals,
          match.result.homeGoals,
          match.result.awayGoals
        );
    } else {
      score =
        calculateKnockoutPoints(
          match.stage,
          prediction.homeGoals,
          prediction.awayGoals,
          match.result.homeGoals,
          match.result.awayGoals,
          prediction.qualifiedTeamId,
          match.result.qualifiedTeamId
        );
    }

    await prisma.score.upsert({
      where: {
        userId_matchId: {
          userId:
            prediction.userId,
          matchId:
            prediction.matchId
        }
      },

      update: {
        points:
          score.points,

        resultPoints:
          score.resultPoints,

        exactScorePoints:
          score.exactScorePoints,

        qualifiedPoints:
          score.qualifiedPoints,

        calculatedAt:
          new Date()
      },

      create: {
        userId:
          prediction.userId,

        matchId:
          prediction.matchId,

        points:
          score.points,

        resultPoints:
          score.resultPoints,

        exactScorePoints:
          score.exactScorePoints,

        qualifiedPoints:
          score.qualifiedPoints
      }
    });
  }

  console.log(
    `[MATCH ${matchId}] ${predictions.length} predictions processed`
  );

  await rebuildRankings(matchId);
}