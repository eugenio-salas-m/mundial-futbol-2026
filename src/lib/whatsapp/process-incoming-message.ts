import { processConversation } from "@/lib/conversation/process-conversation";
import { ConversationChannel } from "@prisma/client";
import { normalizePhoneNumber } from "@/lib/utils/phone";

export async function processIncomingMessage(
    message: any,
    contact: any
) {

    let text = "";
    let buttonId: string | undefined;

    switch (message.type) {
        case "text":
            text =
                message.text.body;
            break;
        case "button": 

            text =
                message.button?.text;
        
            buttonId =
                message.button?.payload;
        
            break;
            
        case "interactive":
            if (
                message.interactive?.type === "button_reply"
            ) {
                text =
                    message.interactive.button_reply.title;
                buttonId =
                    message.interactive.button_reply.id;
            }
            break;
        default:
            console.log(
                `[INCOMING] Unsupported message type: ${message.type}`
            );
            return;

    }

    await processConversation({
        channel:
            ConversationChannel.whatsapp,
        phoneNumber:
            normalizePhoneNumber(message.from),
        userName:
            contact?.profile?.name,
        messageId:
            message.id,
        timestamp:
            Number(message.timestamp),
        text,
        buttonId
    });

    console.log(
        `[INCOMING] ${contact?.profile?.name}: ${text}`
    );

}