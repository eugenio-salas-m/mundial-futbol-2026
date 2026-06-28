import { prisma } from "@/lib/prisma";
import { Match, Team } from "@prisma/client";
import { NextResponse } from "next/server";

type MatchWithTeams =
  Match & {
    homeTeam: Team;
    awayTeam: Team;
  };

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

export async function buildMatchPrompt(match: MatchWithTeams) {

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
    `;

    return prompt;
}