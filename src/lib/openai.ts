const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY!;

async function callOpenAI(
  prompt: string,
  temperature = 0.8
) {

  const response =
    await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${OPENAI_API_KEY}`,
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: temperature,
          messages: [
            {
              role: "system",
              content:
                `Eres un comentarista deportivo y debes dar consejo sobre pronósticos de partidos del Mundial de Futbol 2026 para una liga privada.
                Tu estilo es breve, entretenido e informal.
                Utiliza exclusivamente la información proporcionada.
                No inventes resultados, estadísticas, posiciones, lesiones o antecedentes.
                No menciones falta de información, contexto o estadísticas.
                No uses frases como:
                - "faltan datos"
                - "no hay suficiente información"
                - "no se proporcionó contexto"
                `
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

  if (!response.ok) {

    throw new Error(
      await response.text()
    );

  }

  const json =
    await response.json();

  const content =
    json.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error(
      "Empty OpenAI response."
    );
  }
  
  return content;

}

export async function generateMatchAdvice(
  prompt: string
) {

  prompt = `${prompt}
       
        Genera un comentario breve indicando:

        1. Momento reciente de cada selección.
        2. Aspectos que podrían influir.
        3. Qué tipo de partido podría esperarse.

        Nunca entregues marcadores exactos.
        Nunca recomiendes apuestas.
        Tus respuestas deben parecer comentarios para aficionados al fútbol, no informes técnicos.
        Máximo 60 palabras.`;
  const response =
    await callOpenAI(prompt,0.8);
  return response;
}

export interface MatchSuggestion {
  winner:
    "home" |
    "away" |
    "draw";
  explanation:
    string;
  suggestions: {
    homeGoals:
      number;
    awayGoals:
      number;
  }[];
}

//
// Conversación WhatsApp
//

export async function generateMatchSuggestions(
  prompt: string
): Promise<MatchSuggestion> {

  prompt = `${prompt}

Debes responder EXCLUSIVAMENTE un JSON válido.
Con la información entregada:

1. Determina el ganador probable.
winner puede ser:
- home
- away

2. Genera exactamente cinco marcadores distintos.

3. Todos los marcadores deben ser coherentes con el mismo ganador.

4. Puede existir un ganador con un marcador en empate, para los partidos muy ajustados donde el ganador se clasifica por definicion a penales, pero los penales no cuentan en el marcador

5. Ordénalos desde el más probable al menos probable.

6. Escribe una explicación breve en español (máximo 180 caracteres).

Formato:

{
  "winner":"home",
  "explanation":"...",
  "suggestions":[
    {
      "homeGoals":2,
      "awayGoals":1
    },
    {
      "homeGoals":3,
      "awayGoals":1
    },
    {
      "homeGoals":1,
      "awayGoals":1
    },
    {
      "homeGoals":2,
      "awayGoals":0
    },
    {
      "homeGoals":3,
      "awayGoals":2
    }
  ]
}

No escribas ningún texto fuera del JSON.`;
  const response =
    await callOpenAI(prompt, 0.3);

  try {
      return JSON.parse(response.trim());
  }
  catch {
      throw new Error(
          "Invalid AI JSON response."
      );
  }

}