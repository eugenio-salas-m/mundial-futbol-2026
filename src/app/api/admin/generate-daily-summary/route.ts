import { prisma } from "@/lib/prisma";
import { generateDailySummary } from "@/lib/ranking/generate-daily-summary";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {

  try {

    const {
      authUserId
    } = await request.json();

    const user =
      await prisma.user.findFirst({
        where: {
          authUserId
        }
      });

    if (
      !user ||
      user.role !== "super_admin"
    ) {

      return NextResponse.json(
        {
          error: "No autorizado"
        },
        {
          status: 403
        }
      );

    }

    await generateDailySummary();

    return NextResponse.json({
      success: true
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Error interno"
      },
      {
        status: 500
      }
    );

  }

}