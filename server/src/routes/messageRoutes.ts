import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { chatId, role, content } = req.body;

  if (!chatId || !role || !content) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  try {
    const chatExists = await prisma.chat.findUnique({
      where: { id: chatId },
    });
    if (!chatExists) {
      return res.status(404).json({ error: "Chat não encontrado" });
    }
    const message = await prisma.message.create({
      data: { chatId, role, content },
    });

    if (role === "user") {
      const count = await prisma.message.count({
        where: { chatId, role: "user" },
      });

      if (count === 1) {
        await prisma.chat.update({
          where: { id: chatId },
          data: {
            title: content.slice(0, 50), 
          },
        });
      }
    }

    return res.status(201).json(message);
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);
    return res.status(500).json({ error: "Erro ao criar mensagem" });
  }
});

router.get("/", async (req: any, res: any) => {
  const { chatId } = req.query;

  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({ error: "chatId é obrigatório" });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return res.json(messages);
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});

export default router;
