import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  processMatchResult
} from "@/lib/scoring/process-match-result";

export async function POST(
  request: Request
) {

  const {
    authUserId,
    matchId,
    homeGoals,
    awayGoals,
    qualifiedTeamId
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
  
  const match =
      await prisma.match.findUnique({
        where: {
          id: matchId
        }
      });

  let winnerTeamId =
    qualifiedTeamId;

  if (
    homeGoals > awayGoals
  ) {

    winnerTeamId =
      match!.homeTeamId;

  } else if (
    awayGoals > homeGoals
  ) {

    winnerTeamId =
      match!.awayTeamId;

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
        awayGoals,
        qualifiedTeamId:
          winnerTeamId
      }
    });

  } else {

    await prisma.matchResult.create({
      data: {
        matchId,
        homeGoals,
        awayGoals,
        qualifiedTeamId:
          winnerTeamId,
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

  await processMatchResult(
    matchId
  );
  
  return NextResponse.json({
    success: true
  });

}