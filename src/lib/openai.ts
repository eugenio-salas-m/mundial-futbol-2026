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
                "Eres un analista deportivo especializado en fútbol internacional."
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