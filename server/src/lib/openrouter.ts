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
        temperature: 0.6,   
        top_p: 0.9,          
        max_tokens: 400,
        messages: [
          { role: "system",
            content: "Você é uma terapeuta empática. Responda em texto simples, sem markdown." },
          ...messages,
        ],
        provider: { allow_fallbacks: false },
      },
      { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` } }
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
