const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY!;

export async function generateMatchAdvice(
  prompt: string
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
          temperature: 0.8,
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
                Nunca entregues marcadores exactos.
                Nunca recomiendes apuestas.
                Tus respuestas deben parecer comentarios para aficionados al fútbol, no informes técnicos.`
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

  return json.choices[0]
    .message.content;

}