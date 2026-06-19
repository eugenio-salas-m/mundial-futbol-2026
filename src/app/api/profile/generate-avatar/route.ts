import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

const openai =
  new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY
  });

export async function POST(
  request: Request
) {

  try {

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

    if (
      !user.avatarPrompt
    ) {

      return NextResponse.json(
        {
          error:
            "Avatar prompt missing"
        },
        {
          status: 400
        }
      );

    }

    const imageResponse =
      await openai.images.generate({

        model:
          "gpt-image-1",

        prompt:
          user.avatarPrompt,

        size:
          "1024x1024"

      });

    const imageBase64 =
      imageResponse.data?.[0]
        ?.b64_json;

    if (
      !imageBase64
    ) {

      throw new Error(
        "Image generation failed"
      );

    }

    const imageBuffer =
      Buffer.from(
        imageBase64,
        "base64"
      );

    const filePath =
      `${user.id}/avatar-${Date.now()}.png`;

    const uploadResult =
      await supabaseAdmin
        .storage
        .from("avatars")
        .upload(
          filePath,
          imageBuffer,
          {
            contentType:
              "image/png",
            upsert: true
          }
        );

    if (
      uploadResult.error
    ) {

      throw uploadResult.error;

    }

    const publicUrl =
      supabaseAdmin
        .storage
        .from("avatars")
        .getPublicUrl(
          filePath
        )
        .data
        .publicUrl;

    await prisma.user.update({

      where: {
        id:
          user.id
      },

      data: {

        aiAvatarUrl:
          publicUrl,

        avatarUrl:
          publicUrl,

        avatarGeneratedAt:
          new Date()

      }

    });

    return NextResponse.json({

      ok: true,

      avatarUrl:
        publicUrl

    });

  }
  catch (error) {

    console.error(
      error
    );

    return NextResponse.json(
      {
        error:
          "Avatar generation failed"
      },
      {
        status: 500
      }
    );

  }

}