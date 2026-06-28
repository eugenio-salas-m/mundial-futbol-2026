import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const matches = [
    ["2026-06-28T15:00:00-04:00", "RSA", "CAN"],
  
    ["2026-06-29T13:00:00-04:00", "BRA", "JPN"],
    ["2026-06-29T16:30:00-04:00", "GER", "PAR"],
    ["2026-06-29T21:00:00-04:00", "NED", "MAR"],
  
    ["2026-06-30T13:00:00-04:00", "CIV", "NOR"],
    ["2026-06-30T17:00:00-04:00", "FRA", "SWE"],
    ["2026-06-30T21:00:00-04:00", "MEX", "ECU"],
  
    ["2026-07-01T12:00:00-04:00", "ENG", "COD"],
    ["2026-07-01T16:00:00-04:00", "BEL", "SEN"],
    ["2026-07-01T20:00:00-04:00", "USA", "BIH"],
  
    ["2026-07-02T15:00:00-04:00", "ESP", "AUT"],
    ["2026-07-02T19:00:00-04:00", "POR", "CRO"],
    ["2026-07-02T23:00:00-04:00", "SUI", "ALG"],
  
    ["2026-07-03T14:00:00-04:00", "AUS", "EGY"],
    ["2026-07-03T18:00:00-04:00", "ARG", "CPV"],
    ["2026-07-03T21:30:00-04:00", "COL", "GHA"],
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
            stage: "round_of_32",
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
        stage: "round_of_32",
        groupCode: null,
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
    console.log("World Cup 2026 Round of 32 seed completed.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
  //npx tsx prisma/seed-worldcup-2026-knockout.ts