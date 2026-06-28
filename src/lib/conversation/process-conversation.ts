import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send-whatsapp-message";
import { getOrCreateSession } from "@/lib/conversation/get-or-create-session";
import { ConversationChannel, ConversationState  } from "@prisma/client";
import { handleMatchReminderConversation } from "./handlers/match-reminder";

export interface ConversationRequest {
    channel: ConversationChannel;
    phoneNumber: string;
    userName?: string;
    messageId: string;
    timestamp: number;
    text: string;
    buttonId?: string;
}

export async function processConversation(
  request: ConversationRequest
) {

    console.log(
        "[CONVERSATION]",
        request
    );

    const session =
        await getOrCreateSession(
            request.channel,
            request.phoneNumber!
        );

    const user =
        await prisma.user.findFirst({
          where: {
            whatsappNumber:
              request.phoneNumber
          }
        });


    const normalizedText =
        request.text.trim().toLowerCase();


    const lastNotification =
        user
          ? await prisma.notificationLog.findFirst({
              where: {
                userId: user.id,
                channel: "whatsapp",
                status: {
                  in: [
                    "delivered",
                    "read"
                  ]
                }
              },
              orderBy: {
                createdAt: "desc"
              }
            })
          : null;

    
    //
    // Registrar mensaje entrante
    //

    await prisma.conversationMessage.create({
        data: {
        sessionId:
            session.id,
        direction:
            "incoming",
        messageType:
            "text",
        text:
            request.text,
        providerMessageId:
            request.messageId,
        notificationLogId:
            lastNotification?.id ?? undefined,
        payload:
            {
                text: request.text,
                messageId: request.messageId,
                channel: request.channel.toString(),
                phoneNumber: request.phoneNumber,
                timestamp: request.timestamp,
                userName: request.userName
            }
        }
    });

    if (
        user &&
        session &&
        lastNotification &&
        lastNotification.templateCode === "match_reminder" &&
        (lastNotification.status === "delivered" || lastNotification.status === "read") && 
        lastNotification.matchId
    ) {

        await prisma.conversationSession.update({
            where: {
              id: session.id
            },
            data: {
              userId: user.id,
              organizationId: user.organizationId,
              lastMessageAt: new Date()
            }
          });

        session.userId =
            user.id;

        session.organizationId =
            user.organizationId;
          
        await handleMatchReminderConversation({
            session,
            notificationLog: lastNotification,
            request
        });
        return;
    }

    let response = "Recibí tu mensaje correctamente.";
    session.state = ConversationState.main_menu;

    switch (normalizedText) {
        case "hola":
            response =
`Hola ${request.userName ?? ""} 👋

Soy el asistente de Mundial Fútbol 2026 ⚽

Puedo ayudarte con:

🏆 Ranking

⚽ Pronósticos

📅 Próximos partidos

Escribe lo que necesitas.`;

        
        break;

    case "ranking":
      response = "Pronto podrás consultar tu ranking directamente desde WhatsApp.";
      break;

    case "ayuda":
      response =
`Puedo ayudarte a:

• Consultar tu ranking

• Recordar partidos pendientes

• Completar tus pronósticos

Muy pronto también responderé preguntas usando IA.`;

      break;

    }

    const responseMessage =
        await sendWhatsAppMessage({
            session,
            phoneNumber: request.phoneNumber,
            text: response,
            notificationLogId: lastNotification?.id
        });

    await prisma.conversationSession.update({
        where: {
            id: session.id
        },
        data: {
            state: session.state
        }
    });

}