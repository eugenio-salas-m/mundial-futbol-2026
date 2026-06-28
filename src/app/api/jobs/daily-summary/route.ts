import { NextResponse } from "next/server";
import { generateDailySummary }
from "@/lib/ranking/generate-daily-summary";
import { sendDailySummaryToAll }
from "@/lib/email/send-daily-summary-to-all";
import { sendDailySummaryWhatsAppToAll }
from "@/lib/whatsapp/send-daily-summary-to-all";
export async function GET() {

  /*
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
  */

  await generateDailySummary();

  await sendDailySummaryToAll();

  try {
    await sendDailySummaryWhatsAppToAll();
  }
  catch (error) {
    console.error(error);
  }

  return NextResponse.json({
    success: true
  });

}