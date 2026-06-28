import { prisma } from "@/lib/prisma";
import { sendMatchReminder } from "./send-match-reminder";

export async function sendMatchReminders(userId?: string) {

  //
  // Buscar la próxima hora de inicio
  //

  let REMINDER_WINDOW_HOURS = 6;
  if(userId)
    REMINDER_WINDOW_HOURS=12;

  const now =
    new Date();

  const windowEnd =
    new Date(
      now.getTime() +
      REMINDER_WINDOW_HOURS * 60 * 60 * 1000
    );

  const nextMatch =
    await prisma.match.findFirst({
      where: {
        result: null,
        startsAtChile: {
          gte: now,
          lte: windowEnd
        }
      },
      orderBy: {
        startsAtChile: "asc"
      },
      select: {
        startsAtChile: true
      }
    });

  if (!nextMatch) {

    console.log(
      "[MATCH REMINDER] No upcoming matches."
    );

    return {
      matches: 0,
      usersProcessed: 0,
      sent: 0,
      skipped: 0,
      failed: 0
    };

  }

  //
  // Todos los partidos de esa misma hora
  //

  const matches =
    await prisma.match.findMany({

      where: {
        startsAtChile:
          nextMatch.startsAtChile,
        result: null
      },

      include: {
        homeTeam: true,
        awayTeam: true
      }

    });

  let usersProcessed = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  //
  // Usuarios que ya recibieron un reminder
  // en esta ejecución
  //

  const notifiedUsers =
    new Set<string>();


  for (const match of matches) {

    //
    // Usuarios candidatos
    //

    const users =
      await prisma.user.findMany({
        where: {
          isActive: true,
          whatsappOptIn: true,
          whatsappNumber: {
            not: null
          },
          ...(userId && {
              id: userId
          }),
          predictions: {
            none: {
              matchId:
                match.id
            }
          }
        }
      });

    for (const user of users) {

      //
      // Ya recibió un reminder en esta ejecución
      //

      if (
        notifiedUsers.has(user.id)
      ) {

        skipped++;

        continue;

      }

      usersProcessed++;

      //
      // ¿Ya se envió reminder para este partido?
      //

      const existing =
        await prisma.notificationLog.findFirst({

          where: {

            userId:
              user.id,

            matchId:
              match.id,

            templateCode:
              "match_reminder"

          }

        });

      if (existing) {

        skipped++;

        continue;

      }

      try {

        await sendMatchReminder(
          user,
          match
        );

        sent++;

      }
      catch (error) {

        failed++;

        console.error(

          `[MATCH REMINDER] Error user=${user.id} match=${match.id}`,

          error

        );

      }

    }

  }

  console.log(

    `[MATCH REMINDER] matches=${matches.length} users=${usersProcessed} sent=${sent} skipped=${skipped} failed=${failed}`

  );

  return {

    matches:
      matches.length,

    usersProcessed,

    sent,

    skipped,

    failed

  };

}