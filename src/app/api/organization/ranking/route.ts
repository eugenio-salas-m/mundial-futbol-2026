import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {

  try {

    const {
      authUserId
    } = await request.json();

    const currentUser =
      await prisma.user.findFirst({
        where: {
          authUserId
        }
      });

    if (!currentUser) {

      return NextResponse.json(
        {
          error:
            "Usuario no encontrado"
        },
        {
          status: 404
        }
      );

    }

    if (
      !currentUser.organizationId
    ) {

      return NextResponse.json(
        {
          myPosition: null,
          participantCount: 0,
          myPoints: 0,
          ranking: []
        }
      );

    }

    const users =
      await prisma.user.findMany({
        where: {
          organizationId:
            currentUser.organizationId,
          isActive: true
        },
        include: {
          scores: true
        }
      });

    const ranking =
      users
        .map(
          (user) => ({

            id: user.id,

            nickname:
              user.nickname,

            avatarUrl:
              user.avatarUrl,

            totalPoints:
              user.scores.reduce(
                (
                  total,
                  score
                ) =>
                  total +
                  score.points,
                0
              )

          })
        )
        .sort(
          (
            a,
            b
          ) =>
            b.totalPoints -
            a.totalPoints
        )
        .map(
          (
            user,
            index
          ) => ({

            ...user,

            position:
              index + 1

          })
        );

    const myRanking =
      ranking.find(
        (user) =>
          user.id ===
          currentUser.id
      );

    return NextResponse.json({

      myPosition:
        myRanking?.position ??
        null,

      participantCount:
        ranking.length,

      myPoints:
        myRanking
          ?.totalPoints ?? 0,

      ranking

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