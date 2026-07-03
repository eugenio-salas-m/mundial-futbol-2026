"use client";

import {
  useEffect,
  useState
} from "react";

import {
  createClient
} from "@/lib/supabase-client";

import PageHeader from "@/components/page-header";
import AvatarZoom from "@/components/avatar-zoom";

export default function OrganizationPage() {

  const [data,
    setData] =
    useState<any>(null);

    const [selectedParticipant,
      setSelectedParticipant] =
      useState<any>(null);
    
    const [selectedTemplate,
      setSelectedTemplate] =
      useState(
        "reminder_prediction"
      );
    
    const [sending,
      setSending] =
      useState(false);

  useEffect(() => {

    const loadData =
      async () => {

        const supabase =
          createClient();

        const { data } =
          await supabase.auth.getUser();

        if (!data.user) {

          location.href = "/";
          return;

        }

        const response =
          await fetch(
            "/api/organization",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                authUserId:
                  data.user.id
              })
            }
          );

        const result =
          await response.json();

        setData(
          result
        );

      };

    loadData();

  }, []);

  const generateOrCopyGroupLink =
  async () => {

    if (!data) {
      return;
    }

    if (
      data.groupInvitation
    ) {

      const url = data.groupInvitation.inviteUrl;

      await navigator.clipboard.writeText(
        url
      );

      alert(
        "Link copiado"
      );

      return;

    }

    const supabase =
      createClient();

    const { data: authData } =
      await supabase.auth.getUser();

    if (!authData.user) {
      return;
    }

    const response =
      await fetch(
        "/api/invitations/group",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            authUserId:
              authData.user.id
          })
        }
      );

    if (!response.ok) {

      alert(
        "Error generando invitación"
      );

      return;

    }

    location.reload();

  };
  
  if (!data) {

    return (
      <div className="p-6">
        Cargando...
      </div>
    );

  }

  const organization =
    data.organization;

    console.log(data);

  return (

    <div className="max-w-5xl mx-auto p-6">

      <PageHeader
        title="Mi Organización"
      />

      <div className="space-y-6">

        <div
          className="
            border
            rounded-lg
            p-6
            bg-white
            shadow-sm
          "
        >

          <h2
            className="
              text-xl
              font-bold
              mb-4
            "
          >
            Organización
          </h2>

          <p>
            <strong>
              Nombre:
            </strong>
            {" "}
            {organization.name}
          </p>

          <p>
            <strong>
              Estado:
            </strong>
            {" "}
            {organization.status}
          </p>

          <p>
            <strong>
              WhatsApp:
            </strong>
            {" "}
            {
              organization.whatsappGroupInviteUrl ??
              "-"
            }
          </p>

        </div>

        <div
          className="
            border
            rounded-lg
            p-6
            bg-white
            shadow-sm
          "
        >

          <h2
            className="
              text-xl
              font-bold
              mb-4
            "
          >
            Invitación Grupal
          </h2>

          <button
            onClick={generateOrCopyGroupLink}
            className="
              px-4
              py-2
              rounded
              bg-green-600
              text-white
            "
          >
            {
              data.groupInvitation
                ? "Copiar Link"
                : "Generar Link"
            }
          </button>

        </div>
        <div
          className="
            border
            rounded-lg
            p-6
            bg-white
            shadow-sm
          "
        >

          <div
            className="
              flex
              justify-between
              items-center
              mb-4
            "
          >

            <h2
              className="
                text-xl
                font-bold
              "
            >
              Invitaciones
            </h2>

            <a
              href="/organization/invitations/new"
              className="
                px-4
                py-2
                rounded
                bg-green-600
                text-white
              "
            >
              Nueva Invitación
            </a>

          </div>

          <div
            className="
              overflow-x-auto
            "
          >

            <table
              className="
                w-full
                border
              "
            >

              <thead>

                <tr>

                  <th className="border p-2">
                    Tipo
                  </th>

                  <th className="border p-2">
                    Email
                  </th>

                  <th className="border p-2">
                    Usos
                  </th>

                  <th className="border p-2">
                    Link
                  </th>
                </tr>

              </thead>

              <tbody>

                {data.invitations
                  .filter(
                    (
                      invitation: any
                    ) =>
                      invitation.type ===
                      "individual"
                  )
                  .map(
                    (
                      invitation: any
                    ) => (

                    <tr
                      key={
                        invitation.id
                      }
                    >

                      <td className="border p-2">

                        {
                          invitation.type
                        }

                      </td>

                      <td className="border p-2">

                        {
                          invitation.email ??
                          "-"
                        }

                      </td>

                      <td className="border p-2">

                        {
                          invitation.usedCount
                        }
                        /
                        {
                          invitation.maxUses
                        }

                      </td>

                      <td className="border p-2">

                        <button

                          onClick={
                            async () => {

                              if (
                                invitation.type ===
                                "group"
                              ) {
                              
                                if (
                                  !data.groupInvitation
                                ) {
                              
                                  const supabase =
                                    createClient();
                              
                                  const { data: authData } =
                                    await supabase.auth.getUser();
                              
                                  if (!authData.user) {
                                    return;
                                  }
                              
                                  const response =
                                    await fetch(
                                      "/api/invitations/group",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type":
                                            "application/json"
                                        },
                                        body: JSON.stringify({
                                          authUserId:
                                            authData.user.id
                                        })
                                      }
                                    );
                              
                                  if (response.ok) {
                              
                                    location.reload();
                              
                                  }
                              
                                  return;
                              
                                }
                              
                                const url = data.groupInvitation.inviteUrl;
                              
                                await navigator.clipboard.writeText(
                                  url
                                );
                              
                                alert(
                                  "Link copiado"
                                );
                              
                                return;
                              
                              }

                              const url = invitation.inviteUrl;

                              await navigator
                                .clipboard
                                .writeText(
                                  url
                                );

                              alert(
                                "Link copiado"
                              );

                            }
                          }

                          className="
                            px-3
                            py-1
                            rounded
                            bg-blue-600
                            text-white
                          "
                        >

                          {
                            invitation.type ===
                            "group"

                              ? (
                                  data.groupInvitation
                                    ? "Copiar"
                                    : "Generar"
                                )

                              : "Copiar"
                          }

                        </button>

                      </td>
                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        <div
          className="
            border
            rounded-lg
            p-6
            bg-white
            shadow-sm
          "
        >

          <h2
            className="
              text-xl
              font-bold
              mb-4
            "
          >
            Participantes
          </h2>

          <div
            className="
              space-y-3
            "
          >

            {data.participants.map(
              (
                participant: any
              ) => {

                const medal =
                  participant.position === 1
                    ? "🥇"
                    : participant.position === 2
                    ? "🥈"
                    : participant.position === 3
                    ? "🥉"
                    : participant.position;

                return (

                  <div
                    key={
                      participant.id
                    }
                    className="
                      flex
                      items-center
                      justify-between
                      border-b
                      pb-2
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >

                      <div
                        className="
                          w-8
                          text-center
                        "
                      >
                        {medal}
                      </div>

                      <AvatarZoom
                        src={participant.avatarUrl}
                        alt={participant.nickname}
                        size={48}
                      />

                      <div>

                        <div
                          className="
                            font-semibold
                          "
                        >
                          {
                            participant.nickname
                          }
                        </div>

                        <div
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          {
                            participant.role
                          }
                        </div>

                      </div>

                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-4
                      "
                    >

                      <div
                        className="
                          font-bold
                        "
                      >
                        {
                          participant.totalPoints
                        } pts
                      </div>

                      {
                        participant.whatsappNumber &&
                        participant.whatsappOptIn && (

                          <button
                            onClick={() =>
                              setSelectedParticipant(
                                participant
                              )
                            }
                            className="
                              hover:scale-110
                              transition
                            "
                            title="Enviar WhatsApp"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 32 32"
                              className="
                                w-7
                                h-7
                              "
                            >

                              <path
                                fill="#25D366"
                                d="M16 3C8.82 3 3 8.82 3 16c0 2.56.75 5.05 2.16 7.18L3 29l5.98-2.12A12.93 12.93 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3z"
                              />

                              <path
                                fill="#FFF"
                                d="M22.46 18.84c-.35-.18-2.08-1.03-2.4-1.14-.32-.12-.55-.18-.78.18-.23.35-.9 1.14-1.1 1.37-.2.23-.41.26-.76.09-.35-.18-1.48-.54-2.82-1.71-1.04-.93-1.75-2.08-1.96-2.43-.2-.35-.02-.54.15-.71.15-.15.35-.41.52-.61.17-.2.23-.35.35-.58.12-.23.06-.44-.03-.61-.09-.18-.78-1.88-1.07-2.57-.28-.68-.57-.58-.78-.59h-.66c-.23 0-.61.09-.93.44-.32.35-1.22 1.19-1.22 2.9s1.25 3.37 1.42 3.61c.18.23 2.46 3.76 5.97 5.27.84.36 1.5.58 2.02.74.85.27 1.63.23 2.24.14.68-.1 2.08-.85 2.38-1.67.29-.82.29-1.52.2-1.67-.08-.15-.31-.23-.66-.41z"
                              />

                            </svg>

                          </button>

                        )
                      }

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </div>

      </div>

      {
        selectedParticipant && (

          <div
            className="
              fixed
              inset-0
              bg-black/50
              flex
              items-center
              justify-center
              z-50
            "
            onClick={() =>
              setSelectedParticipant(
                null
              )
            }
          >

            <div
              className="
                bg-white
                rounded-lg
                p-6
                w-full
                max-w-md
              "
              onClick={e =>
                e.stopPropagation()
              }
            >

              <h2
                className="
                  text-xl
                  font-bold
                  mb-4
                "
              >
                Enviar WhatsApp
              </h2>

              <div
                className="
                  mb-4
                  text-sm
                "
              >
                {
                  selectedParticipant.nickname
                }
              </div>

              <div
                className="
                  space-y-3
                "
              >

                <label
                  className="
                    flex
                    gap-2
                  "
                >

                  <input
                    type="radio"
                    checked={
                      selectedTemplate ===
                      "reminder_prediction"
                    }
                    onChange={() =>
                      setSelectedTemplate(
                        "reminder_prediction"
                      )
                    }
                  />

                  Recordatorio de pronósticos

                </label>

                <label
                  className="
                    flex
                    gap-2
                  "
                >

                  <input
                    type="radio"
                    checked={
                      selectedTemplate ===
                      "ranking_update"
                    }
                    onChange={() =>
                      setSelectedTemplate(
                        "ranking_update"
                      )
                    }
                  />

                  Actualización ranking

                </label>

                <label
                  className="
                    flex
                    gap-2
                  "
                >

                  <input
                    type="radio"
                    checked={
                      selectedTemplate ===
                      "match_result"
                    }
                    onChange={() =>
                      setSelectedTemplate(
                        "match_result"
                      )
                    }
                  />

                  Resultado partido

                </label>

                <label
                  className="
                    flex
                    gap-2
                  "
                >

                  <input
                    type="radio"
                    checked={
                      selectedTemplate ===
                      "match_reminder"
                    }
                    onChange={() =>
                      setSelectedTemplate(
                        "match_reminder"
                      )
                    }
                  />

                  Recordatorio próximo partido sin pronóstico

                </label>

              </div>

              <div
                className="
                  flex
                  justify-center
                  mt-6
                "
              >

                <button
                  disabled={
                    sending
                  }
                  onClick={
                    async () => {

                      try {

                        setSending(
                          true
                        );

                        const supabase =
                          createClient();

                        const { data } =
                          await supabase.auth.getUser();

                        if (
                          !data.user
                        ) {
                          return;
                        }

                        const response =
                          await fetch(
                            "/api/organization/send-whatsapp",
                            {
                              method:
                                "POST",

                              headers: {
                                "Content-Type":
                                  "application/json"
                              },

                              body:
                                JSON.stringify({

                                  authUserId:
                                    data.user.id,

                                  userId:
                                    selectedParticipant.id,

                                  templateCode:
                                    selectedTemplate

                                })
                            }
                          );

                        if (
                          !response.ok
                        ) {

                          const error =
                            await response.json();

                          alert(
                            error.error
                          );

                          return;

                        }

                        alert(
                          "WhatsApp enviado"
                        );

                        setSelectedParticipant(
                          null
                        );

                      } finally {

                        setSending(
                          false
                        );

                      }

                    }
                  }
                  className="
                    px-4
                    py-2
                    rounded
                    bg-green-600
                    text-white
                  "
                >

                  {
                    sending
                      ? "Enviando..."
                      : "Enviar"
                  }

                </button>

              </div>

            </div>

          </div>

        )
      }
    </div>

  );

}