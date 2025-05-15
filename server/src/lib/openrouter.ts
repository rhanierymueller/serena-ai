import axios from "axios";

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY in environment variables");
}

interface OpenRouterConfig {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export async function callOpenRouter(
  messages: { role: string; content: string }[],
  config?: OpenRouterConfig
) {
  try {
    const hasSystemMessage = messages.some(msg => msg.role === 'system');
    const finalMessages = hasSystemMessage 
      ? messages 
      : [
          { role: "system",
            content: "Você é uma terapeuta empática. IMPORTANTE: Responda em texto simples, sem nenhuma formatação markdown. Não use asteriscos (*) para ênfase ou formatação. Não use numeração com asteriscos. Use formatação numérica simples (1., 2., etc.) para listas." },
          ...messages,
        ];

    const isPro = config?.max_tokens && config.max_tokens > 400;
    
    const model = isPro ? "openai/gpt-3.5-turbo" : "deepseek/deepseek-chat:free";
        
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model,
        temperature: config?.temperature ?? 0.6,
        top_p: config?.top_p ?? 0.9,
        max_tokens: config?.max_tokens ?? 400,
        messages: finalMessages,
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
