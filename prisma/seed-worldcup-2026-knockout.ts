import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const matches = [
  ["2026-07-04T13:00:00-04:00", "CAN", "MAR"],
  ["2026-07-04T17:00:00-04:00", "PAR", "FRA"],

  ["2026-07-05T16:00:00-04:00", "BRA", "NOR"],
  ["2026-07-05T20:00:00-04:00", "MEX", "ENG"],

  ["2026-07-06T15:00:00-04:00", "POR", "ESP"],
  ["2026-07-06T20:00:00-04:00", "USA", "BEL"],

  ["2026-07-07T12:00:00-04:00", "ARG", "EGY"],
  ["2026-07-07T16:00:00-04:00", "SUI", "COL"],
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
            stage: "round_of_16",
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
        stage: "round_of_16",
        groupCode: "8Avos",
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
    console.log("World Cup 2026 Round of 16 seed completed.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
  //npx tsx prisma/seed-worldcup-2026-knockout.ts