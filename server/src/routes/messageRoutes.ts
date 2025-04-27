import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { wrapAsync } from "../../utils/wrapAsync";

const router = Router();

router.post("/", wrapAsync(async (req: Request, res: Response) => {
  const { chatId, role, content } = req.body;

  if (!chatId || !role || !content) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  if (typeof chatId !== "string" || typeof role !== "string" || typeof content !== "string") {
    return res.status(400).json({ error: "Campos inválidos" });
  }

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
}));

router.get("/", wrapAsync(async (req: Request, res: Response) => {
  const { chatId } = req.query;

  if (!chatId || typeof chatId !== "string") {
    return res.status(400).json({ error: "chatId é obrigatório" });
  }

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });

  return res.json(messages);
}));

export default router;
