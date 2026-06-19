"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

export default function OrganizationMembersPage() {

  const [loading, setLoading] = useState(true);

  const [members, setMembers] =
    useState<any[]>([]);

  const [invitations, setInvitations] =
    useState<any[]>([]);

  const [groupInvitation,
    setGroupInvitation] =
    useState<any>(null);

  const [message, setMessage] =
    useState("");
    
  useEffect(() => {

    const loadData = async () => {

      try {

        const supabase =
          createClient();

        const { data } =
          await supabase.auth.getUser();

        if (!data.user) {

          location.href = "/";
          return;

        }

        const authUserId =
          data.user.id;

        const membersResponse =
          await fetch(
            "/api/organization/members",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                authUserId
              })
            }
          );

        if (membersResponse.ok) {

          const membersData =
            await membersResponse.json();

          setMembers(membersData);

        }

        const invitationsResponse =
          await fetch(
            "/api/organization/invitations",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                authUserId
              })
            }
          );

        if (invitationsResponse.ok) {

          const invitationsData =
            await invitationsResponse.json();

            setInvitations(
              invitationsData.invitations
            );
            
            setGroupInvitation(
              invitationsData.groupInvitation
            );

        }

      } catch (error) {

        console.error(
          "Error cargando miembros",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    loadData();

  }, []);

  const createGroupLink =
    async () => {

      const supabase =
        createClient();

      const { data } =
        await supabase.auth.getUser();

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
                data.user?.id
            })
          }
        );

      const result =
        await response.json();

      setGroupInvitation(
        result
      );

    };

  const regenerateGroupLink =
    createGroupLink;

  if (loading) {

    return (
      <div className="p-6">
        Cargando...
      </div>
    );

  }

  return (

    <div className="max-w-5xl mx-auto p-6">

      <PageHeader
        title="Miembros de la Organización"
      />

      <div className="mb-4">
                <a
            href="/organization/invitations/new"
            className="px-4 py-2 rounded bg-green-600 text-white"
            >
            Invitar Participante
            </a>
        </div>

        
      {/* PARTICIPANTES */}

      <div className="mb-10">

        <h2 className="text-xl font-semibold mb-4">
          Participantes Activos
        </h2>

        <div className="overflow-x-auto">

          <table className="table-auto border-collapse border border-gray-300 w-full">

            <thead>

              <tr className="bg-gray-100">

                <th className="border p-2 text-left">
                  Nombre
                </th>

                <th className="border p-2 text-left">
                  Correo
                </th>

                <th className="border p-2 text-left">
                  Rol
                </th>

              </tr>

            </thead>

            <tbody>

              {members.length === 0 && (

                <tr>

                  <td
                    colSpan={3}
                    className="border p-4 text-center"
                  >
                    No hay participantes.
                  </td>

                </tr>

              )}

              {members.map(member => (

                <tr key={member.id}>

                  <td className="border p-2">
                    {member.nickname}
                  </td>

                  <td className="border p-2">
                    {member.email}
                  </td>

                  <td className="border p-2">
                    {member.role}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* INVITACIONES */}
     
      <div>

        <h2 className="text-xl font-semibold mb-4">
          Invitaciones Pendientes
        </h2>

        <div className="overflow-x-auto">
        {message && (

          <div className="mb-4 p-2 rounded bg-green-100 text-green-700">
            {message}
          </div>

          )}

          <table className="table-auto border-collapse border border-gray-300 w-full">

            <thead>

              <tr className="bg-gray-100">

                <th className="border p-2 text-left">
                  Correo
                </th>

                <th className="border p-2 text-left">
                  Fecha Creación
                </th>

                <th className="border p-2 text-left">
                  Link
                </th>

                <th className="border p-2 text-left">
                  Expira
                </th>

                <th className="border p-2 text-left">
                  Usos
                </th>

              </tr>

            </thead>

            <tbody>

              {invitations.length === 0 && (

                <tr>

                  <td
                    colSpan={4}
                    className="border p-4 text-center"
                  >
                    No existen invitaciones pendientes.
                  </td>

                </tr>

              )}

              {invitations.map(invitation => (

                <tr key={invitation.id}>

                  <td className="border p-2">
                    {invitation.email ?? "(grupo)"}
                  </td>

                  <td className="border p-2">
                    {new Date(
                      invitation.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="border p-2">
                    <button
                      onClick={() =>{
                        navigator.clipboard.writeText(
                          invitation.inviteUrl
                        );
                        setMessage(
                          "✅ Link copiado"
                        );
                        setTimeout(() => {
                          setMessage("");
                        }, 3000);
                      }}
                      className="px-2 py-1 rounded bg-gray-200"
                    >
                      Copiar
                    </button>
                  </td>

                  <td className="border p-2">
                    {invitation.expiresAt
                      ? new Date(
                          invitation.expiresAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="border p-2">
                    {invitation.usedCount}
                    {" / "}
                    {invitation.maxUses ?? "∞"}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      <div className="mt-4 border rounded p-4">

          <h2 className="font-bold mb-2">
            Invitación Grupal
          </h2>

          {groupInvitation ? (

            <div>

              <input
                readOnly
                value={
                  groupInvitation.inviteUrl
                }
                className="border p-2 w-full"
              />

              <div className="flex gap-2 mt-2">

                <button
                  onClick={() => {

                    navigator.clipboard.writeText(
                      groupInvitation.inviteUrl
                    );

                    setMessage(
                      "✅ Link grupal copiado"
                    );
                    setTimeout(() => {
                      setMessage("");
                    }, 3000);

                  }}
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Copiar
                </button>

                <button
                  onClick={
                    regenerateGroupLink
                  }
                  className="px-4 py-2 rounded bg-orange-600 text-white"
                >
                  Regenerar
                </button>

              </div>

            </div>

          ) : (

            <button
              onClick={
                createGroupLink
              }
              className="px-4 py-2 rounded bg-green-600 text-white"
            >
              Generar Link Grupal
            </button>

          )}

          </div>
    </div>

  );

}