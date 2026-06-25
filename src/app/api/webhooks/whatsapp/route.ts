import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processIncomingMessage }
from "@/lib/whatsapp/process-incoming-message";

export async function GET(
  request: Request
) {

  const { searchParams } =
    new URL(request.url);

  const mode =
    searchParams.get(
      "hub.mode"
    );

  const token =
    searchParams.get(
      "hub.verify_token"
    );

  const challenge =
    searchParams.get(
      "hub.challenge"
    );

  if (

    mode === "subscribe" &&

    token ===
      process.env
        .WHATSAPP_VERIFY_TOKEN

  ) {

    return new Response(
      challenge,
      {
        status: 200
      }
    );

  }

  return NextResponse.json(
    {
      error:
        "Forbidden"
    },
    {
      status: 403
    }
  );

}

export async function POST(
    request: Request
  ) {
  
    const body =
      await request.json();
  
    for (const entry of body.entry ?? []) {
        for (const change of entry.changes ?? []) {
            const value = change.value;
      
            const statuses =  value?.statuses;
      
            if (
                statuses &&
                statuses.length > 0
            ) {
                for (
                    const status
                    of statuses
                ) {
                    const log =
                        await prisma.notificationLog.findFirst({
                            where: {
                            providerMessageId:
                                status.id
                            }
                        });
                    if (!log) {
                        console.log(`[WHATSAPP STATUS] Message ${status.id} not found`);
                        continue;
                    } else {
                        let newStatus = log.status;
                        switch (status.status) {
                        case "sent":
                            newStatus = "sent";
                            break;
                        case "delivered":
                            newStatus = "delivered";
                            break;
                        case "read":
                            newStatus = "read";
                            break;
                        case "failed":
                            newStatus = "failed";
                            break;
                        default:
                            continue;
                        }
                        if (
                            newStatus !==
                            log.status
                        ) {
                            await prisma.notificationLog.update({
                                where: {
                                id:
                                    log.id
                                },
                                data: {
                                status:
                                    newStatus
                                }
                            });
                            console.log(`[WHATSAPP STATUS] ${log.providerMessageId} -> ${newStatus}`);
                        }
                    }
                }
            }

            
            const messages =  value?.messages;
            const contacts = value?.contacts;
            if (
                messages &&
                messages.length > 0
            ) {
                for (
                    let i = 0;
                    i < messages.length;
                    i++
                ) {
                    await processIncomingMessage(
                        messages[i],
                        contacts?.[i]
                    );
                }
            }
      
        }
    }
      

    console.log(
      "[WHATSAPP WEBHOOK]",
      JSON.stringify(
        body,
        null,
        2
      )
    );
  
    return NextResponse.json({
      success: true
    });
  
  }
