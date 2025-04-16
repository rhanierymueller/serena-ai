import axios from "axios";

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

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error("Erro na chamada do OpenRouter:", error.response?.data || error.message);
    throw new Error("Erro ao chamar OpenRouter");
  }
}
