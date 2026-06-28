"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-client";
import PageHeader from "@/components/page-header";
import QualifiedTeamSelector from "@/components/QualifiedTeamSelector";

type MatchScore = {
  homeGoals: number | null;
  awayGoals: number | null;
  qualifiedTeamId: string | null;
};

const getStageTitle = (
  match: {
    stage: string;
    groupCode: string | null;
  }
) => {

  if (match.stage === "group_stage")
      return `Grupo ${match.groupCode}`;

  switch (match.stage) {

      case "round_of_32":
          return "16avos de Final";

      case "round_of_16":
          return "Octavos de Final";

      case "quarter_final":
          return "Cuartos de Final";

      case "semi_final":
          return "Semifinal";

      case "third_place":
          return "Tercer Lugar";

      case "final":
          return "Final";

      default:
          return "";
  }

};


export default function PredictionsPage() {

  const [matches, setMatches] =
    useState<any[]>([]);

  const [scores, setScores] =
    useState<Record<string, MatchScore>>(
      {}
    );

  const [savedPredictions, setSavedPredictions] =
    useState<Record<string, boolean>>({});

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
              ?.awayGoals ?? null,

          qualifiedTeamId:
            match.predictions?.[0]
              ?.qualifiedTeamId  ?? null,
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

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);

  };

  useEffect(() => {

    loadMatches();

  }, []);

  const savePrediction =
    async (
      matchId: string,
      current?: MatchScore
    ) => {

      const prediction =
        current ?? scores[matchId];

      if (!prediction) {
        return;
      }

      if (
        prediction.homeGoals === null ||
        prediction.awayGoals === null
      ) {
        return;
      }

      const match =
        matches.find(m => m.id === matchId);

      if (
        match &&
        match.stage !== "group_stage" &&
        prediction.homeGoals === prediction.awayGoals &&
        !prediction.qualifiedTeamId
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

      const response =
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
                prediction.homeGoals,
              awayGoals:
                prediction.awayGoals,
              qualifiedTeamId: 
                prediction.qualifiedTeamId
            })
          }
        );

      if (response.ok) {

        setSavedPredictions(
          prev => ({
            ...prev,
            [matchId]: true
          })
        );

        setTimeout(() => {

          setSavedPredictions(
            prev => ({
              ...prev,
              [matchId]: false
            })
          );

        }, 5000);

      }else{
        const error = await response.json();
        alert(error.error);
      }

    };

  const handleBlur =
    async (
      matchId: string
    ) => {

      await savePrediction(
        matchId,
        {
          ...scores[matchId]
        }
      );

    };

    const updateScore = (
      match: any,
      side: "home" | "away",
      value: string
    ) => {
    
      setScores(prev => {
    
        const field =
          side === "home"
            ? "homeGoals"
            : "awayGoals";

        const current = {
          ...prev[match.id],
          [field]:
            value === ""
              ? null
              : parseInt(value),
        };
    
        if (
          current.homeGoals !== null &&
          current.awayGoals !== null
        ) {
    
          if (current.homeGoals > current.awayGoals) {
    
            current.qualifiedTeamId =
              match.homeTeam.id;
    
          } else if (
            current.awayGoals >
            current.homeGoals
          ) {
    
            current.qualifiedTeamId =
              match.awayTeam.id;
    
          }
          // empate:
          // mantenemos la selección existente
        }
    
        return {
          ...prev,
          [match.id]: current,
        };
    
      });
    
    };


  const getSectionKey = (match: any) => {
    switch (match.stage) {
      case "group_stage":
        return `Grupo ${match.groupCode}`;
  
      case "round_of_32":
        return "16avos de Final";
  
      case "round_of_16":
        return "Octavos de Final";
  
      case "quarter_final":
        return "Cuartos de Final";
  
      case "semi_final":
        return "Semifinales";
  
      case "third_place":
        return "Tercer Lugar";
  
      case "final":
        return "Final";
  
      default:
        return "Otros";
    }
  };

  const groupedMatches = matches.reduce(
    (acc: Record<string, any[]>, match) => {
  
      const key = getSectionKey(match);
  
      if (!acc[key]) {
        acc[key] = [];
      }
  
      acc[key].push(match);
  
      return acc;
  
    },
    {}
  );

  const sectionOrder = [
    "Grupo A",
    "Grupo B",
    "Grupo C",
    "Grupo D",
    "Grupo E",
    "Grupo F",
    "Grupo G",
    "Grupo H",
    "Grupo I",
    "Grupo J",
    "Grupo K",
    "Grupo L",
    "16avos de Final",
    "Octavos de Final",
    "Cuartos de Final",
    "Semifinales",
    "Tercer Lugar",
    "Final",
  ];

  const orderedGroups = sectionOrder.filter(
    section => groupedMatches[section]
  );

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
                  {groupCode}
                </div>

                <div className="p-4 space-y-4">

                  {Array.from(
                    { length: Math.ceil(matches.length / 2) },
                    (_, i) => i * 2
                  ).map(
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

                                const isKnockout =
                                  match.stage !== "group_stage";

                                const editable =
                                  match.status ===
                                    "scheduled"
                                  &&
                                  new Date() <
                                    new Date(
                                      match.startsAtChile
                                    );

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
                                      border-b
                                      last:border-b-0
                                      pb-2
                                    "
                                  >
                                
                                    <div
                                      className="
                                        text-xs
                                        text-gray-500
                                        text-center
                                        mb-1
                                      "
                                    >
                                
                                      {
                                        new Date(
                                          match.startsAtChile
                                        ).toLocaleString(
                                          "es-CL",
                                          {
                                            weekday: "short",
                                            day: "2-digit",
                                            month: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit"
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
                                          updateScore(
                                            match,
                                            "home",
                                            e.target.value
                                          )
                                        }
                                        onBlur={() =>
                                          handleBlur(
                                            match.id
                                          )
                                        }
                                        onKeyDown={async (e) => {
                                          if (e.key === "Enter") {
                                            await savePrediction(
                                              match.id,
                                              {
                                                ...scores[match.id]
                                              }
                                            );
                                            (
                                              e.target as HTMLInputElement
                                            ).blur();
                                          }
                                        }}
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
                                          updateScore(
                                            match,
                                            "away",
                                            e.target.value
                                          )
                                        }
                                        onBlur={() =>
                                          handleBlur(
                                            match.id
                                          )
                                        }
                                        onKeyDown={async (e) => {
                                          if (e.key === "Enter") {
                                            await savePrediction(
                                              match.id,
                                              {
                                                ...scores[match.id]
                                              }
                                            );
                                            (
                                              e.target as HTMLInputElement
                                            ).blur();
                                          }
                                        }}
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
                                        
                                        <div
                                          className="
                                            w-5
                                            text-center
                                          "
                                        >
                                          {savedPredictions[
                                            match.id
                                          ] && (

                                            <span
                                              className="
                                                text-green-600
                                                font-bold
                                                text-lg
                                              "
                                            >
                                              ✓
                                            </span>

                                          )}
                                        </div>
                                      </div>
                                      
                                    </div>

                                    {isKnockout && (
                                          <QualifiedTeamSelector
                                              homeTeamId={match.homeTeam.id}
                                              awayTeamId={match.awayTeam.id}
                                              homeTeamName={match.homeTeam.name}
                                              awayTeamName={match.awayTeam.name}
                                              selectedTeamId={scores[match.id]?.qualifiedTeamId ?? null}
                                              disabled={
                                                scores[match.id]?.homeGoals !==
                                                scores[match.id]?.awayGoals
                                              }
                                              onChange={async (teamId) => {
                                                
                                                const updated = {
                                                  ...scores[match.id],
                                                  qualifiedTeamId: teamId,
                                                };
                                              
                                                setScores(prev => ({
                                                  ...prev,
                                                  [match.id]: updated,
                                                }));
                                              
                                                await savePrediction(
                                                  match.id,
                                                  updated
                                                );

                                                (document.activeElement as HTMLElement)?.blur();

                                              }}
                                          />
                                      )}
                                      
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