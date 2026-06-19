"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

export default function CreateOrganizationPage() {

  const [organizationName, setOrganizationName] = useState("");
  const [comments, setComments] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {

    const loadUser = async () => {
  
      const supabase = createClient();
  
      const { data } = await supabase.auth.getUser();
  
      setCurrentUser(data.user);
  
    };
  
    loadUser();
  
  }, []);

  async function submit() {

    const response = await fetch(
      "/api/organization-requests",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            organizationName,
            applicantName:
              currentUser?.user_metadata?.full_name ??
              currentUser?.user_metadata?.name,
          
            applicantEmail:
              currentUser?.email,
          
            comments
        })
      }
    );

    if (response.ok) {

      setMessage(
        "Solicitud enviada correctamente."
      );

      setOrganizationName("");
      setComments("");

    } else {

      setMessage(
        "Error al enviar solicitud."
      );

    }

  }

  if (!currentUser) {
    return (
      <main className="p-6">
        Cargando...
      </main>
    );
  }
  
  return (

    <main className="max-w-xl mx-auto p-6">
      <PageHeader
        title="Crear Organización"
      />
      <div className="flex flex-col gap-4">

        <input
          className="border p-2"
          placeholder="Nombre Organización"
          value={organizationName}
          onChange={(e) =>
            setOrganizationName(e.target.value)
          }
        />

        <input
        className="border p-2 bg-gray-100"
        value={
            currentUser?.user_metadata?.full_name ??
            ""
        }
        readOnly
        />

    <input
    className="border p-2 bg-gray-100"
    value={
        currentUser?.email ??
        ""
    }
    readOnly
    />

        <textarea
          className="border p-2"
          placeholder="Comentarios"
          value={comments}
          onChange={(e) =>
            setComments(e.target.value)
          }
        />

        <button
          className="bg-blue-600 text-white p-2 rounded"
          onClick={submit}
        >
          Enviar Solicitud
        </button>

        {message && (
          <div>
            {message}
          </div>
        )}

      </div>

    </main>

  );

}