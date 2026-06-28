import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { normalizePhoneNumber } from "@/lib/utils/phone";

export async function POST(
  request: Request
) {

  const {
    authUserId
  } =
    await request.json();

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
          "User not found"
      },
      {
        status: 404
      }
    );

  }

  return NextResponse.json({

    nickname:
      user.nickname,

    whatsappNumber:
      user.whatsappNumber ?? "",

    whatsappOptIn:
      user.whatsappOptIn,

    avatarMode:
      user.avatarMode,

    avatarPrompt:
      user.avatarPrompt ?? "",

    avatarUrl:
      user.avatarUrl

  });

}

export async function PUT(
  request: Request
) {

  const body =
    await request.json();

  const user =
    await prisma.user.findFirst({
      where: {
        authUserId:
          body.authUserId
      }
    });

  if (!user) {

    return NextResponse.json(
      {
        error:
          "User not found"
      },
      {
        status: 404
      }
    );

  }

  const avatarChanged =
    user.avatarMode !==
    body.avatarMode;

  const promptChanged =
    user.avatarPrompt !==
    body.avatarPrompt;

    const updateData: any = {

        nickname:
            body.nickname,
        
        whatsappNumber:
          normalizePhoneNumber(body.whatsappNumber),
        
        whatsappOptIn:
            body.whatsappOptIn,
        
        avatarMode:
            body.avatarMode,
        
        avatarPrompt:
            body.avatarPrompt
        
        };
        
        if (
        body.avatarMode ===
        "google"
        ) {
        
        updateData.avatarUrl =
            user.googleAvatarUrl;
        
        }
        
        if (
        body.avatarMode ===
        "ai"
        &&
        user.aiAvatarUrl
        ) {
        
        updateData.avatarUrl =
            user.aiAvatarUrl;
        
        }
        
        await prisma.user.update({
        
        where: {
            id: user.id
        },
        
        data:
            updateData
        
        });

  return NextResponse.json({

    ok: true,

    generateAvatar:

      body.avatarMode ===
        "ai"

      &&

      (
        avatarChanged
        ||
        promptChanged
      ),

      avatarMode:
        body.avatarMode

  });

}