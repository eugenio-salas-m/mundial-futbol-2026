import { NextResponse } from "next/server";
import { sendMatchReminders } from "@/lib/whatsapp/send-match-reminders";

export async function POST(
    request: Request
) {

    try {

        //
        // Seguridad simple mediante API Key
        //

        const apiKey =
            request.headers.get("x-api-key");

        if (
            apiKey !== process.env.CRON_API_KEY
        ) {

            return NextResponse.json(
                {
                    error: "Unauthorized"
                },
                {
                    status: 401
                }
            );

        }

        const result =
            await sendMatchReminders();

        return NextResponse.json({

            success: true,

            ...result

        });

    }
    catch (error: any) {

        console.error(
            "[MATCH REMINDERS]",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error: error.message
            },
            {
                status: 500
            }
        );

    }

}