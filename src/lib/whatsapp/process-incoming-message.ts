import { processConversation } from "@/lib/conversation/process-conversation";
import { ConversationChannel } from "@prisma/client";

export async function processIncomingMessage(
    message: any,
    contact: any
) {
    if (
        message.type !== "text"
    ) {
        return;
    }

    await processConversation({
        channel: ConversationChannel.whatsapp,
        phoneNumber:
            message.from,
        userName:
            contact?.profile?.name,
        messageId:
            message.id,
        timestamp:
            Number(
                message.timestamp
            ),
        text:
            message.text.body
    });
    console.log(`[INCOMING] ${contact?.profile?.name}: ${message.text.body}`);
}
