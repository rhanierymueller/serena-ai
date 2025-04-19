import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/:userId", async (req: any, res: any) => {
  const { userId } = req.params;

  try {
    const tokenEntry = await prisma.userToken.findUnique({ where: { userId } });
    if (!tokenEntry) return res.json({ total: 0, used: 0 });

    return res.json(tokenEntry);
  } catch (err) {
    console.error("Erro ao buscar tokens:", err);
    res.status(500).json({ error: "Erro ao buscar tokens" });
  }
});

export default router;
