"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

interface OrganizationRequest {
  id: string;
  organizationName: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  createdAt: string;
}

export default function OrganizationRequestsPage() {
  const [requests, setRequests] = useState<OrganizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const loadRequests = async () => {
    try {
      const response = await fetch("/api/organization-requests");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const validateUser = async () => {
  
      const supabase = createClient();
  
      const { data } =
        await supabase.auth.getUser();
  
      if (!data.user) {
        window.location.href = "/";
        return;
      }
  
      const response = await fetch(
        "/api/users/me",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authUserId: data.user.id,
          }),
        }
      );
  
      const currentUser =
        await response.json();
  
      if (currentUser.role !== "super_admin") {
        window.location.href = "/";
        return;
      }
  
      setAuthorized(true);
  
      await loadRequests();
    };
  
    validateUser();
  
  }, []);

  const approveRequest = async (id: string) => {
    await fetch(`/api/organization-requests/${id}/approve`, {
      method: "POST",
    });

    loadRequests();
  };

  const rejectRequest = async (id: string) => {
    await fetch(`/api/organization-requests/${id}/reject`, {
      method: "POST",
    });

    loadRequests();
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!authorized) {
    return (
      <div className="p-6">
        Verificando permisos...
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Solicitudes de Organización"
      />

      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Organización</th>
              <th className="border p-2">Solicitante</th>
              <th className="border p-2">Correo</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Fecha</th>
              <th className="border p-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="border p-2">
                  {request.organizationName}
                </td>

                <td className="border p-2">
                  {request.applicantName}
                </td>

                <td className="border p-2">
                  {request.applicantEmail}
                </td>

                <td className="border p-2">
                  {request.status}
                </td>

                <td className="border p-2">
                  {new Date(request.createdAt)
                    .toLocaleDateString()}
                </td>

                <td className="border p-2 space-x-2">
                  {request.status === "pending" && (
                    <>
                      <button
                        onClick={() => approveRequest(request.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Aprobar
                      </button>

                      <button
                        onClick={() => rejectRequest(request.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}