import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (req: any, res: any) => {
  const { mood, intensity, note, userId } = req.body;

  if (typeof userId !== "string" || typeof mood !== "string" || typeof intensity !== "number") {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  const entry = await prisma.moodEntry.create({
    data: { mood, intensity, note, userId },
  });
  res.json(entry);
});

router.get("/:userId", async (req: any, res: any) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "ID de usuário inválido." });
  }

  const entries = await prisma.moodEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  res.json(entries);
});

export default router;
