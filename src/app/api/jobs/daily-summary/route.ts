import { NextResponse } from "next/server";
import { generateDailySummary }
from "@/lib/ranking/generate-daily-summary";

export async function GET() {

  /*const token =
    request.headers.get(
      "x-job-token"
    );

  if (
    token !==
    process.env.JOB_TOKEN
  ) {

    return NextResponse.json(
      {
        error:
          "Unauthorized"
      },
      {
        status: 401
      }
    );

  }*/

  await generateDailySummary();

  return NextResponse.json({
    success: true
  });

}