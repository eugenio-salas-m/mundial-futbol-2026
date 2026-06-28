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
      awayGoals,
      qualifiedTeamId
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
      homeGoals < 0 ||
      awayGoals < 0
    ) {
      return NextResponse.json(
        {
          error: "Marcador erróneo",
        },
        {
          status: 400,
        }
      );
    }

    if (
      homeGoals > 99 ||
      awayGoals > 99
    ) {
      return NextResponse.json(
        {
          error: "Marcador erróneo",
        },
        {
          status: 400,
        }
      );
    }


    if (
      match?.stage !== "group_stage" &&
      homeGoals === awayGoals &&
      !qualifiedTeamId
    ) {
      return NextResponse.json(
        {
          error: "Debe seleccionar el equipo clasificado.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      qualifiedTeamId &&
      qualifiedTeamId !== match?.homeTeamId &&
      qualifiedTeamId !== match?.awayTeamId
    ) {
      return NextResponse.json(
        {
          error: "Equipo clasificado inválido.",
        },
        {
          status: 400,
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

    let winnerTeamId = qualifiedTeamId;

    if (homeGoals > awayGoals) {
      winnerTeamId = match.homeTeamId;
    } else if (awayGoals > homeGoals) {
      winnerTeamId = match.awayTeamId;
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
        awayGoals,
        qualifiedTeamId: winnerTeamId
      },
      create: {
        userId: user.id,
        matchId,
        homeGoals,
        awayGoals,
        qualifiedTeamId: winnerTeamId
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