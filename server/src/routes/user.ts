import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/users", async (req: any, res: any) => {
  const { name, email, gender, password, provider = "credentials" } = req.body;

  if (!name || !email) {
    return res.status(400).json({ errorCode: "missingCredentials" });
  }

  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const activationToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        gender,
        password: hashedPassword,
        provider,
        active: false,
        activationToken: activationToken,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json(userWithoutPassword);

  } catch (err: any) {
    console.error("Erro ao criar usuário:", err);

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(400).json({ errorCode: "emailAlreadyExists" });
    }

    return res.status(500).json({ errorCode: "internalServerError" });
  }
});

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

    if (!user.active) {
      return res.status(401).json({ errorCode: "accountNotActivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ errorCode: "wrongPassword" });
    }

    const { password: _, activationToken: __, ...userSafe } = user;
    return res.json(userSafe);

  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ errorCode: "internalServerError" });
  }
});

router.get("/activate/:token", async (req: any, res: any) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ errorCode: "invalidToken" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { activationToken: token },
    });

    if (!user) {
      return res.status(404).json({ errorCode: "tokenNotFound" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        active: true,
        activationToken: null,
      },
    });

    return res.status(200).json({ message: "Conta ativada com sucesso!" });

  } catch (error: any) {
    console.error("Erro ao ativar conta:", error);
    return res.status(500).json({ errorCode: "internalServerError" });
  }
});

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

    const { password: _, activationToken: __, ...userSafe } = user;
    return res.json(userSafe);

  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return res.status(500).json({ errorCode: "internalServerError" });
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

    const { password: _, activationToken: __, ...userWithoutPassword } = updated;
    return res.json(userWithoutPassword);

  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    return res.status(400).json({ errorCode: "updateFailed" });
  }
});

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
