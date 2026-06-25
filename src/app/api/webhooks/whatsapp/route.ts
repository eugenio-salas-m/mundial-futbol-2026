import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  
    const statuses =
      body.entry?.[0]
          ?.changes?.[0]
          ?.value?.statuses;

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
                console.log(
                    `[WHATSAPP STATUS] Message ${status.id} not found`
                );
                continue;
            }
            
            if(log){

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
                    console.log(
                        `[WHATSAPP STATUS] ${log.providerMessageId} -> ${newStatus}`
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
