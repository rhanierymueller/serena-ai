import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/:userId", async (req: any, res: any) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "ID inválido" });
  }

  const tokenEntry = await prisma.userToken.findUnique({ where: { userId } });
  if (!tokenEntry) return res.json({ total: 0, used: 0 });

  return res.json(tokenEntry);
});

export default router;
