import { OpenAI } from "openai";
export const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1", // importante para usar o OpenRouter
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // substitua pela URL do seu front se for diferente
    "X-Title": "Serena AI", // nome do seu projeto
  },
});
