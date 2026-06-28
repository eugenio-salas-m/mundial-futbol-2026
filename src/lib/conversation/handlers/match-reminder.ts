import { ConversationState, NotificationLog, ConversationSession, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateMatchSuggestions } from "@/lib/openai";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send-whatsapp-message";
import type { ConversationRequest } from "../process-conversation";
import { sendWhatsAppButtons } from "@/lib/whatsapp/send-whatsapp-buttons";
import { buildMatchPrompt } from "@/lib/matches/build-match-prompt";
import { savePredictionFromWhatsApp } from "@/lib/conversation/save-prediction-from-whatsapp";

import {
    Match,
    Team
} from "@prisma/client";

import {
    MatchSuggestion
} from "@/lib/openai";

interface HandlerRequest {
    session: ConversationSession;
    notificationLog: NotificationLog;
    request: ConversationRequest;
}
  
interface PredictionContext {
    matchId: string;
    winner:
        "home" |
        "away" |
        "draw";
    explanation: string;
    currentSuggestion: number;
    suggestions: {
        homeGoals: number;
        awayGoals: number;
    }[];
  
}

export async function handleMatchReminderConversation(request: HandlerRequest) {
  
    switch (request.session.state) {
        case ConversationState.prediction_help:
            return handlePredictionHelp(request);
        case ConversationState.awaiting_prediction:
            return handleAwaitingPrediction(request);
        case ConversationState.awaiting_confirmation:
            return handleAwaitingConfirmation(request);
        default:
            return closePredictionHelp(request);
    }
}


function getWinnerName(
    suggestion: MatchSuggestion,
    match: any
) {
    return suggestion.winner === "home"
    ? match.homeTeam.name
    : suggestion.winner === "away"
    ? match.awayTeam.name
    : "Empate";
}

function toJson(
    context: PredictionContext
): Prisma.InputJsonValue {
    return context as unknown as Prisma.InputJsonValue;
}

function fromJson(
    context: Prisma.JsonValue | null
): PredictionContext | null {
    return context as PredictionContext | null;
}

async function closeConversation(
    session: ConversationSession
) {
    session.state =
        ConversationState.main_menu;

    await prisma.conversationSession.update({
        where: {
            id: session.id
        },
        data: {
            state: ConversationState.main_menu,
            context: Prisma.DbNull,
            lastMessageAt: new Date()
        }
    });
}

async function closePredictionHelp({
    session,
    notificationLog,
    request
}: HandlerRequest) {
    
    const message = `La conversación expiró.
    Puedes comenzar nuevamente desde la página web.

    ${process.env.NEXT_PUBLIC_SITE_URL}`;

        await sendWhatsAppMessage({
            session,
            phoneNumber: request.phoneNumber,
            text: message,
            notificationLogId: notificationLog.id
        });
  
        await closeConversation(session);
    
        return;
}

async function handlePredictionHelp({
    session,
    notificationLog,
    request
}: HandlerRequest) {
  
    const answer = request.text.trim().toLowerCase();
    let message = "";

    if (!["si","sí","yes","ok","dale","claro"].includes(answer)
    ) {
        message = `De acuerdo 👍
    Recuerda guardar tu pronóstico desde la página web.

    ${process.env.NEXT_PUBLIC_SITE_URL}`;

        await sendWhatsAppMessage({
            session,
            phoneNumber: request.phoneNumber,
            text: message,
            notificationLogId: notificationLog.id
        });
  
        await closeConversation(session);
    
        return;
    
    }
  
    // Buscar partido
  
    const match =
      await prisma.match.findUnique({
        where: {
          id:
            notificationLog.matchId!
        },
        include: {
            homeTeam: true,
            awayTeam: true
        }
      });
  
    if (!match) {
      throw new Error(
        "Match not found."
      );
    }

    const prompt =
        await buildMatchPrompt(
          match
      );

    const suggestion =
        await generateMatchSuggestions(
            prompt
        );

    const context: PredictionContext = {
        matchId:
            match.id,
        winner:
            suggestion.winner,
        explanation:
            suggestion.explanation,
        currentSuggestion: 0,
        suggestions:
            suggestion.suggestions
    };
          
    session.state = 
        ConversationState.awaiting_prediction;

    const winner = getWinnerName(suggestion, match);

    message =`${suggestion.explanation}
    
    🏆 Mi sugerencia es:
    
    ${winner}
    
    ¿Quieres conocer el marcador exacto?`;

    const buttons = [
        {
            id: "prediction_yes",
            title: "Sí"
        },
        {
            id: "prediction_no",
            title: "No"
        }
    ];

    await prisma.conversationSession.update({
        where:{
            id:session.id
        },
        data:{
            state: session.state,
            context: toJson(context),
            lastMessageAt:
                new Date()
        }
    });

    await sendWhatsAppButtons({
        session,
        phoneNumber: request.phoneNumber,
        body: message,
        buttons,
        notificationLogId: notificationLog.id
    });

}

async function handleAwaitingPrediction({
    session,
    notificationLog,
    request
}: HandlerRequest) {

    const answer =
        request.text.trim().toLowerCase();

    const context =
        session.context as unknown as PredictionContext | null;

    let message = "";

    if (
        !context ||
        !context.suggestions ||
        context.suggestions.length === 0
    ) {
        
        message = `No pude recuperar la sugerencia anterior.

Por favor ingresa tu pronóstico desde la página web.

${process.env.NEXT_PUBLIC_SITE_URL}`;

        await sendWhatsAppMessage({
            session,
            phoneNumber: request.phoneNumber,
            text: message,
            notificationLogId: notificationLog.id
        });

        await closeConversation(session);

        return;
    }

    if (!["si", "sí", "yes", "ok", "dale", "claro"].includes(answer)) {

        message = `De acuerdo 👍

Recuerda guardar tu pronóstico desde la página web.

${process.env.NEXT_PUBLIC_SITE_URL}`;


        await sendWhatsAppMessage({
            session,
            phoneNumber: request.phoneNumber,
            text: message,
            notificationLogId: notificationLog.id
        });

        await closeConversation(session);

        return;
    }

    const currentIndex =
        context.currentSuggestion ?? 0;

    const suggestion =
        context.suggestions[
            currentIndex
        ];

    if (!suggestion) {

        message = `No tengo más sugerencias para este partido.

Puedes guardar tu pronóstico desde la página web.

${process.env.NEXT_PUBLIC_SITE_URL}`;
        
        await sendWhatsAppMessage({
            session,
            phoneNumber: request.phoneNumber,
            text: message,
            notificationLogId: notificationLog.id
        });

        await closeConversation(session);

        return;
    }

    session.state =
        ConversationState.awaiting_confirmation;

    await prisma.conversationSession.update({
        where: {
            id: session.id
        },
        data: {
            state:
                ConversationState.awaiting_confirmation,
            context: toJson(context),
            lastMessageAt:
                new Date()
        }
    });

    const isLastSuggestion =
        currentIndex >=
        context.suggestions.length - 1;

    const buttons =
        isLastSuggestion
            ? [
                {
                    id: "prediction_save",
                    title: "Sí"
                },
                {
                    id: "prediction_cancel",
                    title: "No"
                }
            ]
            : [
                {
                    id: "prediction_save",
                    title: "Sí"
                },
                {
                    id: "prediction_cancel",
                    title: "No"
                },
                {
                    id: "prediction_next",
                    title: "Otro resultado"
                }
            ];

    message = `Mi marcador sugerido es:

⚽ ${suggestion.homeGoals} - ${suggestion.awayGoals}

¿Quieres guardar este pronóstico?`;

    await sendWhatsAppButtons({
        session,
        phoneNumber: request.phoneNumber,
        body: message,
        buttons,
        notificationLogId: notificationLog.id
    });


}
  
async function handleAwaitingConfirmation({
    session,
    notificationLog,
    request
}: HandlerRequest) {

    const answer =
        request.text.trim().toLowerCase();

    const context =
        fromJson(session.context);

    let message = "";
    if (!context) {

        message = `No pude recuperar la conversación.

${process.env.NEXT_PUBLIC_SITE_URL}`;

        await sendWhatsAppMessage({
            session,
            phoneNumber: request.phoneNumber,
            text: message,
            notificationLogId: notificationLog.id
        });

        await closeConversation(session);

        return;

    }

    //
    // Otro resultado
    //

    if (
        [
            "otro",
            "otro resultado",
            "cambiar",
            "prediction_next"
        ].includes(answer)
    ) {

        context.currentSuggestion++;

        if (
            context.currentSuggestion >=
            context.suggestions.length
        ) {
            context.currentSuggestion =
                context.suggestions.length - 1;
        }

        session.state =
            ConversationState.awaiting_prediction;

        await prisma.conversationSession.update({
            where: {
                id:
                    session.id
            },
            data: {
                state:
                    ConversationState.awaiting_prediction,
                context: toJson(context),
                lastMessageAt:
                    new Date()
            }

        });

        return handleAwaitingPrediction({
            session,
            notificationLog,
            request: {
                ...request,
                text: "sí"
            }
        });

    }

    //
    // No guardar
    //

    if (
        [
            "no",
            "prediction_cancel"
        ].includes(answer)
    ) {

        message = `De acuerdo 👍

Recuerda guardar tu pronóstico desde la página web.

${process.env.NEXT_PUBLIC_SITE_URL}`;

        await sendWhatsAppMessage({
            session,
            phoneNumber: request.phoneNumber,
            text: message,
            notificationLogId: notificationLog.id
        });

        await closeConversation(session);

        return;

    }

    //
    // Guardar
    //

    if (["si", "sí", "yes", "ok", "dale", "claro", "prediction_save"].includes(answer)) {

        //
        // Verificar que el partido siga abierto
        //

        const match =
        await prisma.match.findUnique({
            where: {
                id: context.matchId
            },
            select: {
                startsAtChile: true
            }
        });

        if (
        !match ||
        match.startsAtChile <= new Date()
        ) {

            message =
            `⏰ Ya no es posible guardar este pronóstico.

            El partido ya comenzó.

            ${process.env.NEXT_PUBLIC_SITE_URL}`;

            await sendWhatsAppMessage({
                session,
                phoneNumber: request.phoneNumber,
                text: message,
                notificationLogId: notificationLog.id
            });

            await closeConversation(session);

            return;

        }

        const suggestion =
            context.suggestions[
                context.currentSuggestion
            ];

        const result =
            await savePredictionFromWhatsApp({
                userId:
                    session.userId!,
                matchId:
                    context.matchId,
                homeGoals:
                    suggestion.homeGoals,
                awayGoals:
                    suggestion.awayGoals
            });

        if (
            result.success
        ) {

            message = "✅ Pronóstico guardado correctamente.";
            await sendWhatsAppMessage({
                session,
                phoneNumber: request.phoneNumber,
                text: message,
                notificationLogId: notificationLog.id
            });

        }
        else {
            message = `Hubo un problema al guardar el pronóstico.

    Puedes hacerlo desde:

    ${process.env.NEXT_PUBLIC_SITE_URL}`;

            await sendWhatsAppMessage({
                session,
                phoneNumber: request.phoneNumber,
                text: message,
                notificationLogId: notificationLog.id
            });
        }
    }
    else{
        message = `De acuerdo 👍

        Recuerda guardar tu pronóstico desde la página web.
        
        ${process.env.NEXT_PUBLIC_SITE_URL}`;
        
                await sendWhatsAppMessage({
                    session,
                    phoneNumber: request.phoneNumber,
                    text: message,
                    notificationLogId: notificationLog.id
                });
    }

    await closeConversation(session);

}