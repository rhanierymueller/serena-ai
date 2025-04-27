import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { openai } from "../lib/openai.js";
import { callOpenRouter } from "../lib/openrouter.js";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { canUseTokens, consumeTokens } from "../lib/token.js";
import { wrapAsync } from "../../utils/wrapAsync";

const router = Router();

router.post("/", wrapAsync(async (req: Request, res: Response) => {
  const { chatId } = req.body;

  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({ error: "chatId inválido" });
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { user: true, messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!chat) return res.status(404).json({ error: "Chat não encontrado" });

  const history: ChatCompletionMessageParam[] = chat.messages.map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: typeof m.content === "string" ? m.content : "[mensagem inválida]",
  }));

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: "Você é uma terapeuta empática e acolhedora." },
    ...history,
  ];

  const isPro = chat.user?.plan === "pro";
  let reply: string;

  if (isPro) {
    if (!chat.user) {
      return res.status(401).json({ error: "Usuário não encontrado para este chat." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const used = completion.usage?.total_tokens || 0;

    const allowed = await canUseTokens(chat.user.id, used);
    if (!allowed) {
      return res.status(403).json({ error: "Você atingiu o limite de tokens do plano" });
    }

    await consumeTokens(chat.user.id, used);

    reply = completion.choices[0].message.content || "Desculpe, não entendi.";
  } else {
    reply = await callOpenRouter(
      history.map(m => ({
        role: m.role,
        content: typeof m.content === "string" ? m.content : "[mensagem não suportada]",
      }))
    );
  }

  if (!reply || typeof reply !== "string") {
    reply = "Desculpe, não consegui gerar uma resposta no momento.";
  }

  const saved = await prisma.message.create({
    data: {
      chatId,
      role: "assistant",
      content: reply,
    },
  });

  res.json({ content: saved.content });
}));

export default router;
