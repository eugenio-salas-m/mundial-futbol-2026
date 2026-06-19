import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  sendWhatsAppTemplate
} from "@/lib/whatsapp";
import {
  whatsappTemplates,
  type WhatsAppTemplateCode
} from "@/lib/whatsapp-templates";

export async function POST(
  request: Request
) {

  const {
    authUserId,
    userId,
    templateCode
  } =
    await request.json();

  const sender =
    await prisma.user.findFirst({
      where: {
        authUserId
      }
    });

  if (
    !sender ||
    sender.role !==
      "organization_admin" ||
    !sender.organizationId
  ) {

    return NextResponse.json(
      {
        error:
          "No autorizado"
      },
      {
        status: 403
      }
    );

  }

  const target =
    await prisma.user.findFirst({
      where: {
        id:
          userId
      }
    });

  if (!target) {

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

  if (
    target.organizationId !==
    sender.organizationId
  ) {

    return NextResponse.json(
      {
        error:
          "El usuario no pertenece a tu organización"
      },
      {
        status: 403
      }
    );

  }

  if (
    !target.whatsappNumber ||
    !target.whatsappOptIn
  ) {

    return NextResponse.json(
      {
        error:
          "El usuario no tiene WhatsApp habilitado"
      },
      {
        status: 400
      }
    );

  }

  const template =
    whatsappTemplates[
      templateCode as WhatsAppTemplateCode
    ];

  if (!template) {

    return NextResponse.json(
      {
        error:
          "Template inválido"
      },
      {
        status: 400
      }
    );

  }

  let parameters: string[] = [];

  if (
    templateCode ===
    "reminder_prediction"
  ) {

    parameters = [
      target.nickname
    ];

  }

  if (
    templateCode ===
    "ranking_update"
  ) {

    const standing =
      await prisma.userStanding.findFirst({
        where: {
          userId:
            target.id
        }
      });

      parameters = [
        target.nickname,
        standing?.organizationRank
          ?.toString() ?? "-",
        standing?.totalPoints
          ?.toString() ?? "0"
      ];

  }

  if (
    templateCode ===
    "match_result"
  ) {

    parameters = [
      "Último partido",
      "-",
      "Resultado",
      "-",
      "0"
    ];

  }

  let log =
    await prisma.notificationLog.create({
      data: {
        userId:
          target.id,
        organizationId:
          sender.organizationId,
        targetType:
          "user",
        channel:
          "whatsapp",
        templateCode,
        status:
          "pending"
      }
    });

  try {

    await sendWhatsAppTemplate(
      target.whatsappNumber,
      templateCode,
      template.languageCode,
      parameters
    );

    log =
      await prisma.notificationLog.update({
        where: {
          id:
            log.id
        },
        data: {
          status:
            "sent",
          sentAt:
            new Date()
        }
      });

    return NextResponse.json({
      ok: true,
      log
    });

  } catch (error: any) {

    log =
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

    return NextResponse.json(
      {
        error:
          "Error enviando WhatsApp",
        detail:
          error.message
      },
      {
        status: 500
      }
    );

  }

}