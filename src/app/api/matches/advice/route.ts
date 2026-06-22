import { prisma } from "@/lib/prisma";
import { generateMatchAdvice } from "@/lib/openai";
import { NextResponse } from "next/server";

function formatHistory(
    matches: any[]
  ) {
  
    return matches
      .filter(
        match => match.result
      )
      .map(
        match =>
          `${match.homeTeam.fifaCode} ${match.result.homeGoals}-${match.result.awayGoals} ${match.awayTeam.fifaCode}`
      )
      .join("\n");
  
  }

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

    const homeHistory =
        await prisma.match.findMany({
    
        where: {
    
            status: "finished",
    
            OR: [
    
            {
                homeTeamId:
                match.homeTeamId
            },
    
            {
                awayTeamId:
                match.homeTeamId
            }
    
            ]
    
        },
    
        include: {
    
            homeTeam: true,
            awayTeam: true,
            result: true
    
        },
    
        orderBy: {
            startsAtChile: "desc"
        },
    
        take: 3
  
    });
  
    const awayHistory =
        await prisma.match.findMany({
    
        where: {
    
            status: "finished",
    
            OR: [
    
            {
                homeTeamId:
                match.awayTeamId
            },
    
            {
                awayTeamId:
                match.awayTeamId
            }
    
            ]
    
        },
    
        include: {
    
            homeTeam: true,
            awayTeam: true,
            result: true
    
        },
    
        orderBy: {
            startsAtChile: "desc"
        },
    
        take: 3
    
    });


    const prompt = `
        Analiza este partido del Mundial de futbol 2026 utilizando únicamente los datos proporcionados.

        Partido:

        ${match.homeTeam.name} (${match.homeTeam.fifaCode})

        vs

        ${match.awayTeam.name} (${match.awayTeam.fifaCode})

        Grupo:
        ${match.groupCode ?? "N/A"}

        Últimos resultados del local:

        ${formatHistory(homeHistory)}

        Últimos resultados del visitante:

        ${formatHistory(awayHistory)}
       
        Genera un comentario breve indicando:

        1. Momento reciente de cada selección.
        2. Aspectos que podrían influir.
        3. Qué tipo de partido podría esperarse.


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