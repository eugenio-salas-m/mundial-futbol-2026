import { prisma } from "@/lib/prisma";
import { ConversationSession } from "@prisma/client";

type SendWhatsAppMessageRequest = {
  session: ConversationSession;
  phoneNumber: string;
  text: string;
  notificationLogId?: string
};

export async function sendWhatsAppMessage({
  session,
  phoneNumber,
  text,
  notificationLogId
}: SendWhatsAppMessageRequest) {
  
    const body = {
        messaging_product:
          "whatsapp",
        to:
          phoneNumber,
        type:
          "text",
        text: {
          body:
            text
        }
      };

    console.log("[WHATSAPP OUTGOING]",JSON.stringify(body));

    const response =
      await fetch(
        `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type":
              "application/json"
          },
  
          body: JSON.stringify(body)
        }
      );
  
    const data =
      await response.json();
  
    console.log("[WHATSAPP RESPONSE]",JSON.stringify(data));

    if (!response.ok) {
      throw new Error(
        JSON.stringify(data)
      );
    }
  
    
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
        text,
      providerMessageId:
        data.messages?.[0]?.id ?? null,
      notificationLogId:
        notificationLogId,
      payload:
        data
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
            session.state,
        lastMessageAt:
            new Date()
        }
    });

    return {
      providerMessageId:
        data.messages?.[0]?.id ?? null,
      providerResponse:
        data,
      requestPayload:
        body
    };
  
  }