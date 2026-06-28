import { prisma } from "@/lib/prisma";
import { PredictionEntrySource } from "@prisma/client";

export interface SavePredictionRequest {
    userId: string;
    matchId: string;
    homeGoals: number;
    awayGoals: number;
    winner?: "home" | "away" | "draw";
}

export interface SavePredictionResult {
    success: boolean;
    error?: string;
}

export async function savePredictionFromWhatsApp(
  request: SavePredictionRequest
) {
    try {

        const match =
            await prisma.match.findUnique({
                where: {
                    id: request.matchId
                },
                select: {
                    homeTeamId: true,
                    awayTeamId: true
                }
        });

        let qualifiedTeamId: string | null = null;

        if (request.homeGoals > request.awayGoals) {

            qualifiedTeamId =
                match!.homeTeamId;

        } else if (request.awayGoals > request.homeGoals) {

            qualifiedTeamId =
                match!.awayTeamId;

        } else if (request.winner === "home") {

            qualifiedTeamId =
                match!.homeTeamId;

        } else if (request.winner === "away") {

            qualifiedTeamId =
                match!.awayTeamId;

        }

        const prediction =
            await prisma.prediction.upsert({
            where: {
                userId_matchId: {
                userId:
                    request.userId,
                matchId:
                    request.matchId
                }
            },
            update: {
                homeGoals:
                    request.homeGoals,
                awayGoals:
                    request.awayGoals,
                qualifiedTeamId,
                entrySource:
                    PredictionEntrySource.whatsapp_ai
            },
            create: {
                userId:
                    request.userId,
                matchId:
                    request.matchId,
                homeGoals:
                    request.homeGoals,
                awayGoals:
                    request.awayGoals,
                qualifiedTeamId,
                entrySource:
                    PredictionEntrySource.whatsapp_ai
            }
        });

        return {
            success: true
        };
    }
    catch (error: any) {
        console.error(error);
        return {
            success: false,
            error: error.message
        };
    }
}