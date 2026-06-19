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

  if (!user) {

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

  const today =
    new Date();

  const start =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0
    );

  const end =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

  const matches =
    await prisma.match.findMany({

      where: {

        startsAtChile: {

          gte: start,

          lte: end

        }

      },

      include: {

        homeTeam: true,
      
        awayTeam: true,
      
        result: true,
      
        predictions: {
          where: {
            userId: user.id
          }
        },
      
        scores: {
          where: {
            userId: user.id
          }
        }
      
      },

      orderBy: {

        startsAtChile:
          "asc"

      }

    });

  return NextResponse.json(
    matches
  );

}