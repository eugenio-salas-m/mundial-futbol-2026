import { prisma } from "@/lib/prisma";
import { sendDailySummaryEmail }
from "./send-daily-summary-email";

export async function
sendDailySummaryToAll() {

const latestSummary =
    await prisma.rankingDailySummary.findFirst({
      where: {
        emailsSent: false
      },
      orderBy: {
        createdAt: "desc"
      }
    });

  if (!latestSummary) {
    console.log(
        "[DAILY SUMMARY] No pending summary found"
      );
    return;
  }

  const users =
    await prisma.user.findMany({

      where: {
        isActive: true,
        organizationId:
          latestSummary.organizationId
      },

      select: {
        email: true
      }

    });

  const recipients =
    users.map(
      x => x.email
    );
    /*const recipients = [
        "eugeniosalasm@gmail.com"
      ];*/

  await sendDailySummaryEmail(
    recipients,
    latestSummary.summaryText
  );

  await prisma.rankingDailySummary.update({
    where: {
      id: latestSummary.id
    },
    data: {
      emailsSent: true,
      emailsSentAt:
        new Date()
    }
  });

}