import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: "userId é obrigatório" });

  try {
    const chat = await prisma.chat.create({
      data: { userId },
    });

    return res.status(201).json(chat);
  } catch (error) {
    console.error("Erro ao criar chat:", error);
    return res.status(500).json({ error: "Erro ao criar chat" });
  }
});

router.get("/", async (req: any, res: any) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== "string")
    return res.status(400).json({ error: "userId é obrigatório" });

  try {
    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(chats);
  } catch (error) {
    console.error("Erro ao buscar chats:", error);
    return res.status(500).json({ error: "Erro ao buscar chats" });
  }
});

router.delete("/:id", async (req: any, res: any) => {
  const { id } = req.params;

  const chat = await prisma.chat.findUnique({ where: { id } });
  if (!chat) {
    return res.status(404).json({ error: "Chat não encontrado" });
  }

  try {
    await prisma.message.deleteMany({
      where: { chatId: id },
    });

    await prisma.chat.delete({
      where: { id },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar chat:", error);
    return res.status(500).json({ error: "Erro ao deletar chat" });
  }
});

export default router;
