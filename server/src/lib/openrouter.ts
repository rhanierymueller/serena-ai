import axios from "axios";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY in environment variables");
}

export async function callOpenRouter(messages: { role: string; content: string }[]) {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat:free",
        messages: [
          { role: "system", content: "Você é uma terapeuta empática e acolhedora." },
          ...messages,
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error("Resposta inesperada da OpenRouter");
    }

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("Erro na chamada do OpenRouter:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Erro ao chamar OpenRouter");
  }
}
