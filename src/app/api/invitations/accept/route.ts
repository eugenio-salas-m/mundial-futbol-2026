import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(
  request: Request
) {

  try {

    const {
      token,
      authUserId
    } = await request.json();

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const invitation =
      await prisma.invitation.findFirst({
        where: {
          tokenHash,
          revokedAt: null
        }
      });

    if (!invitation) {

      return NextResponse.json(
        {
          error:
            "Invitación no encontrada"
        },
        {
          status: 404
        }
      );

    }

    if (
      invitation.expiresAt &&
      invitation.expiresAt < new Date()
    ) {

      return NextResponse.json(
        {
          error:
            "Invitación expirada"
        },
        {
          status: 400
        }
      );

    }

    if (
      invitation.maxUses &&
      invitation.usedCount >=
      invitation.maxUses
    ) {

      return NextResponse.json(
        {
          error:
            "Invitación agotada"
        },
        {
          status: 400
        }
      );

    }

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

    if (user.organizationId) {

      return NextResponse.json(
        {
          error:
            "Ya pertenece a una organización"
        },
        {
          status: 400
        }
      );

    }

    await prisma.$transaction(
      async (tx) => {

        await tx.user.update({
          where: {
            id: user.id
          },
          data: {
            organizationId:
              invitation.organizationId,
            role: "participant"
          }
        });

        await tx.invitation.update({
          where: {
            id: invitation.id
          },
          data: {
            usedCount: {
              increment: 1
            }
          }
        });

      }
    );

    return NextResponse.json({
      success: true
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Error interno"
      },
      {
        status: 500
      }
    );

  }

}