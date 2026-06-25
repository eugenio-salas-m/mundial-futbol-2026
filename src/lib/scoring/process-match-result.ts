import { prisma } from "@/lib/prisma";
import { rebuildRankings }
from "./rebuild-rankings";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { whatsappTemplates } from "@/lib/whatsapp-templates";

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

async function sendMatchResultWhatsApps(
  matchId: string
) {
  const match =
    await prisma.match.findUnique({
      where: {
        id: matchId
      },
      include: {
        result: true,
        homeTeam: true,
        awayTeam: true
      }
    });

  if (!match?.result) {
    return;
  }

  const template =
    whatsappTemplates.match_result;

  const scores =
    await prisma.score.findMany({
      where: {
        matchId
      },
      include: {
        user: true
      }
    });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const score of scores) {
    const user =
      score.user;

    if (
      !user.whatsappNumber ||
      !user.whatsappOptIn ||
      !user.isActive
    ) {
      skipped++;
      continue;
    }

    const existingLog =
      await prisma.notificationLog.findFirst({
        where: {
          userId:
            user.id,
          matchId,
          channel:
            "whatsapp",
          templateCode:
            "match_result",
          status:
            "sent"
        }
      });

    if (existingLog) {
      skipped++;
      continue;
    }

    let log =
      await prisma.notificationLog.create({
        data: {
          userId:
            user.id,
          organizationId:
            user.organizationId,
          matchId,
          targetType:
            "user",
          channel:
            "whatsapp",
          templateCode:
            "match_result",
          status:
            "pending"
        }
      });

    try {
      await sendWhatsAppTemplate(
        user.whatsappNumber,
        "match_result",
        template.languageCode,
        [
          match.homeTeam.name,                 // {{1}}
          match.result.homeGoals.toString(),   // {{2}}
          match.awayTeam.name,                 // {{3}}
          match.result.awayGoals.toString(),   // {{4}}
          score.points.toString()              // {{5}}
        ]
      );

      await prisma.notificationLog.update({
        where: {
          id:
            log.id
        },
        data: {
          status:
            "sent",
          sentAt:
            new Date()
        }
      });

      sent++;

    } catch (error: any) {
      await prisma.notificationLog.update({
        where: {
          id:
            log.id
        },
        data: {
          status:
            "failed",
          errorMessage:
            error.message
        }
      });

      failed++;

      console.error(
        `[WHATSAPP MATCH RESULT] Error user ${user.id}`,
        error.message
      );
    }
  }

  console.log(
    `[WHATSAPP MATCH RESULT] match ${matchId}: sent=${sent}, skipped=${skipped}, failed=${failed}`
  );

}


export async function processMatchResult(
  matchId: string
) {
  const match =
    await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        result: true,
        homeTeam: true,
        awayTeam: true
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

  await sendMatchResultWhatsApps(matchId);

  await rebuildRankings(matchId);
}