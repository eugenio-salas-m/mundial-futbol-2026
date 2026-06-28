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

    let parameters: WhatsAppParameter[] = [
        {
          name: "nombre",
          value: user.nickname
        },
        {
          name: "local",
          value: match.homeTeam.name
        },
        {
          name: "visita",
          value: match.awayTeam.name
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