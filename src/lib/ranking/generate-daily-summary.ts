import { prisma } from "@/lib/prisma";

export async function generateDailySummary() {

  const organizations =
    await prisma.organization.findMany({
      select: {
        id: true,
        name: true
      }
    });

  const now =
    new Date(
      new Date().toLocaleString(
        "en-US",
        {
          timeZone:
            "America/Santiago"
        }
      )
    );

  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );

    console.log({
        now,
        todayStart,
        timezone:
          Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone
      });
      
  const yesterdayEnd =
    new Date(todayStart);

  yesterdayEnd.setMilliseconds(-1);

  for (const organization of organizations) {

    console.log(
        `[DAILY SUMMARY] Processing organization ${organization.name}`
      );

    const snapshots =
      await prisma.rankingSnapshot.findMany({

        where: {
          organizationId:
            organization.id
        },

        include: {
          user: true
        },

        orderBy: {
          createdAt: "desc"
        }

      });

    if (
      snapshots.length === 0
    ) {
      continue;
    }

    const todayMap =
      new Map<string, typeof snapshots[number]>();

    const yesterdayMap =
      new Map<string, typeof snapshots[number]>();

    for (const snapshot of snapshots) {

      if (
        snapshot.createdAt >=
        todayStart
      ) {

        if (
          !todayMap.has(
            snapshot.userId
          )
        ) {

          todayMap.set(
            snapshot.userId,
            snapshot
          );

        }

      } else {

        if (
          !yesterdayMap.has(
            snapshot.userId
          )
        ) {

          yesterdayMap.set(
            snapshot.userId,
            snapshot
          );

        }

      }

    }

    const today =
      Array.from(
        todayMap.values()
      );

    if (
      today.length === 0
    ) {
      continue;
    }

    const leader =
      today.find(
        x =>
          x.organizationRank === 1
      );

    const previousLeader =
      yesterdayMap.size > 0
        ? Array.from(
            yesterdayMap.values()
          ).find(
            x =>
              x.organizationRank === 1
          )
        : null;
    
    const leaderChanged =
      previousLeader &&
      leader &&
      previousLeader.userId !==
        leader.userId;

    let topRiseUser:
      | typeof today[number]
      | null = null;

    let topRise = 0;

    let topFallUser:
      | typeof today[number]
      | null = null;

    let topFall = 0;

    for (const current of today) {

      const previous =
        yesterdayMap.get(
          current.userId
        );

      if (!previous) {
        continue;
      }

      const movement =
        previous.organizationRank -
        current.organizationRank;

      if (
        movement > topRise
      ) {

        topRise =
          movement;

        topRiseUser =
          current;

      }

      if (
        movement < topFall
      ) {

        topFall =
          movement;

        topFallUser =
          current;

      }

    }

    const top5 =
      [...today]
        .sort(
          (a, b) =>
            a.organizationRank -
            b.organizationRank
        )
        .slice(0, 5);

    const lines: string[] = [];

    if (leader) {

        if (leaderChanged) {
      
          lines.push(
            `Nuevo líder: ${leader.user.nickname} tomó el primer lugar con ${leader.totalPoints} puntos, desplazando a ${previousLeader?.user.nickname}.`
          );
      
        } else {
      
          lines.push(
            `${leader.user.nickname} lidera la organización con ${leader.totalPoints} puntos.`
          );
      
        }
      
      }

    if (
      topRiseUser &&
      topRise > 0
    ) {

      lines.push(
        `Mayor subida: ${topRiseUser.user.nickname} (+${topRise} posiciones).`
      );

    }

    if (
      topFallUser &&
      topFall < 0
    ) {

      lines.push(
        `Mayor caída: ${topFallUser.user.nickname} (${topFall} posiciones).`
      );

    }

    lines.push("");
    lines.push("Top 5:");

    top5.forEach(
      (item, index) => {

        lines.push(
          `${index + 1}. ${item.user.nickname} (${item.totalPoints} pts)`
        );

      }
    );

    const summaryText =
      lines.join("\n");

      console.log(
        `[DAILY SUMMARY] ${organization.name} -> ${summaryText}`
      );

    await prisma.rankingDailySummary.upsert({

      where: {

        organizationId_summaryDate: {

          organizationId:
            organization.id,

          summaryDate:
            todayStart

        }

      },

      update: {

        leaderUserId:
          leader?.userId,

        leaderName:
          leader?.user.nickname,

        topRiseUserId:
          topRiseUser?.userId,

        topRiseName:
          topRiseUser?.user.nickname,

        topRisePlaces:
          topRise,

        topFallUserId:
          topFallUser?.userId,

        topFallName:
          topFallUser?.user.nickname,

        topFallPlaces:
          Math.abs(topFall),

          leaderChanged:
          !!leaderChanged,
        
        previousLeaderId:
          previousLeader?.userId,
        
        previousLeaderName:
          previousLeader?.user.nickname,

        summaryText

      },

      create: {

        organizationId:
          organization.id,

        summaryDate:
          todayStart,

        leaderUserId:
          leader?.userId,

        leaderName:
          leader?.user.nickname,

        topRiseUserId:
          topRiseUser?.userId,

        topRiseName:
          topRiseUser?.user.nickname,

        topRisePlaces:
          topRise,

        topFallUserId:
          topFallUser?.userId,

        topFallName:
          topFallUser?.user.nickname,

        topFallPlaces:
          Math.abs(topFall),

        summaryText

      }

    });

  }

}