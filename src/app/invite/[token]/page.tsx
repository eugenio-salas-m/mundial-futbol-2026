"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

interface Props {
  params: Promise<{
    token: string;
  }>;
}

export default function InvitePage(
  { params }: Props
) {

const [message, setMessage] =
    useState("Procesando...");

const [loginRequired, setLoginRequired] =
    useState(false);

  useEffect(() => {

    const processInvite =
      async () => {

        const { token } =
          await params;

        const supabase =
          createClient();

        const { data } =
          await supabase.auth.getUser();

          if (!data.user) {

            setLoginRequired(true);
          
            setMessage(
              "Debe iniciar sesión para aceptar la invitación."
            );
          
            return;
          
          }

          await fetch(
            "/api/auth/sync-user",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                authUserId:
                  data.user.id,
          
                email:
                  data.user.email,
          
                nickname:
                  data.user.user_metadata
                    ?.full_name ??
                  data.user.user_metadata
                    ?.name ??
                  data.user.email,
          
                avatarUrl:
                  data.user.user_metadata
                    ?.avatar_url
              })
            }
          );
          
          const response =
            await fetch(
              "/api/invitations/accept",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                  token,
                  authUserId:
                    data.user.id
                })
              }
            );

        const result =
          await response.json();

        if (!response.ok) {

          setMessage(
            result.error ??
            "Error"
          );

          return;

        }

        setMessage(
          "Invitación aceptada."
        );

        setTimeout(() => {

          location.href = "/";

        }, 2000);

      };

    processInvite();

  }, [params]);

  return (

    <div className="min-h-screen flex items-center justify-center">

      <div className="text-center">
      <PageHeader
        title="Invitación"
      />

        <p>
          {message}
        </p>

        {loginRequired && (

            <button
            onClick={async () => {

            const supabase =
                createClient();

            await supabase.auth
                .signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo:
                    `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`
                }
                });

            }}
            className="px-4 py-2 rounded bg-blue-600 text-white mt-4"
            >
            Ingresar con Google
            </button>
            )}
      </div>

    </div>

  );

}