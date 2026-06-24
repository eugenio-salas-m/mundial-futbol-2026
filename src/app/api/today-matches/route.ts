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

  const chileToday =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "America/Santiago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ).format(
      new Date()
    );

  const matches =
    await prisma.match.findMany({

      where: { },

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

    const todayMatches =
    matches.filter(
      match => {
  
        const matchTime =
          new Date(
            match.startsAtChile
          );
  
        const matchDate =
          new Intl.DateTimeFormat(
            "en-CA",
            {
              timeZone:
                "America/Santiago",
              year: "numeric",
              month: "2-digit",
              day: "2-digit"
            }
          ).format(
            matchTime
          );
  
        if (
          matchDate ===
          chileToday
        ) {
  
          return true;
  
        }
  
        const hourChile =
          Number(
            new Intl.DateTimeFormat(
              "en-US",
              {
                timeZone:
                  "America/Santiago",
                hour: "2-digit",
                hour12: false
              }
            ).format(
              matchTime
            )
          );
  
        const tomorrow =
          new Date();
  
        tomorrow.setDate(
          tomorrow.getDate() + 1
        );
  
        const chileTomorrow =
          new Intl.DateTimeFormat(
            "en-CA",
            {
              timeZone:
                "America/Santiago",
              year: "numeric",
              month: "2-digit",
              day: "2-digit"
            }
          ).format(
            tomorrow
          );
  
        return (
          matchDate ===
            chileTomorrow &&
          hourChile < 24
        );
  
      }
    );

  return NextResponse.json(
    todayMatches
  );

}