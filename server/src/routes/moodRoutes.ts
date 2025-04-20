import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", async (req: any, res: any) => {
  const { mood, intensity, note, userId } = req.body;

  if (!userId || !mood || !intensity) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  try {
    const entry = await prisma.moodEntry.create({
      data: { mood, intensity, note, userId },
    });
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar entrada emocional." });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const entries = await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar histórico emocional." });
  }
});

export default router;
