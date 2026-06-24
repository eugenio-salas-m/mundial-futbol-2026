import { prisma } from "@/lib/prisma";

export async function rebuildRankings(
    matchId?: string
) {

  
    
    const organizations =
      await prisma.organization.findMany({
        select: {
          id: true
        }
      });

    for (
      const organization
      of organizations
    ) {

      const users =
        await prisma.user.findMany({

          where: {
            organizationId:
              organization.id,
            isActive: true
          },

          include: {
            scores: true
          }

        });

      const ranking =
        users
          .map(user => ({

            id: user.id,

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
          );

      for (
        let i = 0;
        i < ranking.length;
        i++
      ) {

        const lastSnapshot =
          await prisma.rankingSnapshot.findFirst({

            where: {
              userId:
                ranking[i].id
            },

            orderBy: {
              createdAt:
                "desc"
            }

          });

        if (
          lastSnapshot &&
          lastSnapshot.totalPoints ===
            ranking[i].totalPoints &&
          lastSnapshot.organizationRank ===
            i + 1
        ) {

          continue;

        }

        await prisma.rankingSnapshot.create({

          data: {

            userId:
              ranking[i].id,

            organizationId:
              organization.id,

            totalPoints:
              ranking[i].totalPoints,

            organizationRank:
              i + 1,

            matchId

          }

        });

      }

    }

    console.log(
        `[RANKING] rebuilding rankings`
      );
      
    console.log(
        `[RANKING] snapshots generated`
      );
}