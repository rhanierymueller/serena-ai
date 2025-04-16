import { Router } from "express";
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";
import { callOpenRouter } from "../lib/openrouter";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { chatId } = req.body;

  if (!chatId) return res.status(400).json({ error: "chatId é obrigatório" });

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { user: true, messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!chat) return res.status(404).json({ error: "Chat não encontrado" });

    const history = chat.messages.map((m: { role: string; content: any; }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content : "[mensagem inválida]",
    }))

    let reply: string;

    const isPro = chat.user?.plan === "pro";

    if (isPro) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
        { role: "system", content: "Você é uma terapeuta empática e acolhedora." },
        ...history,
      ],
    });

  reply = completion.choices[0].message.content || "Desculpe, não entendi.";
} else {
  // fallback OpenRouter (usuários FREE ou visitantes)
  reply = await callOpenRouter(history);
}

    const saved = await prisma.message.create({
      data: {
        chatId,
        role: "assistant",
        content: reply,
      },
    });

    res.json({ content: saved.content });
  } catch (err) {
    console.error("Erro ao gerar resposta:", err);
    res.status(500).json({ error: "Erro ao gerar resposta" });
  }
});

export default router;
