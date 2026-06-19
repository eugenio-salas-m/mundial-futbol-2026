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

    const existingOrganization =
      await prisma.organization.findFirst({
        where: {
          name: orgRequest.organizationName
        }
      });

    if (existingOrganization) {
      return NextResponse.json(
        {
          error: "Ya existe una organización con ese nombre"
        },
        {
          status: 400
        }
      );
    }

    const applicantUser =
      await prisma.user.findFirst({
        where: {
          email: orgRequest.applicantEmail
        }
      });

    if (!applicantUser) {
      return NextResponse.json(
        { error: "Usuario solicitante no encontrado" },
        { status: 400 }
      );
    }

    

    if (applicantUser.organizationId) {
      return NextResponse.json(
        {
          error: "El usuario ya pertenece a una organización"
        },
        {
          status: 400
        }
      );
    }

    const organization = await prisma.$transaction(
      async (tx) => {
    
        const organization =
          await tx.organization.create({
            data: {
              name: orgRequest.organizationName,
              adminUserId: applicantUser.id
            },
          });
    
        await tx.organizationRequest.update({
          where: { id },
          data: {
            status: "approved",
            reviewedAt: new Date(),
          },
        });
    
        await tx.user.update({
          where: {
            id: applicantUser.id
          },
          data: {
            role: "organization_admin",
            organizationId: organization.id
          }
        });
    
        return organization;
      }
    );

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