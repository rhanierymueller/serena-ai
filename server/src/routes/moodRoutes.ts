import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { wrapAsync } from "../utils/wrapAsync.js";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/", wrapAsync(async (req: Request, res: Response) => {
  const { mood, intensity, note, userId } = req.body;

  if (typeof userId !== "string" || typeof mood !== "string" || typeof intensity !== "number") {
    return res.status(400).json({ error: "Dados inválidos." });
  }

  const entry = await prisma.moodEntry.create({
    data: { mood, intensity, note, userId },
  });
  res.json(entry);
}));

router.get("/:userId", wrapAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "ID de usuário inválido." });
  }

  const entries = await prisma.moodEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  res.json(entries);
}));

export default router;
