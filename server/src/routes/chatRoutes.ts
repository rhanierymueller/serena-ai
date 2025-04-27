import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { wrapAsync } from "../utils/wrapAsync";

const router = Router();

router.post("/", wrapAsync(async (req: Request, res: Response) => {
  const { userId, visitorId } = req.body;

  if (!userId && !visitorId) {
    return res.status(400).json({ error: "userId ou visitorId é obrigatório" });
  }

  if (userId && typeof userId !== "string") {
    return res.status(400).json({ error: "userId inválido" });
  }

  if (visitorId && typeof visitorId !== "string") {
    return res.status(400).json({ error: "visitorId inválido" });
  }

  const chat = await prisma.chat.create({
    data: {
      userId: userId || null,
      visitorId: visitorId || null,
    },
  });

  return res.status(201).json(chat);
}));

router.get("/", wrapAsync(async (req: Request, res: Response) => {
  const { userId, visitorId } = req.query;

  if (!userId && !visitorId) {
    return res.status(400).json({ error: "userId ou visitorId é obrigatório" });
  }

  if (userId && typeof userId !== "string") {
    return res.status(400).json({ error: "userId inválido" });
  }

  if (visitorId && typeof visitorId !== "string") {
    return res.status(400).json({ error: "visitorId inválido" });
  }

  const chats = await prisma.chat.findMany({
    where: userId
      ? { userId: String(userId) }
      : { visitorId: String(visitorId) },
    orderBy: { createdAt: "desc" },
  });

  return res.json(chats);
}));

router.delete("/:id", wrapAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, visitorId } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "id inválido" });
  }

  const chat = await prisma.chat.findUnique({ where: { id } });

  if (!chat) {
    return res.status(404).json({ error: "Chat não encontrado" });
  }

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

  await prisma.message.deleteMany({ where: { chatId: id } });
  await prisma.chat.delete({ where: { id } });

  return res.status(200).json({ success: true });
}));

export default router;
