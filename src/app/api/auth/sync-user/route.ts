import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

  const body = await request.json();

  const {
    authUserId,
    email,
    nickname,
    avatarUrl
  } = body;

  let user = await prisma.user.findFirst({
    where: {
      authUserId
    }
  });

  if (!user) {

    user = await prisma.user.create({
      data: {
        authUserId,
        email,
        nickname,
        googleAvatarUrl:
          avatarUrl,
        avatarUrl:
          avatarUrl,
        avatarMode:
          "google",
        role: "participant"
      }
    });

  } else {

    const updateData: any = {

      lastLoginAt:
        new Date(),
  
      email,
  
      googleAvatarUrl:
        avatarUrl
  
    };
  
    if (
      user.avatarMode ===
      "google"
    ) {
  
      updateData.avatarUrl =
        avatarUrl;
  
    }
  
    user = await prisma.user.update({
  
      where: {
        id: user.id
      },
  
      data:
        updateData
  
    });

  }

  return NextResponse.json(user);
}