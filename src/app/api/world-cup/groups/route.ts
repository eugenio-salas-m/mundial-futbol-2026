import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {

  const matches =
    await prisma.match.findMany({

      where: {
        stage:
          "group_stage"
      },

      include: {

        homeTeam: true,

        awayTeam: true,

        result: true

      }

    });

  const groups:
    Record<
      string,
      Record<
        string,
        any
      >
    > = {};

  const ensureTeam =
    (
      groupCode: string,
      team: any
    ) => {

      if (
        !groups[
          groupCode
        ]
      ) {

        groups[
          groupCode
        ] = {};

      }

      if (
        !groups[
          groupCode
        ][
          team.id
        ]
      ) {

        groups[
          groupCode
        ][
          team.id
        ] = {

          teamId:
            team.id,

          fifaCode:
            team.fifaCode,

          name:
            team.name,

          flagUrl:
            team.flagUrl,

          pj: 0,

          pg: 0,

          pe: 0,

          pp: 0,

          gf: 0,

          gc: 0,

          dg: 0,

          points: 0

        };

      }

    };

  matches.forEach(
    (
      match
    ) => {

      if (
        !match.groupCode
      ) {
        return;
      }

      const groupCode =
        match.groupCode;

      ensureTeam(
        groupCode,
        match.homeTeam
      );

      ensureTeam(
        groupCode,
        match.awayTeam
      );

      if (
        !match.result
      ) {
        return;
      }

      const home =
        groups[
          groupCode
        ][
          match.homeTeamId
        ];

      const away =
        groups[
          groupCode
        ][
          match.awayTeamId
        ];

      home.pj++;
      away.pj++;

      home.gf +=
        match.result.homeGoals;

      home.gc +=
        match.result.awayGoals;

      away.gf +=
        match.result.awayGoals;

      away.gc +=
        match.result.homeGoals;

      if (
        match.result.homeGoals >
        match.result.awayGoals
      ) {

        home.pg++;
        home.points += 3;

        away.pp++;

      }
      else if (
        match.result.homeGoals <
        match.result.awayGoals
      ) {

        away.pg++;
        away.points += 3;

        home.pp++;

      }
      else {

        home.pe++;
        away.pe++;

        home.points++;
        away.points++;

      }

    }
  );

  const result:
    Record<
      string,
      any[]
    > = {};

  Object.keys(
    groups
  ).forEach(
    (
      groupCode
    ) => {

      result[
        groupCode
      ] = Object
        .values(
          groups[
            groupCode
          ]
        )
        .map(
          (
            team: any
          ) => ({

            ...team,

            dg:
              team.gf -
              team.gc

          })
        )
        .sort(
          (
            a: any,
            b: any
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

            if (
              b.dg !==
              a.dg
            ) {

              return (
                b.dg -
                a.dg
              );

            }

            return (
              b.gf -
              a.gf
            );

          }
        );

    }
  );

  return NextResponse.json(
    result
  );

}