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
        avatarUrl,
        role: "participant"
      }
    });

  } else {

    user = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        lastLoginAt: new Date()
      }
    });

  }

  return NextResponse.json(user);
}