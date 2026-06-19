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
        error: "Usuario no encontrado"
      },
      {
        status: 404
      }
    );

  }

  const matches =
    await prisma.match.findMany({
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
        startsAtChile: "asc"
      }
    });

  return NextResponse.json(
    matches
  );

}