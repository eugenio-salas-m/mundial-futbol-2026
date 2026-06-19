import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request
) {
  const { authUserId } =
    await request.json();

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

  if (!currentUser.organizationId) {
    return NextResponse.json(
      { error: "Usuario sin organización" },
      { status: 400 }
    );
  }

  const members =
    await prisma.user.findMany({
      where: {
        organizationId:
          currentUser.organizationId
      },
      orderBy: {
        nickname: "asc"
      }
    });

    
  return NextResponse.json(members);
}