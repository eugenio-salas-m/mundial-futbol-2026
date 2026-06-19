"use client";

import {
  useEffect,
  useState
} from "react";

import {
  createClient
} from "@/lib/supabase-client";

import PageHeader from "@/components/page-header";

export default function OrganizationPage() {

  const [data,
    setData] =
    useState<any>(null);

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

                      <img
                        src={
                          participant.avatarUrl
                        }
                        alt=""
                        className="
                          w-10
                          h-10
                          rounded-full
                        "
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
                        font-bold
                      "
                    >
                      {
                        participant.totalPoints
                      } pts
                    </div>

                  </div>

                );

              }
            )}

          </div>

        </div>

      </div>

    </div>

  );

}