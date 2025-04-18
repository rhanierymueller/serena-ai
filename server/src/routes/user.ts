import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";


const router = Router();

router.post("/users", async (req: any, res: any) => {
  const { name, email, gender, password, provider = 'credentials' } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Nome e email são obrigatórios." });
  }

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        gender,
        password: hashedPassword,
        provider,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    return res.status(400).json({ error: "Erro ao criar usuário." });
  }
});

router.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Credenciais ausentes." });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Senha incorreta." });

    const { password: _, ...userSafe } = user;
    return res.json(userSafe);
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.get("/users", async (req: any, res: any) => {
  const { email } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email é obrigatório." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    return res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});

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
    return res.status(400).json({ error: "Erro ao atualizar usuário." });
  }
});

export default router;
