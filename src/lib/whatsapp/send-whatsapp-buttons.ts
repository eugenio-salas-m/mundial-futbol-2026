import { prisma } from "@/lib/prisma";
import { ConversationSession } from "@prisma/client";

export interface WhatsAppButton {
  id: string;
  title: string;
}
  
type SendWhatsAppButtonsRequest = {
  session: ConversationSession;
  phoneNumber: string;
  body: string;
  buttons: WhatsAppButton[]
  notificationLogId?: string
};

export async function sendWhatsAppButtons({
  session,
  phoneNumber,
  body,
  buttons,
  notificationLogId
}: SendWhatsAppButtonsRequest) {
  
    const requestPayload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: body
        },
        action: {
          buttons:
            buttons.map(button => ({
              type: "reply",
              reply: {
                id: button.id,
                title: button.title
              }
            }))
        }
      }
    };
  
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
          body:
            JSON.stringify(requestPayload)
        }
      );
  
    const providerResponse =
      await response.json();
  
    if (!response.ok) {
      throw new Error(
        JSON.stringify(providerResponse)
      );
    }
  
    await prisma.conversationMessage.create({
      data: {
      sessionId:
          session.id,
      direction:
          "outgoing",
      messageType:
          "text",
      text:
        body,
      providerMessageId:
        providerResponse.messages?.[0]?.id ?? null,
      notificationLogId:
        notificationLogId,
      payload:
        providerResponse
      }
    });

    await prisma.conversationSession.update({
      where: {
          id:
          session.id
      },
      data: {
          lastMessageAt:
              new Date()
      }
  });

    return {
      providerMessageId:
        providerResponse.messages?.[0]?.id ?? null,
      requestPayload,
      providerResponse
  
    };
  
  }