import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {

  const { authUserId } =
    await request.json();

  const user =
    await prisma.user.findFirst({
      where: {
        authUserId
      }
    });

  if (!user?.organizationId) {

    return NextResponse.json(
      {
        error:
          "Sin organización"
      },
      {
        status: 404
      }
    );

  }

  const organization =
    await prisma.organization.findUnique({
      where: {
        id:
          user.organizationId
      }
    });

  const participants =
    await prisma.user.findMany({
      where: {
        organizationId:
          user.organizationId,
        isActive: true
      },
      include: {
        scores: true
      }
    });

  const ranking =
    participants
      .map(
        (participant) => ({

          id:
            participant.id,

          nickname:
            participant.nickname,

          avatarUrl:
            participant.avatarUrl,

          role:
            participant.role,

          totalPoints:
            participant.scores.reduce(
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
          participant,
          index
        ) => ({

          ...participant,

          position:
            index + 1

        })
      );

    const invitations =
      await prisma.invitation.findMany({
        where: {
          organizationId:
            user.organizationId,
          revokedAt: null
        },
        orderBy: {
          createdAt: "desc"
        },
        select: {
          id: true,
          type: true,
          email: true,
          usedCount: true,
          maxUses: true,
          tokenHash: true,
          inviteUrl: true,
          revokedAt: true,
        }
      });

      const groupInvitation =
        invitations.find(
          invitation =>
            invitation.type === "group" &&
            !invitation.revokedAt
        ) ?? null;

        console.log(
          JSON.stringify(
            invitations,
            null,
            2
          )
        );
  return NextResponse.json({

    organization,

    participants:
      ranking,

    invitations,

    groupInvitation

  });

}