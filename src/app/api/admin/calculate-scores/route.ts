import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getMatchOutcome(
  homeGoals: number,
  awayGoals: number
) {

  if (homeGoals > awayGoals) {
    return "home";
  }

  if (awayGoals > homeGoals) {
    return "away";
  }

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

  if (
    predictedOutcome ===
    actualOutcome
  ) {

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
    predictionQualifiedTeamId ===
    actualQualifiedTeamId
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

export async function POST(
  request: Request
) {

  try {

    const {
      authUserId
    } = await request.json();

    const currentUser =
      await prisma.user.findFirst({
        where: {
          authUserId
        }
      });

    if (
      !currentUser ||
      currentUser.role !==
      "super_admin"
    ) {

      return NextResponse.json(
        {
          error:
            "No autorizado"
        },
        {
          status: 403
        }
      );

    }

    const predictions =
      await prisma.prediction.findMany({
        include: {
          match: {
            include: {
              result: true
            }
          }
        }
      });

    let processed = 0;

    for (
      const prediction
      of predictions
    ) {

      const result =
        prediction.match.result;

      if (!result) {
        continue;
      }

      let score;

      if (
        prediction.match.stage ===
        "group_stage"
      ) {

        score =
          calculateGroupStagePoints(
            prediction.homeGoals,
            prediction.awayGoals,
            result.homeGoals,
            result.awayGoals
          );

      } else {

        score =
          calculateKnockoutPoints(
            prediction.match.stage,
            prediction.homeGoals,
            prediction.awayGoals,
            result.homeGoals,
            result.awayGoals,
            prediction.qualifiedTeamId,
            result.qualifiedTeamId
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

      processed++;

    }


    return NextResponse.json({

      success: true,

      processed

    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Error interno"
      },
      {
        status: 500
      }
    );

  }

}