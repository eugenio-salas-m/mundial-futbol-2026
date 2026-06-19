import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(
  request: Request
) {

  try {

    const {
      authUserId,
      email
    } = await request.json();

    const currentUser =
      await prisma.user.findFirst({
        where: {
          authUserId
        }
      });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (
      currentUser.role !==
      "organization_admin"
    ) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const token =
      crypto
        .randomBytes(32)
        .toString("hex");

    const tokenHash =
      crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const invitationUrl =
        `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`;

    await prisma.invitation.create({
      data: {
        organizationId:
          currentUser.organizationId!,
        createdByUserId:
          currentUser.id,
        email,
        tokenHash,
        inviteUrl: invitationUrl,
        type: "individual",
        maxUses: 1,
        expiresAt: new Date(
          Date.now() +
          7 * 24 * 60 * 60 * 1000
        )
      }
    });

    return NextResponse.json({
      success: true,
      invitationUrl:
        `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );

  }

}