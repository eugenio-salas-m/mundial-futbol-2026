"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";

type MatchScore = {
  homeGoals: number | null;
  awayGoals: number | null;
};

export default function PredictionsPage() {

  const [matches, setMatches] =
    useState<any[]>([]);

  const [scores, setScores] =
    useState<Record<string, MatchScore>>(
      {}
    );

  const [loading, setLoading] =
    useState(true);

  const [selectedMatch,
    setSelectedMatch] =
    useState<any>(null);

  const loadMatches = async () => {

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
        "/api/predictions/matches",
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

    const initialScores:
      Record<string, MatchScore> = {};

    result.forEach(
      (match: any) => {

        initialScores[
          match.id
        ] = {

          homeGoals:
            match.predictions?.[0]
              ?.homeGoals ?? null,

          awayGoals:
            match.predictions?.[0]
              ?.awayGoals ?? null

        };

      }
    );

    setScores(
      initialScores
    );

    setMatches(
      result
    );

    setLoading(false);

  };

  useEffect(() => {

    loadMatches();

  }, []);

  const savePrediction =
    async (
      matchId: string
    ) => {

      const current =
        scores[matchId];

      if (
        current.homeGoals === null ||
        current.awayGoals === null
      ) {
        return;
      }

      const supabase =
        createClient();

      const { data } =
        await supabase.auth.getUser();

      if (!data.user) {
        return;
      }

      await fetch(
        "/api/predictions",
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

    };

  const handleBlur =
    async (
      matchId: string
    ) => {

      const current =
        scores[matchId];

      if (
        current.homeGoals !== null &&
        current.awayGoals !== null
      ) {

        await savePrediction(
          matchId
        );

      }

    };

  const groupedMatches =
    matches.reduce(
      (
        acc: Record<
          string,
          any[]
        >,
        match
      ) => {

        const group =
          match.groupCode;

        if (!acc[group]) {

          acc[group] = [];

        }

        acc[group].push(
          match
        );

        return acc;

      },
      {}
    );

  const orderedGroups =
    Object.keys(
      groupedMatches
    ).sort();

  if (loading) {

    return (
      <div className="p-6">
        Cargando...
      </div>
    );

  }

  return (

    <div className="max-w-7xl mx-auto p-4">

      <PageHeader
        title="Mis Predicciones"
      />

      <div className="grid gap-6">

        {orderedGroups.map(
          (groupCode) => {

            const matches =
              groupedMatches[
                groupCode
              ]
                .sort(
                  (
                    a,
                    b
                  ) =>
                    new Date(
                      a.startsAtChile
                    ).getTime()
                    -
                    new Date(
                      b.startsAtChile
                    ).getTime()
                );

            return (

              <div
                key={groupCode}
                className="
                  border
                  rounded-lg
                  bg-white
                  shadow
                "
              >

                <div
                  className="
                    bg-blue-600
                    text-white
                    px-4
                    py-2
                    font-bold
                    text-lg
                  "
                >
                  Grupo {groupCode}
                </div>

                <div className="p-4 space-y-4">

                  {[0, 2, 4].map(
                    (
                      startIndex
                    ) => {

                      const block =
                        matches.slice(
                          startIndex,
                          startIndex + 2
                        );

                      return (

                        <div
                          key={
                            startIndex
                          }
                          className="
                            border
                            rounded
                            p-3
                            bg-gray-50
                          "
                        >

                          <div className="space-y-2">

                            {block.map(
                              (
                                match
                              ) => {

                                const editable =
                                  match.status ===
                                  "scheduled";

                                const score =
                                  match.scores?.[0];

                                const result =
                                  match.result;
                                return (

                                  <div
                                    key={
                                      match.id
                                    }
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      gap-2
                                      text-sm
                                      cursor-pointer
                                      hover:bg-blue-50
                                      rounded
                                      transition-colors
                                    "
                                    onClick={() => {

                                      if (
                                        match.status !==
                                        "scheduled"
                                      ) {
                                    
                                        setSelectedMatch(
                                          match
                                        );
                                    
                                      }
                                    
                                    }}

                                  >

                                    <div
                                      className="
                                        w-32
                                        flex
                                        items-center
                                        justify-end
                                        gap-1
                                      "
                                    >

                                      <span className="font-bold">
                                        {
                                          match.homeTeam.fifaCode
                                        }
                                      </span>

                                      <Image
                                        src={
                                          match.homeTeam.flagUrl
                                        }
                                        alt=""
                                        width={
                                          24
                                        }
                                        height={
                                          18
                                        }
                                      />

                                    </div>

                                    <input
                                      type="number"
                                      min="0"
                                      disabled={
                                        !editable
                                      }
                                      value={
                                        scores[
                                          match.id
                                        ]
                                          ?.homeGoals ??
                                        ""
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        setScores({
                                          ...scores,
                                          [match.id]:
                                            {
                                              ...scores[
                                                match.id
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
                                        })
                                      }
                                      onBlur={() =>
                                        handleBlur(
                                          match.id
                                        )
                                      }
                                      className={`
                                        w-14
                                        text-center
                                        border
                                        rounded
                                        p-1
                                      
                                        ${
                                          !editable &&
                                          score?.exactScorePoints > 0
                                            ? "bg-green-200"
                                            : !editable &&
                                              score?.points > 0
                                            ? "bg-yellow-200"
                                            : !editable
                                            ? "bg-gray-300 text-gray-500"
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
                                      disabled={
                                        !editable
                                      }
                                      value={
                                        scores[
                                          match.id
                                        ]
                                          ?.awayGoals ??
                                        ""
                                      }
                                      onChange={(
                                        e
                                      ) =>
                                        setScores({
                                          ...scores,
                                          [match.id]:
                                            {
                                              ...scores[
                                                match.id
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
                                        })
                                      }
                                      onBlur={() =>
                                        handleBlur(
                                          match.id
                                        )
                                      }
                                      className={`
                                        w-14
                                        text-center
                                        border
                                        rounded
                                        p-1
                                      
                                        ${
                                          !editable &&
                                          score?.exactScorePoints > 0
                                            ? "bg-green-200"
                                            : !editable &&
                                              score?.points > 0
                                            ? "bg-yellow-200"
                                            : !editable
                                            ? "bg-gray-300 text-gray-500"
                                            : ""
                                        }
                                      `}
                                    />

                                    <div
                                      className="
                                        w-32
                                        flex
                                        items-center
                                        gap-1
                                      "
                                    >

                                      <Image
                                        src={
                                          match.awayTeam.flagUrl
                                        }
                                        alt=""
                                        width={
                                          24
                                        }
                                        height={
                                          18
                                        }
                                      />

                                      <span className="font-bold">
                                        {
                                          match.awayTeam.fifaCode
                                        }
                                      </span>

                                    </div>

                                  </div>

                                );

                              }
                            )}

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              </div>

            );

          }
        )}

      </div>

      {
        selectedMatch && (

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
              setSelectedMatch(
                null
              )
            }
          >

            <div
              className="
                bg-white
                rounded-lg
                p-6
                max-w-sm
                w-full
              "
              onClick={(e) =>
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
                Resultado
              </h2>

              <div className="space-y-2">

                <div>

                  Resultado oficial:

                  <strong>

                    {" "}
                    {
                      selectedMatch
                        .result
                        ?.homeGoals
                    }
                    {" - "}
                    {
                      selectedMatch
                        .result
                        ?.awayGoals
                    }

                  </strong>

                </div>

                <div>

                  Tu pronóstico:

                  <strong>

                    {" "}
                    {
                      selectedMatch
                        .predictions?.[0]
                        ?.homeGoals
                    }
                    {" - "}
                    {
                      selectedMatch
                        .predictions?.[0]
                        ?.awayGoals
                    }

                  </strong>

                </div>

                <div>

                  Puntaje obtenido:

                  <strong>

                    {" "}
                    {
                      selectedMatch
                        .scores?.[0]
                        ?.points ?? 0
                    }

                  </strong>

                </div>

                <div>

                  Puntaje máximo:

                  <strong>

                    {" "}
                    {
                      selectedMatch
                        .stage ===
                      "group_stage"
                        ? 4
                        : selectedMatch
                            .stage ===
                          "round_of_32"
                        ? 6
                        : selectedMatch
                            .stage ===
                          "round_of_16"
                        ? 6
                        : selectedMatch
                            .stage ===
                          "quarter_final"
                        ? 9
                        : selectedMatch
                            .stage ===
                          "semi_final"
                        ? 12
                        : 18
                    }

                  </strong>

                </div>

              </div>

            </div>

          </div>

        )
      }
    </div>

  );

}