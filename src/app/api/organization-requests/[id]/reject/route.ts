import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const orgRequest =
      await prisma.organizationRequest.findUnique({
        where: { id },
      });

    if (!orgRequest) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    if (orgRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Solicitud ya procesada" },
        { status: 400 }
      );
    }

    await prisma.organizationRequest.update({
      where: { id },
      data: {
        status: "rejected",
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}