"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

export default function NewInvitationPage() {

  const [email, setEmail] =
    useState("");

  const [invitationUrl,
    setInvitationUrl] =
    useState("");

  const createInvitation =
    async () => {

      const supabase =
        createClient();

      const { data } =
        await supabase.auth.getUser();

      if (!data.user) {
        return;
      }

      const response =
        await fetch(
          "/api/invitations",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              authUserId:
                data.user.id,
              email
            })
          }
        );

      const result =
        await response.json();

      if (result.invitationUrl) {

        setInvitationUrl(
          result.invitationUrl
        );

      }

    };

  return (

    <div className="max-w-xl mx-auto p-6">

      <PageHeader
        title="Invitar Participante"
      />

      <input
        type="email"
        placeholder="correo@gmail.com"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      
      <div className="mt-6" style={{ display: "inline"}}>
      <button
        onClick={createInvitation}
        className="px-4 py-2 rounded bg-green-600 text-white"
      >
        Crear Invitación
      </button>
      <button
        onClick={() => {
          window.location.href = "/organization";
        }}
        className="px-4 py-2 rounded bg-blue-600 text-white"
        style={{ marginLeft: "20px"}}
      >
        Volver
      </button>
      </div>
      {invitationUrl && (

        <div className="mt-6">

          <h2 className="font-bold mb-2">
            Link generado
          </h2>

          <textarea
            readOnly
            value={invitationUrl}
            className="border p-2 w-full h-24"
          />

        </div>

      )}

    </div>

  );

}