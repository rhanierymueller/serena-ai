import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

const router = Router();

// CRIAR USUÁRIO
router.post("/users", async (req: any, res: any) => {
  const { name, email, gender, password, provider = 'credentials' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ errorCode: "missingCredentials" });
  }

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({
      data: { name, email, gender, password: hashedPassword, provider },
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);

  } catch (err: any) {
    console.error("Erro ao criar usuário:", err);

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(400).json({ errorCode: "emailAlreadyExists" });
    }

    return res.status(500).json({ errorCode: "internalServerError" });
  }
});

// LOGIN
router.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ errorCode: "missingCredentials" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ errorCode: "userNotFound" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ errorCode: "wrongPassword" });
    }

    const { password: _, ...userSafe } = user;
    return res.json(userSafe);

  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ errorCode: "internalServerError" });
  }
});

// GET USUÁRIO
router.get("/users", async (req: any, res: any) => {
  const { email } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ errorCode: "missingEmail" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ errorCode: "userNotFound" });
    }

    return res.json(user);

  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return res.status(500).json({ errorCode: "internalServerError" });
  }
});

// UPDATE USUÁRIO
router.put("/users/:id", async (req: any, res: any) => {
  const { id } = req.params;
  const { name, gender, plan } = req.body;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { name, gender, plan },
    });

    const { password: _, ...userWithoutPassword } = updated;
    return res.json(userWithoutPassword);

  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    return res.status(400).json({ errorCode: "updateFailed" });
  }
});

// DELETE USUÁRIO
router.delete("/users/:id", async (req: any, res: any) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ message: "Usuário excluído com sucesso." });

  } catch (err) {
    console.error("Erro ao excluir usuário:", err);
    return res.status(400).json({ errorCode: "deleteFailed" });
  }
});

export default router;
