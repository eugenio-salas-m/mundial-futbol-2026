import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const requests =
    await prisma.organizationRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

  return NextResponse.json(requests);
}

export async function POST(request: Request) {

  try {

    const body = await request.json();

    const organizationRequest =
      await prisma.organizationRequest.create({
        data: {
          organizationName: body.organizationName,
          applicantName: body.applicantName,
          applicantEmail: body.applicantEmail,
          comments: body.comments,
          status: "pending",
        },
      });

    return NextResponse.json(
      organizationRequest,
      { status: 201 }
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Error al crear solicitud"
      },
      {
        status: 500
      }
    );

  }
}