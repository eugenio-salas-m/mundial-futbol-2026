import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendWhatsAppTemplate } from "@/lib/whatsapp/send-whatsapp-template";
import {
  whatsappTemplates,
  type WhatsAppTemplateCode
} from "@/lib/whatsapp/whatsapp-templates";
import { getOrCreateSession } from "@/lib/conversation/get-or-create-session";
import { ConversationChannel, ConversationState, Prisma } from "@prisma/client";
import { sendMatchReminders } from "@/lib/whatsapp/send-match-reminders";

function getChileNow() {
  return new Date(
    new Date().toLocaleString(
      "en-US",
      {
        timeZone: "America/Santiago"
      }
    )
  );
}

export async function POST(
  request: Request
) {

  const {
    authUserId,
    userId,
    templateCode
  } =
    await request.json();

  const sender =
    await prisma.user.findFirst({
      where: {
        authUserId
      }
    });

  if (
    !sender ||
    sender.role !==
      "organization_admin" ||
    !sender.organizationId
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

  const target =
    await prisma.user.findFirst({
      where: {
        id:
          userId
      }
    });

  if (!target) {

    return NextResponse.json(
      {
        error:
          "Usuario no encontrado"
      },
      {
        status: 404
      }
    );

  }

  if (
    target.organizationId !==
    sender.organizationId
  ) {

    return NextResponse.json(
      {
        error:
          "El usuario no pertenece a tu organización"
      },
      {
        status: 403
      }
    );

  }

  if (
    !target.whatsappNumber ||
    !target.whatsappOptIn
  ) {

    return NextResponse.json(
      {
        error:
          "El usuario no tiene WhatsApp habilitado"
      },
      {
        status: 400
      }
    );

  }

  const template =
    whatsappTemplates[
      templateCode as WhatsAppTemplateCode
    ];

  if (!template) {

    return NextResponse.json(
      {
        error:
          "Template inválido"
      },
      {
        status: 400
      }
    );

  }

  type WhatsAppParameter =
  | string
  | {
      name: string;
      value: string;
    };

  let parameters: WhatsAppParameter[] = [];

  if (
    templateCode ===
    "reminder_prediction"
  ) {
  
    const now = getChileNow();

    const todayStart =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );

    const tomorrowStart =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0
      );

    const pendingMatches =
      await prisma.match.findMany({
        where: {
          status: "scheduled",
          startsAtChile: {
            gte: todayStart,
            lt: tomorrowStart
          },
          predictionClosesAt: {
            gt: now
          },
          predictions: {
            none: {
              userId: target.id
            }
          }
        },
    
        include: {
          homeTeam: true,
          awayTeam: true
        }
    
      });
    
    console.log(
      `[WHATSAPP] ${target.nickname} tiene ${pendingMatches.length} pronósticos pendientes desde ${todayStart} hasta ${tomorrowStart}  ahora ${now}`
    );
    
    pendingMatches.forEach(match => {
      console.log(
        `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.startsAtChile.toISOString()}`
      );
    });
  
    if (
      pendingMatches.length === 0
    ) {
  
      return NextResponse.json(
        {
          error:
            "El usuario no tiene pronósticos pendientes"
        },
        {
          status: 400
        }
      );
  
    }

    parameters = [
      {
        name: "nombre",
        value: target.nickname
      }
    ];
  
  }

  if (
    templateCode ===
    "ranking_update"
  ) {

    const standing =
      await prisma.userStanding.findFirst({
        where: {
          userId:
            target.id
        }
      });

      parameters = [
        {
          name:
            "nombre",
          value:
            target.nickname
        },
        {
          name:
            "posicion",
          value:
            standing?.organizationRank?.toString() ?? "-"
        },
        {
          name:
            "puntaje",
          value:
            standing?.totalPoints?.toString() ?? "0"
        }
      ];

  }

  if (
    templateCode ===
    "match_result"
  ) {

    const lastScore =
    await prisma.score.findFirst({

      where: {
        userId:
          target.id
      },

      include: {

        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }

      },

      orderBy: {
        calculatedAt:
          "desc"
      }

    });

    if (!lastScore) {
      return NextResponse.json(
        {
          error:
            "No existen resultados calculados"
        },
        {
          status: 400
        }
      );
    }

    const result =
      await prisma.matchResult.findFirst({
        where: {
          matchId:
            lastScore.matchId
        }
      });

    if (!result) {

      return NextResponse.json(
        {
          error:
            "Resultado no encontrado"
        },
        {
          status: 400
        }
      );

    }

    parameters = [
      lastScore.match.homeTeam.name,          // {{1}}
      result.homeGoals.toString(),            // {{2}}
      lastScore.match.awayTeam.name,          // {{3}}
      result.awayGoals.toString(),            // {{4}}
      lastScore.points.toString()             // {{5}}
    ];

  }

  if (
    templateCode ===
    "match_reminder"
  ) {
    await sendMatchReminders(
      userId
    );

    return NextResponse.json({
        success: true
    });
  
  }

  let log =
    await prisma.notificationLog.create({
      data: {
        userId:
          target.id,
        organizationId:
          sender.organizationId,
        targetType:
          "user",
        channel:
          "whatsapp",
        templateCode,
        status:
          "pending"
      }
    });

  try {

    const result =
      await sendWhatsAppTemplate({
        phoneNumber:
          target.whatsappNumber!,
        templateName:
          templateCode,
        languageCode:
          template.languageCode,
        parameters
      });

    log =
      await prisma.notificationLog.update({
        where: {
          id:
            log.id
        },
        data: {
          status:
            "sent",
          sentAt:
            new Date(),
          providerMessageId:
            result.providerMessageId,
          requestPayload:
            result.requestPayload,
          providerResponse:
            result.providerResponse
        }
      });

    const session =
      await getOrCreateSession(
          ConversationChannel.whatsapp,
          target.whatsappNumber!
      );

    session.state = ConversationState.main_menu;
    if ( templateCode === "match_reminder" ) { session.state = ConversationState.prediction_help; } 

    await prisma.conversationSession.update({
        where: {
            id: session.id
        },
        data: {
            state: session.state,
            context: Prisma.DbNull,
            lastMessageAt: new Date()
        }
    });

    return NextResponse.json({
      ok: true,
      log
    });

  } catch (error: any) {

    log =
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

    return NextResponse.json(
      {
        error:
          "Error enviando WhatsApp",
        detail:
          error.message
      },
      {
        status: 500
      }
    );

  }

}