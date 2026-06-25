import { prisma } from "@/lib/prisma";
import { sendWhatsAppTemplate } from "@/lib/whatsapp";
import { whatsappTemplates } from "@/lib/whatsapp-templates";
import { getOrganizationRanking } from "@/lib/ranking/get-organization-ranking";

export async function sendDailySummaryWhatsAppToAll() {

  const template =
    whatsappTemplates.ranking_update;

  type WhatsAppParameter =
    | string
    | {
        name: string;
        value: string;
      };

  const users =
    await prisma.user.findMany({
      where: {
        isActive: true,
        whatsappOptIn: true,
        whatsappNumber: {
          not: null
        },
        organizationId: {
          not: null
        }
      },
      include: {
        standing: true
      }
    });

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of users) {
    if (
      !user.organizationId 
    ) {
      skipped++;
      continue;
    }

    const {
        ranking
    } =
    await getOrganizationRanking(
        user.organizationId
    );
    
    const myRanking =
    ranking.find(
        p =>
        p.id ===
        user.id
    );
    
    if (!myRanking) {
        skipped++;
        continue;
    }

    const summary =
      await prisma.rankingDailySummary.findFirst({
        where: {
          organizationId:
            user.organizationId
        },
        orderBy: {
          summaryDate:
            "desc"
        }
      });

    if (!summary) {
      skipped++;
      continue;
    }

    const existingLog =
      await prisma.notificationLog.findFirst({
        where: {
          userId:
            user.id,
          organizationId:
            user.organizationId,
          channel:
            "whatsapp",
          templateCode:
            "ranking_update",
          status:
            "sent",
          createdAt: {
            gte:
              summary.summaryDate
          }
        }
      });

    if (existingLog) {
      skipped++;
      continue;
    }

    let log =
      await prisma.notificationLog.create({
        data: {
          userId:
            user.id,
          organizationId:
            user.organizationId,
          targetType:
            "user",
          channel:
            "whatsapp",
          templateCode:
            "ranking_update",
          status:
            "pending"
        }
      });

    try {

      let parameters: WhatsAppParameter[] = [
        {
          name: "nombre",
          value: user.nickname
        },
        {
          name: "posicion",
          value: myRanking.position.toString()
        },
        {
          name: "puntaje",
          value: myRanking.totalPoints.toString()
        }
      ];

      const result =
        await sendWhatsAppTemplate({
          phoneNumber:
            user.whatsappNumber!,
          templateName:
            "ranking_update",
          languageCode:
            template.languageCode,
          parameters
        });




      await prisma.notificationLog.update({
        where: {
          id:
            log.id
        },
        data: {
          status:
            "sent",
          sentAt:
            new Date(),
          providerMessageId:
            result.providerMessageId,
          requestPayload:
            result.requestPayload,
          providerResponse:
            result.providerResponse
        }
      });

      sent++;

    } catch (error: any) {

      await prisma.notificationLog.update({
        where: {
          id:
            log.id
        },
        data: {
          status:
            "failed",
          errorMessage:
            error.message
        }

      });

      failed++;

      console.error(
        `[WHATSAPP DAILY SUMMARY] Error user ${user.id}`,
        error.message
      );

    }

  }

  console.log(
    `[WHATSAPP DAILY SUMMARY] sent=${sent}, skipped=${skipped}, failed=${failed}`
  );

}