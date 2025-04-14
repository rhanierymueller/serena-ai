import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// 🔹 Criação de chat: permite userId OU visitorId
router.post("/", async (req: any, res: any) => {
  const { userId, visitorId } = req.body;

  if (!userId && !visitorId) {
    return res.status(400).json({ error: "userId ou visitorId é obrigatório" });
  }

  try {
    const chat = await prisma.chat.create({
      data: {
        userId: userId || null,
        visitorId: visitorId || null,
      },
    });

    return res.status(201).json(chat);
  } catch (error) {
    console.error("Erro ao criar chat:", error);
    return res.status(500).json({ error: "Erro ao criar chat" });
  }
});

// 🔹 Busca de chats: aceita userId OU visitorId
router.get("/", async (req: any, res: any) => {
  const { userId, visitorId } = req.query;

  if (!userId && !visitorId) {
    return res.status(400).json({ error: "userId ou visitorId é obrigatório" });
  }

  try {
    const chats = await prisma.chat.findMany({
      where: userId
        ? { userId: String(userId) }
        : { visitorId: String(visitorId) },
      orderBy: { createdAt: "desc" },
    });

    return res.json(chats);
  } catch (error) {
    console.error("Erro ao buscar chats:", error);
    return res.status(500).json({ error: "Erro ao buscar chats" });
  }
});

// 🔹 Deleção de chat: valida se pertence ao usuário ou visitante
router.delete("/:id", async (req: any, res: any) => {
  const { id } = req.params;
  const { userId, visitorId } = req.query;

  try {
    const chat = await prisma.chat.findUnique({ where: { id } });

    if (!chat) {
      return res.status(404).json({ error: "Chat não encontrado" });
    }

    // valida se pertence ao user ou ao visitante
    if (chat.userId) {
      if (chat.userId !== userId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
    } else if (chat.visitorId) {
      if (chat.visitorId !== visitorId) {
        return res.status(403).json({ error: "Acesso negado" });
      }
    } else {
      return res.status(403).json({ error: "Chat sem vínculo identificável" });
    }

    // remove mensagens e chat
    await prisma.message.deleteMany({ where: { chatId: id } });
    await prisma.chat.delete({ where: { id } });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar chat:", error);
    return res.status(500).json({ error: "Erro ao deletar chat" });
  }
});

export default router;
