import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {

  const {
    authUserId,
    matchId,
    homeGoals,
    awayGoals
  } = await request.json();

  const user =
    await prisma.user.findFirst({
      where: {
        authUserId
      }
    });

  if (
    !user ||
    user.role !== "super_admin"
  ) {

    return NextResponse.json(
      {
        error: "No autorizado"
      },
      {
        status: 403
      }
    );

  }

  if (
    homeGoals === undefined ||
    awayGoals === undefined ||
    homeGoals === null ||
    awayGoals === null
  ) {
  
    return NextResponse.json(
      {
        error:
          "Debe ingresar ambos marcadores"
      },
      {
        status: 400
      }
    );
  
  }
  
  const existing =
    await prisma.matchResult.findFirst({
      where: {
        matchId
      }
    });

  if (existing) {

    await prisma.matchResult.update({
      where: {
        id: existing.id
      },
      data: {
        homeGoals,
        awayGoals
      }
    });

  } else {

    await prisma.matchResult.create({
      data: {
        matchId,
        homeGoals,
        awayGoals,
        registeredByUserId:
          user.id
      }
    });

  }

  await prisma.match.update({
    where: {
      id: matchId
    },
    data: {
      status: "finished"
    }
  });

  return NextResponse.json({
    success: true
  });

}