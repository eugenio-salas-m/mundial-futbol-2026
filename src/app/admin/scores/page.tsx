"use client";

import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

export default function ScoresPage() {

  const calculate =
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
          "/api/admin/calculate-scores",
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

      if (!response.ok) {

        alert(
          result.error
        );

        return;

      }

      alert(
        `Puntajes calculados. Registros: ${result.processed}`
      );

    };

  return (

    <div className="p-6">

      <PageHeader
        title="Calcular Puntajes"
      />

      <button
        onClick={calculate}
        className="
          px-6
          py-3
          rounded
          bg-green-600
          text-white
        "
      >
        Ejecutar Cálculo
      </button>

    </div>

  );

}