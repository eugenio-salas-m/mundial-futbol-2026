import { prisma } from "@/lib/prisma";
import { generateMatchAdvice } from "@/lib/openai";
import { buildMatchPrompt } from "@/lib/matches/build-match-prompt";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  try {
    const {
      matchId
    } =
      await request.json();

    const match =
      await prisma.match.findUnique({
        where: {
          id: matchId
        },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      });

    if (!match) {
      return NextResponse.json(
        {
          error:
            "Partido no encontrado"
        },
        {
          status: 404
        }
      );
    }

    const prompt =
      await buildMatchPrompt(
          match
      );

    const advice =
      await generateMatchAdvice(
        prompt
      );

    return NextResponse.json({
      advice
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "No fue posible generar consejo"
      },
      {
        status: 500
      }
    );

  }

}