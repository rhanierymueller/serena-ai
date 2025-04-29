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

// heurística da OpenAI: +4 tokens por mensagem +2 de final
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
     TIER PRO  –  GPT-3.5-turbo com limite dinâmico de tokens
  ======================================================================= */
  if (isPro && chat.user) {
    const systemPrompt: ChatCompletionMessageParam = {
      role: "system",
      content:
        "Você é uma terapeuta empática. Responda em texto simples, sem markdown.",
    };

    const promptMsgs = [systemPrompt, ...history];

    /* 1. Tokens do prompt + saldo restante ------------------------------ */
    const promptTokens = countPromptTokens(promptMsgs);
    const saldoOpenAI = await remainingOpenAITokens(chat.user.id); // em tokens OpenAI

    // deixa 10 % de folga (variações de tokenização)
    const maxCompletion = Math.floor((saldoOpenAI - promptTokens) * 0.9);

    if (maxCompletion < 50) {
      return res
        .status(403)
        .json({ error: "Saldo insuficiente de tokens para nova resposta." });
    }

    /* 2. Chamada ao modelo ---------------------------------------------- */
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: maxCompletion,
      messages: promptMsgs,
    });

    const usedNow = completion.usage?.total_tokens ?? 0;
    await consumeTokens(chat.user.id, usedNow);

    reply =
      completion.choices[0].message.content ??
      "Desculpe, não consegui entender.";
  }

  /* =======================================================================
     TIER FREE – DeepSeek via OpenRouter
  ======================================================================= */
  else {
    reply = await callOpenRouter(
      history.map((m) => ({
        role: m.role,
        content:
          typeof m.content === "string" ? m.content : "[mensagem não suportada]",
      }))
    );
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
