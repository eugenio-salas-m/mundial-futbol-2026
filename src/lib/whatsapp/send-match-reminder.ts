import { prisma } from "@/lib/prisma";
import { sendWhatsAppTemplate } from "@/lib/whatsapp/send-whatsapp-template";
import { whatsappTemplates } from "@/lib/whatsapp/whatsapp-templates";
import { getOrCreateSession } from "@/lib/conversation/get-or-create-session";
import { ConversationChannel, ConversationState, Prisma } from "@prisma/client";

type WhatsAppParameter =
  | string
  | {
      name: string;
      value: string;
    };

export async function sendMatchReminder(
  user: any,
  match: any
) {

  const template =
    whatsappTemplates.match_reminder;

  //
  // Crear NotificationLog
  //

  const log =
    await prisma.notificationLog.create({
      data: {
        userId:
          user.id,
        organizationId:
          user.organizationId,
        matchId:
          match.id,
        targetType:
          "user",
        channel:
          "whatsapp",
        templateCode:
          "match_reminder",
        status:
          "pending"
      }
    });

  try {

    const now = new Date();

    const diffMs =
      match.startsAtChile.getTime() -
      now.getTime();

    const diffMinutes =
      Math.max(0, Math.round(diffMs / 60000));

    let tiempo = "";

    if (diffMinutes < 60) {
      tiempo = `${diffMinutes} minutos`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      tiempo =
        minutes === 0
          ? `${hours} hora${hours === 1 ? "" : "s"}`
          : `${hours} hora${hours === 1 ? "" : "s"} y ${minutes} minutos`;
    }

    let parameters: WhatsAppParameter[] = [
        {
          name: "local",
          value: match.homeTeam.name
        },
        {
          name: "visita",
          value: match.awayTeam.name
        },
        {
          name: "tiempo",
          value: tiempo
        }
    ];

    const result =
        await sendWhatsAppTemplate({
            phoneNumber:
                user.whatsappNumber!,
            templateName:
                "match_reminder",
            languageCode:
                template.languageCode,
            parameters
        });

   

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
          user.whatsappNumber!
      );

    session.state = ConversationState.prediction_help;

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

    console.log(
      `[MATCH REMINDER] ${user.nickname} ${match.homeTeam.name} vs ${match.awayTeam.name}`
    );

  }
  catch (error: any) {
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

    throw error;

  }

}