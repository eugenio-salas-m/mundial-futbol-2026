import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send-whatsapp-message";
import { getOrCreateSession } from "./get-or-create-session";
import { ConversationChannel } from "@prisma/client";

export interface ConversationRequest {
    channel: ConversationChannel;
    phoneNumber: string;
    userName?: string;
    messageId: string;
    timestamp: number;
    text: string;
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
        request.phoneNumber
    );

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

  const text =
    request.text
      .trim()
      .toLowerCase();

  let response =
    "Recibí tu mensaje correctamente.";

  let newState =
    session.state;

  switch (text) {

    case "hola":

      response =
`Hola ${request.userName ?? ""} 👋

Soy el asistente de Mundial Fútbol 2026 ⚽

Puedo ayudarte con:

🏆 Ranking

⚽ Pronósticos

📅 Próximos partidos

Escribe lo que necesitas.`;

      newState =
        "main_menu";

      break;

    case "ranking":

      response =
        "Pronto podrás consultar tu ranking directamente desde WhatsApp.";

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

  await sendWhatsAppMessage(

    request.phoneNumber,

    response

  );

  //
  // Registrar mensaje saliente
  //

  await prisma.conversationMessage.create({

    data: {

      sessionId:
        session.id,

      direction:
        "outgoing",

      messageType:
        "text",

      text:
        response

    }

  });

  //
  // Actualizar sesión
  //

  await prisma.conversationSession.update({

    where: {

      id:
        session.id

    },

    data: {

      state:
        newState,

      lastMessageAt:
        new Date()

    }

  });

}