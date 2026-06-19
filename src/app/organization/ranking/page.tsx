"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

export default function OrganizationRankingPage() {

  const [ranking, setRanking] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const loadRanking =
      async () => {

        try {

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
              "/api/organization/ranking",
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

          if (!response.ok) {

            alert(
              "Error cargando ranking"
            );

            return;

          }

          const result =
            await response.json();

          setRanking(
            result
          );

        } catch (error) {

          console.error(
            error
          );

        } finally {

          setLoading(
            false
          );

        }

      };

    loadRanking();

  }, []);

  if (loading) {

    return (
      <div className="p-6">
        Cargando...
      </div>
    );

  }

  return (

    <div className="max-w-3xl mx-auto p-4">

      <PageHeader
        title="Ranking Organización"
      />

      <div
        className="
          bg-white
          rounded-lg
          shadow
          overflow-hidden
        "
      >

        {ranking?.ranking?.map(
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
                  p-4
                  border-b
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
                      w-10
                      text-center
                      text-xl
                      font-bold
                    "
                  >
                    {medal}
                  </div>

                  {participant.avatarUrl ? (

                    <Image
                      src={
                        participant.avatarUrl
                      }
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-full"
                    />

                  ) : (

                    <div
                      className="
                        w-12
                        h-12
                        rounded-full
                        bg-gray-300
                      "
                    />

                  )}

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

                  </div>

                </div>

                <div
                  className="
                    text-xl
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

  );

}