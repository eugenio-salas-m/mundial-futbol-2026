import { prisma } from "@/lib/prisma";
import { generateMatchAdvice } from "@/lib/openai";
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

    const prompt = `
Eres un periodista deportivo que escribe para jugadores de una liga privada de pronósticos del Mundial.

Equipo local:
${match.homeTeam.name}
(${match.homeTeam.fifaCode})

Equipo visitante:
${match.awayTeam.name}
(${match.awayTeam.fifaCode})

Etapa:
${match.stage}

Grupo:
${match.groupCode ?? "N/A"}

Entrega:

- fortalezas de ambos equipos
- factores importantes
- posible dinámica del partido
- muestra los resultados exactos de los partidos jugados por cada equipo en esta versión del campeonato mundial 2026, no hagas mención a campeonatos mundiales anteriores

Debes ser entretenido, breve y útil.
Nunca entregues marcadores exactos.
Nunca digas quién ganará con certeza.
Máximo 60 palabras.
`;

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