import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const teams = [
  ["Mexico", "MEX"],
  ["South Africa", "RSA"],
  ["Korea Republic", "KOR"],
  ["Czechia", "CZE"],
  ["Canada", "CAN"],
  ["Switzerland", "SUI"],
  ["Qatar", "QAT"],
  ["Bosnia and Herzegovina", "BIH"],
  ["Brazil", "BRA"],
  ["Morocco", "MAR"],
  ["Haiti", "HAI"],
  ["Scotland", "SCO"],
  ["United States", "USA"],
  ["Paraguay", "PAR"],
  ["Australia", "AUS"],
  ["Türkiye", "TUR"],
  ["Germany", "GER"],
  ["Curaçao", "CUW"],
  ["Côte d’Ivoire", "CIV"],
  ["Ecuador", "ECU"],
  ["Netherlands", "NED"],
  ["Japan", "JPN"],
  ["Tunisia", "TUN"],
  ["Sweden", "SWE"],
  ["Belgium", "BEL"],
  ["Egypt", "EGY"],
  ["Iran", "IRN"],
  ["New Zealand", "NZL"],
  ["Spain", "ESP"],
  ["Cabo Verde", "CPV"],
  ["Saudi Arabia", "KSA"],
  ["Uruguay", "URU"],
  ["France", "FRA"],
  ["Senegal", "SEN"],
  ["Norway", "NOR"],
  ["Iraq", "IRQ"],
  ["Argentina", "ARG"],
  ["Algeria", "ALG"],
  ["Austria", "AUT"],
  ["Jordan", "JOR"],
  ["Portugal", "POR"],
  ["Uzbekistan", "UZB"],
  ["Colombia", "COL"],
  ["Congo DR", "COD"],
  ["England", "ENG"],
  ["Croatia", "CRO"],
  ["Ghana", "GHA"],
  ["Panama", "PAN"],
];

const matches = [
  ["2026-06-11T15:00:00-04:00", "MEX", "RSA", "A"],
  ["2026-06-11T22:00:00-04:00", "KOR", "CZE", "A"],
  ["2026-06-12T15:00:00-04:00", "CAN", "BIH", "B"],
  ["2026-06-12T21:00:00-04:00", "USA", "PAR", "D"],
  ["2026-06-13T21:00:00-04:00", "HAI", "SCO", "C"],
  ["2026-06-14T00:00:00-04:00", "AUS", "TUR", "D"],
  ["2026-06-13T18:00:00-04:00", "BRA", "MAR", "C"],
  ["2026-06-13T15:00:00-04:00", "QAT", "SUI", "B"],
  ["2026-06-14T19:00:00-04:00", "CIV", "ECU", "E"],
  ["2026-06-14T13:00:00-04:00", "GER", "CUW", "E"],
  ["2026-06-14T16:00:00-04:00", "NED", "JPN", "F"],
  ["2026-06-14T22:00:00-04:00", "SWE", "TUN", "F"],
  ["2026-06-15T18:00:00-04:00", "KSA", "URU", "H"],
  ["2026-06-15T12:00:00-04:00", "ESP", "CPV", "H"],
  ["2026-06-15T21:00:00-04:00", "IRN", "NZL", "G"],
  ["2026-06-15T15:00:00-04:00", "BEL", "EGY", "G"],
  ["2026-06-16T15:00:00-04:00", "FRA", "SEN", "I"],
  ["2026-06-16T18:00:00-04:00", "IRQ", "NOR", "I"],
  ["2026-06-16T21:00:00-04:00", "ARG", "ALG", "J"],
  ["2026-06-17T00:00:00-04:00", "AUT", "JOR", "J"],
  ["2026-06-17T19:00:00-04:00", "GHA", "PAN", "L"],
  ["2026-06-17T16:00:00-04:00", "ENG", "CRO", "L"],
  ["2026-06-17T13:00:00-04:00", "POR", "COD", "K"],
  ["2026-06-17T22:00:00-04:00", "UZB", "COL", "K"],
  ["2026-06-18T12:00:00-04:00", "CZE", "RSA", "A"],
  ["2026-06-18T15:00:00-04:00", "SUI", "BIH", "B"],
  ["2026-06-18T18:00:00-04:00", "CAN", "QAT", "B"],
  ["2026-06-18T21:00:00-04:00", "MEX", "KOR", "A"],
  ["2026-06-19T21:00:00-04:00", "BRA", "HAI", "C"],
  ["2026-06-19T18:00:00-04:00", "SCO", "MAR", "C"],
  ["2026-06-19T23:00:00-04:00", "TUR", "PAR", "D"],
  ["2026-06-19T15:00:00-04:00", "USA", "AUS", "D"],
  ["2026-06-20T16:00:00-04:00", "GER", "CIV", "E"],
  ["2026-06-20T20:00:00-04:00", "ECU", "CUW", "E"],
  ["2026-06-20T13:00:00-04:00", "NED", "SWE", "F"],
  ["2026-06-21T00:00:00-04:00", "TUN", "JPN", "F"],
  ["2026-06-21T18:00:00-04:00", "URU", "CPV", "H"],
  ["2026-06-21T12:00:00-04:00", "ESP", "KSA", "H"],
  ["2026-06-21T15:00:00-04:00", "BEL", "IRN", "G"],
  ["2026-06-21T21:00:00-04:00", "NZL", "EGY", "G"],
  ["2026-06-22T20:00:00-04:00", "NOR", "SEN", "I"],
  ["2026-06-22T17:00:00-04:00", "FRA", "IRQ", "I"],
  ["2026-06-22T13:00:00-04:00", "ARG", "AUT", "J"],
  ["2026-06-22T23:00:00-04:00", "JOR", "ALG", "J"],
  ["2026-06-23T16:00:00-04:00", "ENG", "GHA", "L"],
  ["2026-06-23T19:00:00-04:00", "PAN", "CRO", "L"],
  ["2026-06-23T13:00:00-04:00", "POR", "UZB", "K"],
  ["2026-06-23T22:00:00-04:00", "COL", "COD", "K"],
  ["2026-06-24T18:00:00-04:00", "SCO", "BRA", "C"],
  ["2026-06-24T18:00:00-04:00", "MAR", "HAI", "C"],
  ["2026-06-24T15:00:00-04:00", "SUI", "CAN", "B"],
  ["2026-06-24T15:00:00-04:00", "BIH", "QAT", "B"],
  ["2026-06-24T21:00:00-04:00", "CZE", "MEX", "A"],
  ["2026-06-24T21:00:00-04:00", "RSA", "KOR", "A"],
  ["2026-06-25T16:00:00-04:00", "CUW", "CIV", "E"],
  ["2026-06-25T16:00:00-04:00", "ECU", "GER", "E"],
  ["2026-06-25T19:00:00-04:00", "JPN", "SWE", "F"],
  ["2026-06-25T19:00:00-04:00", "TUN", "NED", "F"],
  ["2026-06-25T22:00:00-04:00", "TUR", "USA", "D"],
  ["2026-06-25T22:00:00-04:00", "PAR", "AUS", "D"],
  ["2026-06-26T15:00:00-04:00", "NOR", "FRA", "I"],
  ["2026-06-26T15:00:00-04:00", "SEN", "IRQ", "I"],
  ["2026-06-26T23:00:00-04:00", "EGY", "IRN", "G"],
  ["2026-06-26T23:00:00-04:00", "NZL", "BEL", "G"],
  ["2026-06-26T20:00:00-04:00", "CPV", "KSA", "H"],
  ["2026-06-26T20:00:00-04:00", "URU", "ESP", "H"],
  ["2026-06-27T17:00:00-04:00", "PAN", "ENG", "L"],
  ["2026-06-27T17:00:00-04:00", "CRO", "GHA", "L"],
  ["2026-06-27T22:00:00-04:00", "ALG", "AUT", "J"],
  ["2026-06-27T22:00:00-04:00", "JOR", "ARG", "J"],
  ["2026-06-27T19:30:00-04:00", "COL", "POR", "K"],
  ["2026-06-27T19:30:00-04:00", "COD", "UZB", "K"],
];

async function main() {
  for (const [name, fifaCode] of teams) {
    await prisma.team.upsert({
      where: { fifaCode },
      update: { name },
      create: { name, fifaCode },
    });
  }

  const teamMap = await prisma.team.findMany();
  const teamByCode = new Map(
    teamMap.map((team) => [team.fifaCode, team.id])
  );

  for (const [
    startsAtChile,
    homeCode,
    awayCode,
    groupCode,
  ] of matches) {
    const homeTeamId = teamByCode.get(homeCode);
    const awayTeamId = teamByCode.get(awayCode);

    if (!homeTeamId || !awayTeamId) {
      throw new Error(
        `Equipo no encontrado: ${homeCode} vs ${awayCode}`
      );
    }

    const startDate = new Date(startsAtChile);
    const closesAt = new Date(startDate);

    await prisma.match.create({
      data: {
        homeTeamId,
        awayTeamId,
        stage: "group_stage",
        groupCode,
        startsAtChile: startDate,
        predictionClosesAt: closesAt,
        status: "scheduled",
      },
    });
  }
}

main()
  .then(async () => {
    console.log("World Cup 2026 group stage seed completed.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });