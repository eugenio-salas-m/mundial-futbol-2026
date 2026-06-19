import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {

  const results =
    await prisma.matchResult.findMany({
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });

  const teams:
    Record<
      string,
      {
        teamId: string;
        fifaCode: string;
        name: string;
        flagUrl: string | null;
        points: number;
        goalsFor: number;
        goalsAgainst: number;
        wins: number;
        draws: number;
        losses: number;
      }
    > = {};

  const ensureTeam =
    (
      team: any
    ) => {

      if (
        !teams[team.id]
      ) {

        teams[team.id] = {

          teamId:
            team.id,

          fifaCode:
            team.fifaCode,

          name:
            team.name,

          flagUrl:
            team.flagUrl,

          points: 0,

          goalsFor: 0,

          goalsAgainst: 0,

          wins: 0,

          draws: 0,

          losses: 0

        };

      }

    };

  results.forEach(
    (
      result
    ) => {

      const homeTeam =
        result.match.homeTeam;

      const awayTeam =
        result.match.awayTeam;

      ensureTeam(
        homeTeam
      );

      ensureTeam(
        awayTeam
      );

      teams[
        homeTeam.id
      ].goalsFor +=
        result.homeGoals;

      teams[
        homeTeam.id
      ].goalsAgainst +=
        result.awayGoals;

      teams[
        awayTeam.id
      ].goalsFor +=
        result.awayGoals;

      teams[
        awayTeam.id
      ].goalsAgainst +=
        result.homeGoals;

      if (
        result.homeGoals >
        result.awayGoals
      ) {

        teams[
          homeTeam.id
        ].points += 3;

        teams[
          homeTeam.id
        ].wins++;

        teams[
          awayTeam.id
        ].losses++;

      }
      else if (
        result.homeGoals <
        result.awayGoals
      ) {

        teams[
          awayTeam.id
        ].points += 3;

        teams[
          awayTeam.id
        ].wins++;

        teams[
          homeTeam.id
        ].losses++;

      }
      else {

        teams[
          homeTeam.id
        ].points++;

        teams[
          awayTeam.id
        ].points++;

        teams[
          homeTeam.id
        ].draws++;

        teams[
          awayTeam.id
        ].draws++;

      }

    }
  );

  const allTeams =
    Object.values(
      teams
    );

  const topTeams =
    [...allTeams]
      .sort(
        (
          a,
          b
        ) => {

          if (
            b.points !==
            a.points
          ) {

            return (
              b.points -
              a.points
            );

          }

          const gdA =
            a.goalsFor -
            a.goalsAgainst;

          const gdB =
            b.goalsFor -
            b.goalsAgainst;

          if (
            gdB !==
            gdA
          ) {

            return (
              gdB - gdA
            );

          }

          return (
            b.goalsFor -
            a.goalsFor
          );

        }
      )
      .slice(
        0,
        3
      );

  const topScorers =
    [...allTeams]
      .sort(
        (
          a,
          b
        ) =>
          b.goalsFor -
          a.goalsFor
      )
      .slice(
        0,
        3
      )
      .map(
        (
          team
        ) => ({

          teamId:
            team.teamId,

          fifaCode:
            team.fifaCode,

          name:
            team.name,

          flagUrl:
            team.flagUrl,

          goals:
            team.goalsFor

        })
      );

  return NextResponse.json({

    topTeams,

    topScorers

  });

}