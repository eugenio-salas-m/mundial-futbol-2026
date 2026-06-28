import { prisma } from "@/lib/prisma";
import { PredictionEntrySource } from "@prisma/client";

export interface SavePredictionRequest {
    userId: string;
    matchId: string;
    homeGoals: number;
    awayGoals: number;
}

export interface SavePredictionResult {
    success: boolean;
    error?: string;
}

export async function savePredictionFromWhatsApp(
  request: SavePredictionRequest
) {
    try {
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