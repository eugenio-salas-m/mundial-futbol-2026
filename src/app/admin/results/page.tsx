"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

type MatchResultState = {
  homeGoals: number | null;
  awayGoals: number | null;
};

export default function AdminResultsPage() {

  const [matches, setMatches] =
    useState<any[]>([]);

  const [results, setResults] =
    useState<
      Record<
        string,
        MatchResultState
      >
    >({});

  const [loading, setLoading] =
    useState(true);

  const loadMatches =
    async () => {

      const response =
        await fetch(
          "/api/admin/matches"
        );

      const data =
        await response.json();

      const initialResults:
        Record<
          string,
          MatchResultState
        > = {};

      data.forEach(
        (match: any) => {

          initialResults[
            match.id
          ] = {

            homeGoals:
              match.result
                ?.homeGoals ??
              null,

            awayGoals:
              match.result
                ?.awayGoals ??
              null

          };

        }
      );

      setResults(
        initialResults
      );

      setMatches(
        data
      );

      setLoading(false);

    };

  useEffect(() => {

    loadMatches();

  }, []);

  const saveResult =
    async (
      matchId: string
    ) => {

      const current =
        results[matchId];

      if (
        current.homeGoals ===
          null ||
        current.awayGoals ===
          null
      ) {

        alert(
          "Debe ingresar ambos marcadores"
        );

        return;

      }

      const supabase =
        createClient();

      const { data } =
        await supabase.auth.getUser();

      if (!data.user) {

        alert(
          "Debe iniciar sesión"
        );

        return;

      }

      const response =
        await fetch(
          "/api/admin/results",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              authUserId:
                data.user.id,
              matchId,
              homeGoals:
                current.homeGoals,
              awayGoals:
                current.awayGoals
            })
          }
        );

      const result =
        await response.json();

      if (!response.ok) {

        alert(
          result.error ??
          "Error"
        );

        return;

      }

      alert(
        "Resultado guardado"
      );

      loadMatches();

    };

  if (loading) {

    return (
      <div className="p-6">
        Cargando...
      </div>
    );

  }

  const groupedByDate =
    matches.reduce(
      (
        acc: Record<
          string,
          any[]
        >,
        match
      ) => {

        const date =
          new Date(
            match.startsAtChile
          ).toLocaleDateString(
            "es-CL",
            {
              timeZone:
                "America/Santiago"
            }
          );

        if (!acc[date]) {

          acc[date] = [];

        }

        acc[date].push(
          match
        );

        return acc;

      },
      {}
    );

  const dates =
    Object.keys(
      groupedByDate
    );

  return (

    <div className="max-w-5xl mx-auto p-4">

      <PageHeader
        title="Resultados Oficiales"
      />

      <div className="space-y-6">

        {dates.map(
          (date) => (

            <div
              key={date}
            >

              <h2
                className="
                  text-xl
                  font-bold
                  mb-3
                "
              >
                {date}
              </h2>

              <div
                className="
                  space-y-3
                "
              >

                {groupedByDate[
                  date
                ].map(
                  (
                    match: any
                  ) => {

                    const hasResult =
                      !!match.result;

                    return (

                      <div
                        key={
                          match.id
                        }
                        className="
                          border
                          rounded-lg
                          shadow-sm
                          bg-white
                          p-4
                        "
                      >

                        <div
                          className="
                            text-xs
                            text-gray-500
                            mb-3
                          "
                        >

                          {
                            new Date(
                              match.startsAtChile
                            ).toLocaleString(
                              "es-CL",
                              {
                                timeZone:
                                  "America/Santiago"
                              }
                            )
                          }

                        </div>

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-2
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-1
                              w-28
                              justify-end
                            "
                          >

                            <span
                              className="
                                font-bold
                              "
                            >
                              {
                                match
                                  .homeTeam
                                  .fifaCode
                              }
                            </span>

                            <Image
                              src={
                                match
                                  .homeTeam
                                  .flagUrl
                              }
                              alt=""
                              width={
                                28
                              }
                              height={
                                20
                              }
                            />

                          </div>

                          <input
                            type="number"
                            min="0"
                            value={
                              results[
                                match.id
                              ]
                                ?.homeGoals ??
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              setResults(
                                {
                                  ...results,
                                  [match.id]:
                                    {
                                      ...results[
                                        match
                                          .id
                                      ],
                                      homeGoals:
                                        e
                                          .target
                                          .value ===
                                        ""
                                          ? null
                                          : parseInt(
                                              e
                                                .target
                                                .value
                                            )
                                    }
                                }
                              )
                            }
                            className={`
                              w-14
                              border
                              rounded
                              text-center
                              p-1
                              ${
                                hasResult
                                  ? "bg-green-100"
                                  : ""
                              }
                            `}
                          />

                          <span>
                            -
                          </span>

                          <input
                            type="number"
                            min="0"
                            value={
                              results[
                                match.id
                              ]
                                ?.awayGoals ??
                              ""
                            }
                            onChange={(
                              e
                            ) =>
                              setResults(
                                {
                                  ...results,
                                  [match.id]:
                                    {
                                      ...results[
                                        match
                                          .id
                                      ],
                                      awayGoals:
                                        e
                                          .target
                                          .value ===
                                        ""
                                          ? null
                                          : parseInt(
                                              e
                                                .target
                                                .value
                                            )
                                    }
                                }
                              )
                            }
                            className={`
                              w-14
                              border
                              rounded
                              text-center
                              p-1
                              ${
                                hasResult
                                  ? "bg-green-100"
                                  : ""
                              }
                            `}
                          />

                          <div
                            className="
                              flex
                              items-center
                              gap-1
                              w-28
                            "
                          >

                            <Image
                              src={
                                match
                                  .awayTeam
                                  .flagUrl
                              }
                              alt=""
                              width={
                                28
                              }
                              height={
                                20
                              }
                            />

                            <span
                              className="
                                font-bold
                              "
                            >
                              {
                                match
                                  .awayTeam
                                  .fifaCode
                              }
                            </span>

                          </div>

                        </div>

                        <div
                          className="
                            mt-4
                            flex
                            justify-end
                          "
                        >

                          <button
                            onClick={() =>
                              saveResult(
                                match.id
                              )
                            }
                            className="
                              px-4
                              py-2
                              rounded
                              bg-blue-600
                              text-white
                            "
                          >
                            Guardar
                          </button>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            </div>

          )
        )}

      </div>

    </div>

  );

}