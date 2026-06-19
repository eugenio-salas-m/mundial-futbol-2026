import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(
  request: Request
) {

  const { authUserId } =
    await request.json();

  const user =
    await prisma.user.findFirst({
      where: {
        authUserId
      }
    });

  if (
    !user ||
    !user.organizationId
  ) {

    return NextResponse.json(
      {
        error: "No autorizado"
      },
      {
        status: 403
      }
    );

  }

  const currentGroup =
    await prisma.invitation.findFirst({
      where: {
        organizationId:
          user.organizationId,
        type: "group",
        revokedAt: null
      }
    });

  if (currentGroup) {

    await prisma.invitation.update({
      where: {
        id: currentGroup.id
      },
      data: {
        revokedAt: new Date()
      }
    });

  }

  const token =
    crypto.randomBytes(32)
      .toString("hex");

  const tokenHash =
    crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

  const inviteUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/invite/${token}`;

  const invitation =
    await prisma.invitation.create({
      data: {
        organizationId:
          user.organizationId,
        createdByUserId:
          user.id,
        tokenHash,
        inviteUrl,
        type: "group",
        maxUses: 999
      }
    });

  return NextResponse.json(
    invitation
  );

}