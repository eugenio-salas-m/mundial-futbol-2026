"use client";

import {
  useEffect,
  useState
} from "react";

import Image from "next/image";

import PageHeader from "@/components/page-header";

export default function StandingsPage() {

  const [loading,
    setLoading] =
    useState(true);

  const [groups,
    setGroups] =
    useState<
      Record<
        string,
        any[]
      >
    >({});

  useEffect(() => {

    const loadData =
      async () => {

        const response =
          await fetch(
            "/api/world-cup/groups",
            {
              method: "POST"
            }
          );

        if (
          !response.ok
        ) {

          setLoading(
            false
          );

          return;

        }

        const result =
          await response.json();

        setGroups(
          result
        );

        setLoading(
          false
        );

      };

    loadData();

  }, []);

  if (loading) {

    return (
      <div className="p-6">
        Cargando...
      </div>
    );

  }

  const orderedGroups =
    Object.keys(
      groups
    ).sort();

  return (

    <div className="max-w-7xl mx-auto p-4">

      <PageHeader
        title="Tabla de Posiciones"
      />

      <div
        className="
          grid
          md:grid-cols-2
          gap-6
        "
      >

        {orderedGroups.map(
          (
            groupCode
          ) => (

            <div
              key={
                groupCode
              }
              className="
                border
                rounded-lg
                bg-white
                shadow
                overflow-hidden
              "
            >

              <div
                className="
                  bg-blue-600
                  text-white
                  px-4
                  py-2
                  font-bold
                "
              >
                Grupo {groupCode}
              </div>

              <div
                className="
                  overflow-x-auto
                "
              >

                <table
                  className="
                    w-full
                    text-sm
                  "
                >

                  <thead>

                    <tr
                      className="
                        bg-gray-100
                      "
                    >
                        <th>#</th>
                      <th className="p-2">
                        Equipo
                      </th>

                      <th>
                        PJ
                      </th>

                      <th>
                        PG
                      </th>

                      <th>
                        PE
                      </th>

                      <th>
                        PP
                      </th>

                      <th>
                        GF
                      </th>

                      <th>
                        GC
                      </th>

                      <th>
                        DG
                      </th>

                      <th>
                        PTS
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {groups[
                      groupCode
                    ].map(
                      (
                        team: any,
                        index: number
                      ) => (

                        <tr
                          key={
                            team.teamId
                          }
                          className={
                            index === 0
                              ? "bg-green-200"
                              : index === 1
                              ? "bg-green-100"
                              : ""
                          }
                        >
                            <td
                            className="
                                font-bold
                                text-center
                            "
                            >
                            {index + 1}
                            </td>
                          <td
                            className="
                              p-2
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >

                              <Image
                                src={
                                  team.flagUrl
                                }
                                alt=""
                                width={
                                  24
                                }
                                height={
                                  18
                                }
                              />

                                <div>

                                <div
                                className="
                                    font-bold
                                "
                                >
                                {team.fifaCode}
                                </div>

                                <div
                                className="
                                    text-xs
                                    text-gray-500
                                    hidden md:block
                                "
                                >
                                {team.name}
                                </div>

                                </div>

                            </div>

                          </td>

                          <td>
                            {
                              team.pj
                            }
                          </td>

                          <td>
                            {
                              team.pg
                            }
                          </td>

                          <td>
                            {
                              team.pe
                            }
                          </td>

                          <td>
                            {
                              team.pp
                            }
                          </td>

                          <td>
                            {
                              team.gf
                            }
                          </td>

                          <td>
                            {
                              team.gc
                            }
                          </td>

                          <td>
                            {
                              team.dg
                            }
                          </td>

                          <td
                            className="
                              font-bold
                            "
                          >
                            {
                              team.points
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>
                <div
                className="
                p-2
                text-xs
                text-gray-500
                border-t
                "
            >
            
                🟩 Clasifica a la siguiente fase
            
            </div>
              </div>

            </div>
            
          )
        )}

      </div>

    </div>

  );

}