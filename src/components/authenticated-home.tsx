"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";

export default function AuthenticatedHome() {

  const [user, setUser] =
    useState<any>(null);

  const [currentUser, setCurrentUser] =
    useState<any>(null);

  const [ranking, setRanking] =
    useState<any>(null);

  const [todayMatches,
    setTodayMatches] =
    useState<any[]>([]);
    
  const [todayPredictions,
    setTodayPredictions] =
    useState<
      Record<
        string,
        {
          homeGoals: string;
          awayGoals: string;
        }
      >
    >({});

    const [selectedMatch,
      setSelectedMatch] =
      useState<any>(null);

    const [showAdvice,
      setShowAdvice] =
      useState(false);

    const [adviceLoading,
      setAdviceLoading] =
      useState(false);
    
    const [adviceText,
      setAdviceText] =
      useState("");

    const [loadingMessage,
      setLoadingMessage] =
      useState(
        ""
      );

    const [standings,
      setStandings] =
      useState<any>(null);

    const [savedPredictions,
      setSavedPredictions] =
      useState<Record<string, boolean>>({});

  useEffect(() => {

    const loadUser = async () => {

      const supabase =
        createClient();

      const { data } =
        await supabase.auth.getUser();

      const authUser =
        data.user;

      if (!authUser) {
        return;
      }

      setUser(authUser);

      await fetch(
        "/api/auth/sync-user",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            authUserId:
              authUser.id,
            email:
              authUser.email,
            nickname:
              authUser.user_metadata
                ?.full_name ??
              authUser.user_metadata
                ?.name ??
              authUser.email,
            avatarUrl:
              authUser.user_metadata
                ?.avatar_url
          })
        }
      );

      const response =
        await fetch(
          "/api/users/me",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json"
            },
            body: JSON.stringify({
              authUserId:
                authUser.id
            })
          }
        );

      if (!response.ok) {
        return;
      }

      const dbUser =
        await response.json();

      setCurrentUser(
        dbUser
      );

      if (
        dbUser.role !==
        "super_admin"
      ) {

        const rankingResponse =
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
                  authUser.id
              })
            }
          );

        if (
          rankingResponse.ok
        ) {

          const rankingData =
            await rankingResponse.json();

          setRanking(
            rankingData
          );

        }

        const todayResponse =
          await fetch(
            "/api/today-matches",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                authUserId:
                  authUser.id
              })
            }
          );

        if (
          todayResponse.ok
        ) {

          const todayData =
            await todayResponse.json();

          setTodayMatches(
            todayData
          );

          const predictionMap:
            Record<string, any> = {};

          todayData.forEach(
            (match: any) => {

              predictionMap[
                match.id
              ] = {

                homeGoals:
                  match.predictions?.[0]
                    ?.homeGoals
                    ?.toString() ?? "",

                awayGoals:
                  match.predictions?.[0]
                    ?.awayGoals
                    ?.toString() ?? ""

              };

            }
          );

          setTodayPredictions(
            predictionMap
          );

        }

        const standingsResponse =
          await fetch(
            "/api/world-cup/standings",
            {
              method: "POST"
            }
          );

        if (
          standingsResponse.ok
        ) {

          const standingsData =
            await standingsResponse.json();

          setStandings(
            standingsData
          );

        }
      }

    };

    loadUser();

  }, []);

  const logout =
    async () => {

      const supabase =
        createClient();

      await supabase.auth.signOut();

      location.reload();

    };

  if (!user) {
    return null;
  }

  const medal =
    ranking?.myPosition === 1
      ? "🥇"
      : ranking?.myPosition === 2
      ? "🥈"
      : ranking?.myPosition === 3
      ? "🥉"
      : "";

  const isLast =
    ranking &&
    ranking.participantCount > 1 &&
    ranking.myPosition ===
    ranking.participantCount;

    const savePrediction =
    async (
      matchId: string
    ) => {
  
      const current =
        todayPredictions[
          matchId
        ];
  
      if (
        current.homeGoals === "" ||
        current.awayGoals === ""
      ) {
  
        alert(
          "Ingrese ambos marcadores"
        );
  
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
                parseInt(
                  current.homeGoals
                ),
  
              awayGoals:
                parseInt(
                  current.awayGoals
                )
  
            })
          }
        );
  
      if (
        response.ok
      ) {
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
  
      }
  
    };

    const handleTodayBlur =
      async (
        matchId: string
      ) => {

        const current =
          todayPredictions[
            matchId
          ];

        if (
          !current
        ) {
          return;
        }

        if (
          current.homeGoals === "" ||
          current.awayGoals === ""
        ) {
          return;
        }

        await savePrediction(
          matchId
        );

      };
      
      const isLastOrTied =
        ranking &&
        ranking.participantCount > 1 &&
        ranking.myPoints === ranking.lastPoints;

      const sadEmoji =
        ["😭", "😡", "🤬", "💀", "😵"][
          Math.floor(
            Math.random() * 5
          )
        ];

      const rankingCardClass =
        ranking?.myPosition === 1
          ? "bg-green-600 text-white"
          : ranking?.myPosition === 2
          ? "bg-green-400 text-white"
          : ranking?.myPosition === 3
          ? "bg-green-200"
          : isLastOrTied
          ? "bg-red-100"
          : "bg-white";


        const loadAdvice =
          async (
            matchId: string
          ) => {
        
            const messages = [
              "⚽ Revisando antecedentes del partido...",
              "✍️ Redactando consejo..."
            ];

            console.log(
              "loading start"
            );

            setLoadingMessage(
              "🧠 Consultando al analista IA..."
            );

            setShowAdvice(
              true
            );


            let timer:
              ReturnType<
                typeof setInterval
              > | null = null;

            try {
        
              setAdviceLoading(
                true
              );
        
              setAdviceText(
                ""
              );
        
              const supabase =
                createClient();
        
              const { data } =
                await supabase.auth.getUser();
        
              if (!data.user) {
                return;
              }
        
              
              
              let index = 0;
              
              timer =
                setInterval(() => {
                  setLoadingMessage(
                    messages[
                      index %
                      messages.length
                    ]
                  );
                  index++;
                }, 800);


              const response =
                await fetch(
                  "/api/matches/advice",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                      matchId,
                      authUserId:
                        data.user.id
                    })
                  }
                );
        
              const result =
                await response.json();
        
              if (!response.ok) {
        
                setAdviceText(
                  result.error ??
                  "No fue posible obtener consejo."
                );
        
                return;
        
              }
        
              setAdviceText(
                result.advice
              );
        
              setShowAdvice(
                true
              );
        
            } finally {
              console.log(
                "loading end"
              );
              if (timer) {
                clearInterval(
                  timer
                );
              }
              
              setAdviceLoading(
                false
              );
        
            }
        
          };

  return (

    <div className="flex flex-col gap-4 items-center">
      
      <img
        src={
          currentUser?.avatarUrl ??
          user.user_metadata
            ?.avatar_url
        }
        alt=""
        className="
          w-24
          h-24
          rounded-full
        "
      />
      <a
        href="/profile"
        className="
          text-gray-500
          hover:text-gray-700
        "
        style={{lineHeight: 0}}
      >
        ✏️ 
      </a>
      <h2 className="text-2xl">

        Hola {
          currentUser?.nickname ??
          user.user_metadata
            ?.full_name
        }

      </h2>

      {currentUser?.role !==
        "super_admin" && currentUser?.organizationId &&
        ranking && (

        <div
          className={`
            border
            rounded-lg
            p-4
            text-center
            min-w-[280px]
            shadow-sm
            ${rankingCardClass}
          `}
        >

          <div className="text-5xl">
            {medal}
          </div>

          <div
            className="
              text-xl
              font-bold
            "
          >
            Posición #
            {ranking.myPosition}
          </div>

          <div>

            de {
              ranking.participantCount
            } participantes

          </div>

          <div
            className="
              text-3xl
              font-bold
              mt-2
            "
          >
            {
              ranking.myPoints
            } pts
          </div>

          {isLastOrTied && (

            <div
              className="
                text-5xl
                animate-bounce
                mt-2
              "
            >
              {sadEmoji}
            </div>

            )}

          <a
            href="/organization/ranking"
            className="
              mt-4
              inline-block
              text-blue-600
              hover:underline
            "
          >
            Ver Ranking
          </a>

        </div>

      )}

      {currentUser?.organizationId &&
      todayMatches.length > 0 && (

        <div
          className="
            border
            rounded-lg
            p-4
            bg-white
            w-full
            max-w-xl
          "
        >

          <h3
            className="
              text-xl
              font-bold
              mb-4
            "
          >
            Próximos Partidos
          </h3>

          <div
            className="
              space-y-2
            "
          >

{todayMatches.map(
  (
    match
  ) => {

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

    return (

      <div
        key={match.id}
        className="
          border-b
          pb-2
        "
      >

        <div
          className="
            text-xs
            text-gray-500
            mb-1
            text-center
          "
        >
          {
            new Date(
              match.startsAtChile
            ).toLocaleString(
              "es-CL",
              {
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
            border-b
            pb-2
            cursor-pointer
            hover:bg-blue-50
            rounded
            transition-colors
          "
          onClick={() => {

            setShowAdvice(
              false
            );
          
            setSelectedMatch(
              match
            );
          
          }}
        >
        
          <div
            className="
              flex
              items-center
              gap-1
              w-24
              justify-end
            "
          >

            <span
              className="
                font-bold
              "
            >
              {
                match.homeTeam
                  .fifaCode
              }
            </span>

            <img
              src={
                match.homeTeam
                  .flagUrl
              }
              alt=""
              className="
                w-6
                h-4
              "
            />

          </div>

          <input
            type="number"
            min="0"
            disabled={!editable}
            value={
              todayPredictions[
                match.id
              ]?.homeGoals ?? ""
            }
            onChange={e =>
              setTodayPredictions(
                {
                  ...todayPredictions,

                  [match.id]: {

                    ...todayPredictions[
                      match.id
                    ],

                    homeGoals:
                      e.target.value

                  }

                }
              )
            }
            onBlur={() =>
              handleTodayBlur(
                match.id
              )
            }
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleTodayBlur(
                  match.id
                );
                (
                  e.target as HTMLInputElement
                ).blur();
              }
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
            className={`
              w-12
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

          <span>-</span>

          <input
            type="number"
            min="0"
            disabled={!editable}
            value={
              todayPredictions[
                match.id
              ]?.awayGoals ?? ""
            }
            onChange={e =>
              setTodayPredictions(
                {
                  ...todayPredictions,

                  [match.id]: {

                    ...todayPredictions[
                      match.id
                    ],

                    awayGoals:
                      e.target.value

                  }

                }
              )
            }
            onBlur={() =>
              handleTodayBlur(
                match.id
              )
            }
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                await handleTodayBlur(
                  match.id
                );
                (
                  e.target as HTMLInputElement
                ).blur();
              }
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
            className={`
              w-12
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
              flex
              items-center
              gap-1
              w-24
            "
          >

            <img
              src={
                match.awayTeam
                  .flagUrl
              }
              alt=""
              className="
                w-6
                h-4
              "
            />

            <span
              className="
                font-bold
              "
            >
              {
                match.awayTeam
                  .fifaCode
              }
            </span>
            <span
              className="
                ml-1
                animate-pulse
              "
              title="Consejo IA disponible"
            >
              💡
            </span>
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
    );

  }
)}

          </div>

          <a
            href="/predictions"
            className="
              mt-4
              inline-block
              text-blue-600
              hover:underline
            "
          >
            Ver Cartilla Completa
          </a>

        </div>

      )}

      {standings && (

      <div
        className="
          border
          rounded-lg
          p-4
          bg-white
          w-full
          max-w-xl
        "
      >

        <h3
          className="
            text-xl
            font-bold
            mb-3
          "
        >
          🏆 Top Equipos
        </h3>

        <div className="space-y-2">

          {standings.topTeams.map(
            (
              team: any,
              index: number
            ) => (

              <div
                key={team.teamId}
                className="
                  flex
                  justify-between
                "
              >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <span>
                  {index + 1}.
                </span>

                <img
                  src={team.flagUrl}
                  alt=""
                  className="
                    w-6
                    h-4
                  "
                />

                <span>
                  {team.name}
                </span>

              </div>

                <strong>
                  {team.points}
                  {" "}
                  pts
                </strong>

              </div>

            )
          )}

        </div>

        <h3
          className="
            text-xl
            font-bold
            mt-6
            mb-3
          "
        >
          ⚽ Más Goles
        </h3>

        <div className="space-y-2">

          {standings.topScorers.map(
            (
              team: any,
              index: number
            ) => (

              <div
                key={team.teamId}
                className="
                  flex
                  justify-between
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >

                  <span>
                    {index + 1}.
                  </span>

                  <img
                    src={team.flagUrl}
                    alt=""
                    className="
                      w-6
                      h-4
                    "
                  />

                  <span>
                    {team.name}
                  </span>

                </div>

                <strong>
                  {team.goals}
                </strong>

              </div>

            )
          )}

        </div>

        <h3
          className="
            text-xl
            font-bold
            mt-6
            mb-3
          "
        >
          📋 Últimos Resultados
        </h3>

        <div
          className="
            space-y-2
          "
        >

          {standings.recentResults?.map(
            (
              match: any
            ) => (

              <div
                key={match.id}
                className="
                  flex
                  items-center
                  justify-between
                  text-sm
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >

                  <img
                    src={
                      match.homeTeam
                        .flagUrl
                    }
                    alt=""
                    className="
                      w-5
                      h-3
                    "
                  />

                  <strong>
                    {
                      match.homeTeam
                        .fifaCode
                    }
                  </strong>

                </div>

                <div
                  className="
                    font-bold
                  "
                >
                  {
                    match.homeGoals
                  }
                  {" - "}
                  {
                    match.awayGoals
                  }
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-1
                  "
                >

                  <img
                    src={
                      match.awayTeam
                        .flagUrl
                    }
                    alt=""
                    className="
                      w-5
                      h-3
                    "
                  />

                  <strong>
                    {
                      match.awayTeam
                        .fifaCode
                    }
                  </strong>

                </div>

              </div>

            )
          )}

        </div>
        <a
          href="/standings"
          className="
            mt-4
            inline-block
            text-blue-600
          "
        >
          Ver Tabla Completa
        </a>

      </div>

      )}

      {currentUser?.role ===
        "super_admin" && (

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          <a
            href="/admin/organization-requests"
            className="
              px-4
              py-2
              rounded
              bg-blue-600
              text-white
              text-center
            "
          >
            Administrar Solicitudes
          </a>

          <a
            href="/admin/results"
            className="
              px-4
              py-2
              rounded
              bg-green-600
              text-white
              text-center
            "
          >
            Resultados Oficiales
          </a>

          <a
            href="/admin/scores"
            className="
              px-4
              py-2
              rounded
              bg-orange-600
              text-white
              text-center
            "
          >
            Calcular Puntajes
          </a>

        </div>

      )}

      {currentUser?.role ===
        "participant" &&
        !currentUser
          ?.organizationId && (

        <a
          href="/create-organization"
          className="
            px-4
            py-2
            rounded
            bg-green-600
            text-white
          "
        >
          Crear Organización
        </a>

      )}

      {(
        currentUser?.organizationId &&
        (
          currentUser?.role === "participant" ||
          currentUser?.role === "organization_admin"
        )
      ) && (

        <a
          href="/predictions"
          className="
            px-4
            py-2
            rounded
            bg-purple-600
            text-white
          "
        >
          Mis Predicciones
        </a>

      )}

      {currentUser?.role ===
        "organization_admin" && (

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          <a
            href="/organization"
            className="
              px-4
              py-2
              rounded
              bg-blue-600
              text-white
              text-center
            "
          >
            Mi Organización
          </a>
        </div>

      )}

      <button
        onClick={logout}
        className="
          px-4
          py-2
          rounded
          bg-red-600
          text-white
        "
      >
        Cerrar sesión
      </button>

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
            onClick={() => {

              setShowAdvice(
                false
              );
            
              setSelectedMatch(
                null
              );
            
            }}
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
                {
                  selectedMatch.status ===
                  "scheduled"

                    ? "Información del Partido"

                    : "Resultado Oficial"
                }
              </h2>

              {selectedMatch.status ===
              "scheduled" ? (

                <div
                  className="
                    space-y-4
                  "
                >

                  <div
                    className="
                      flex
                      justify-between
                      items-center
                    "
                  >

                    <div
                      className="
                        text-center
                      "
                    >

                      <img
                        src={
                          selectedMatch
                            .homeTeam
                            .flagUrl
                        }
                        alt=""
                        className="
                          w-12
                          h-8
                          mx-auto
                        "
                      />

                      <div
                        className="
                          font-bold
                        "
                      >
                        {
                          selectedMatch
                            .homeTeam
                            .fifaCode
                        }
                      </div>

                      <div
                        className="
                          text-sm
                        "
                      >
                        {
                          selectedMatch
                            .homeTeam
                            .name
                        }
                      </div>

                    </div>

                    <div
                      className="
                        text-center
                        font-bold
                        text-xl
                      "
                    >
                      VS
                      <div className="text-center text-xs text-gray-500">
                        {
                          new Date(
                            selectedMatch.startsAtChile
                          ).toLocaleString(
                            "es-CL"
                          )
                        }
                      </div>
                    </div>

                    <div
                      className="
                        text-center
                      "
                    >

                      <img
                        src={
                          selectedMatch
                            .awayTeam
                            .flagUrl
                        }
                        alt=""
                        className="
                          w-12
                          h-8
                          mx-auto
                        "
                      />

                      <div
                        className="
                          font-bold
                        "
                      >
                        {
                          selectedMatch
                            .awayTeam
                            .fifaCode
                        }
                      </div>

                      <div
                        className="
                          text-sm
                        "
                      >
                        {
                          selectedMatch
                            .awayTeam
                            .name
                        }
                      </div>

                    </div>

                  </div>

                  {!showAdvice ? (

                    <div
                      className="
                        text-center
                        pt-4
                      "
                    >

                      <p
                        className="
                          mb-4
                        "
                      >
                        ¿Quieres un consejo
                        para este partido?
                      </p>

                      <div
                        className="
                          flex
                          justify-center
                          gap-2
                        "
                      >

                        <button
                          onClick={() =>
                            loadAdvice(
                              selectedMatch.id
                            )
                          }
                          className="
                            px-4
                            py-2
                            bg-green-600
                            text-white
                            rounded
                          "
                        >
                          Sí
                        </button>

                        <button
                          onClick={() => {

                            setShowAdvice(
                              false
                            );
                          
                            setSelectedMatch(
                              null
                            );
                          
                          }}
                          className="
                            px-4
                            py-2
                            bg-gray-300
                            rounded
                          "
                        >
                          No
                        </button>

                      </div>

                    </div>

                  ) : (

                    <div
                      className="
                        mt-4
                        p-3
                        bg-blue-50
                        rounded
                        text-sm
                      "
                    >

                        {adviceLoading ? (

                          <div
                            className="
                              flex
                              flex-col
                              items-center
                              gap-3
                              py-4
                            "
                          >

                            <div
                              className="
                                animate-spin
                                rounded-full
                                h-10
                                w-10
                                border-4
                                border-blue-200
                                border-t-blue-600
                              "
                            />

                            <div
                              className="
                                text-sm
                                text-gray-600
                                text-center
                              "
                            >
                              {loadingMessage}
                            </div>

                          </div>

                        ) : (

                          adviceText

                        )}

                    </div>

                  )}

                </div>

              ) : (
              <>
              <div className="space-y-2">

                <div
                  className="
                    flex
                    justify-between
                    items-center
                  "
                >

                  <div
                    className="
                      text-center
                    "
                  >

                    <img
                      src={
                        selectedMatch
                          .homeTeam
                          .flagUrl
                      }
                      alt=""
                      className="
                        w-12
                        h-8
                        mx-auto
                      "
                    />

                    <div
                      className="
                        font-bold
                      "
                    >
                      {
                        selectedMatch
                          .homeTeam
                          .fifaCode
                      }
                    </div>

                    <div
                      className="
                        text-sm
                      "
                    >
                      {
                        selectedMatch
                          .homeTeam
                          .name
                      }
                    </div>

                  </div>

                  <div
                    className="
                      text-center
                      font-bold
                      text-xl
                    "
                  >
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

                  <div
                    className="
                      text-center
                    "
                  >

                    <img
                      src={
                        selectedMatch
                          .awayTeam
                          .flagUrl
                      }
                      alt=""
                      className="
                        w-12
                        h-8
                        mx-auto
                      "
                    />

                    <div
                      className="
                        font-bold
                      "
                    >
                      {
                        selectedMatch
                          .awayTeam
                          .fifaCode
                      }
                    </div>

                    <div
                      className="
                        text-sm
                      "
                    >
                      {
                        selectedMatch
                          .awayTeam
                          .name
                      }
                    </div>

                  </div>

                </div>

                <div className="mt-6">

                <h2 className="
                  text-xl
                  font-bold
                  mb-1
                ">Tu pronóstico:</h2>
  
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

                <div className="mt-6">

                  <h2 className="
                  text-xl
                  font-bold
                  mb-1
                ">Puntaje obtenido:</h2>

                  <strong>

                    {" "}
                    {
                      selectedMatch
                        .scores?.[0]
                        ?.points ?? 0
                    }

                  </strong>

                </div>

                <div className="mt-6">

                <h2 className="
                  text-xl
                  font-bold
                  mb-1
                ">Puntaje máximo:</h2>

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
              </>
              )}
            </div>

          </div>

        )
      }
    </div>

  );

}