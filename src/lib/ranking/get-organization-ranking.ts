import { prisma } from "@/lib/prisma";

export async function getOrganizationRanking(
  organizationId: string
) {

  const users =
    await prisma.user.findMany({

      where: {
        organizationId,
        isActive: true
      },

      include: {
        scores: true
      }

    });

  const ranking =
    users
      .map(user => ({

        id:
          user.id,

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

      }))
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

  return {

    participantCount:
      ranking.length,

    lastPoints:
      ranking.length > 0
        ? ranking[
            ranking.length - 1
          ].totalPoints
        : 0,

    ranking

  };

}