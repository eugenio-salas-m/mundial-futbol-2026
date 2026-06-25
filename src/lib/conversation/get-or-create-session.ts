import { prisma } from "@/lib/prisma";
import {
    Prisma,
    ConversationChannel
  } from "@prisma/client";

export async function getOrCreateSession(
    channel: ConversationChannel,
    phoneNumber: string
) {

    let session =
        await prisma.conversationSession.findUnique({
            where: {
                channel_phoneNumber: {
                  channel,
                  phoneNumber
                }
            }
        });

    if (session) {
        return session;
    }

    return prisma.conversationSession.create({
        data: {
            channel,
            phoneNumber,
            lastMessageAt:
                new Date()
        }
    });

}