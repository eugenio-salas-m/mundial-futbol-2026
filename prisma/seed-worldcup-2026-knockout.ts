import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const matches = [
  ["2026-07-19T15:00:00-04:00", "ESP", "ARG"]
];

async function main() {

  const teamMap = await prisma.team.findMany();
  const teamByCode = new Map(
    teamMap.map((team) => [team.fifaCode, team.id])
  );

  for (const [
    startsAtChile,
    homeCode,
    awayCode,
  ] of matches) {
    const homeTeamId = teamByCode.get(homeCode);
    const awayTeamId = teamByCode.get(awayCode);

    if (!homeTeamId || !awayTeamId) {
      throw new Error(
        `Equipo no encontrado: ${homeCode} vs ${awayCode}`
      );
    }

    const exists = await prisma.match.findFirst({
        where: {
            stage: "final",
            homeTeamId,
            awayTeamId,
        },
    });
    
    if (exists) {
        console.log(`${homeCode} vs ${awayCode} already exists.`);
        continue;
    }

    const startDate = new Date(startsAtChile);
    const closesAt = new Date(startDate);

    await prisma.match.create({
      data: {
        homeTeamId,
        awayTeamId,
        stage: "final",
        groupCode: "F",
        homeQualifier: null,
        awayQualifier: null,
        startsAtChile: startDate,
        predictionClosesAt: closesAt,
        status: "scheduled",
      },
    });
    console.log(`${homeCode} vs ${awayCode} created.`);
  }
}

main()
  .then(async () => {
    console.log("World Cup 2026 Final seed completed.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
  //npx tsx prisma/seed-worldcup-2026-knockout.ts