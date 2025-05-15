import { Router } from "express";
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";
import { callOpenRouter } from "../lib/openrouter";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import {
  remainingOpenAITokens,
  consumeTokens,
} from "../lib/token";

import { encoding_for_model } from "@dqbd/tiktoken";

const router = Router();

/* ---------- helpers de tokenização ---------- */
const enc = encoding_for_model("gpt-3.5-turbo");

function countContentTokens(text: string) {
  return enc.encode(text).length;
}


function countPromptTokens(msgs: ChatCompletionMessageParam[]) {
  return msgs.reduce((sum, m) => sum + countContentTokens(m.content as string) + 4, 2);
}
/* -------------------------------------------- */

router.post("/", async (req: any, res: any) => {
  const { chatId } = req.body;
  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({ error: "chatId inválido" });
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      user: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!chat) return res.status(404).json({ error: "Chat não encontrado" });

  /* --------- histórico --------- */
  const history: ChatCompletionMessageParam[] = chat.messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: typeof m.content === "string" ? m.content : "[mensagem inválida]",
  }));

  const isPro = chat.user?.plan === "pro";
  let reply: string;

  /* =======================================================================
     Chamada ao modelo via OpenRouter (para ambos os planos)
  ======================================================================= */
  try {
    
    reply = await callOpenRouter(
      history.map((m) => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : "[mensagem não suportada]",
      }))
    );
    
    console.log("Resposta recebida do modelo");
    
    if (isPro && chat.user) {
      const systemPrompt: ChatCompletionMessageParam = {
        role: "system",
        content: "Você é uma terapeuta empática. Responda em texto simples, sem markdown.",
      };
      
      const estimatedTokens = countPromptTokens([systemPrompt, ...history]) + 
                             (reply ? countContentTokens(reply) : 0);
      
      await consumeTokens(chat.user.id, estimatedTokens);
    }
  } catch (error) {
    console.error(`Erro ao chamar OpenRouter (plano: ${isPro ? 'pro' : 'free'}):`, error);
    console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
    return res.status(500).json({ error: `Erro ao gerar resposta com o modelo ${isPro ? 'pro' : 'free'}` });
  }

  /* ---------- fallback de segurança ---------- */
  if (!reply || typeof reply !== "string" || !reply.trim()) {
    reply = "Desculpe, não consegui gerar uma resposta no momento.";
  }

  /* ---------- grava a mensagem e responde ---------- */
  const saved = await prisma.message.create({
    data: {
      chatId,
      role: "assistant",
      content: reply,
    },
  });

  res.json({ content: saved.content });
});

export default router;
