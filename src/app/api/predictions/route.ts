import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {

  try {

    const {
      authUserId,
      matchId,
      homeGoals,
      awayGoals
    } = await request.json();

    const user =
      await prisma.user.findFirst({
        where: {
          authUserId
        }
      });

    if (!user) {

      return NextResponse.json(
        {
          error: "Usuario no encontrado"
        },
        {
          status: 404
        }
      );

    }

    const match =
      await prisma.match.findUnique({
        where: {
          id: matchId
        }
      });

    if (!match) {

      return NextResponse.json(
        {
          error: "Partido no encontrado"
        },
        {
          status: 404
        }
      );

    }

    if (
      match.predictionClosesAt <
      new Date()
    ) {

      return NextResponse.json(
        {
          error:
            "Predicción cerrada"
        },
        {
          status: 400
        }
      );

    }

    await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId
        }
      },
      update: {
        homeGoals,
        awayGoals
      },
      create: {
        userId: user.id,
        matchId,
        homeGoals,
        awayGoals
      }
    });

    return NextResponse.json({
      success: true
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Error interno"
      },
      {
        status: 500
      }
    );

  }

}