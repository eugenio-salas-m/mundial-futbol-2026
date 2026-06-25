import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getOrganizationRanking }
from "@/lib/ranking/get-organization-ranking";

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

    const {
      ranking,
      participantCount,
      lastPoints
    } =
    await getOrganizationRanking(
      currentUser.organizationId
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

      participantCount,

      myPoints:
        myRanking
          ?.totalPoints ?? 0,

      lastPoints,

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