import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendActivationEmail, sendResetPasswordEmail } from "../lib/email";
import rateLimit from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { errorCode: "tooManyRequests" },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { errorCode: "tooManyRequests" },
});

const resendActivationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { errorCode: "tooManyRequests" },
});

router.post("/users", (async (req: any, res: any) => {
  const { name, email, gender, password, provider = "credentials" } = req.body;

  if (!name || !email) {
    return res.status(400).json({ errorCode: "missingCredentials" });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  const activationToken = uuidv4();

  if (existingUser) {
    if (existingUser.active) {
      return res.status(409).json({ errorCode: "emailAlreadyExists" });
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name,
        gender,
        password: hashedPassword,
        provider,
        active: false, // ainda deixa inativo até confirmar o email
        activationToken,
      },
    });

    const activationLink = `${process.env.CLIENT_URL}/activate/${activationToken}`;
    await sendActivationEmail(email, name, activationLink);

    const { password: _, activationToken: __, ...userWithoutPassword } = existingUser;
    return res.status(200).json(userWithoutPassword);
  }

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      gender,
      password: hashedPassword,
      provider,
      active: false,
      activationToken,
    },
  });

  const activationLink = `${process.env.CLIENT_URL}/activate/${activationToken}`;
  await sendActivationEmail(email, name, activationLink);

  const { password: _, activationToken: __, ...userWithoutPassword } = newUser;
  return res.status(201).json(userWithoutPassword);
}));

router.post("/login", [loginLimiter], async (req: any, res: any, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ errorCode: "missingCredentials" });
  }

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

  req.login(userSafe, (err: any) => {
    if (err) return next(err);
    res.json(userSafe);
  });
});

router.get("/activate/:token", async (req: any, res: any) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ errorCode: "invalidToken" });
  }

  const user = await prisma.user.findFirst({ where: { activationToken: token } });
  if (!user) {
    return res.status(404).json({ errorCode: "tokenNotFound" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { active: true, activationToken: null },
  });

  return res.status(200).json({ message: "Conta ativada com sucesso!" });
});

router.get("/users", async (req: any, res: any) => {
  const { email } = req.query;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ errorCode: "missingEmail" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ errorCode: "userNotFound" });
  }

  const { password: _, activationToken: __, ...userSafe } = user;
  return res.json(userSafe);
});

router.put("/users/:id", async (req: any, res: any) => {
  const { id } = req.params;
  const { name, gender, plan } = req.body;

  const updated = await prisma.user.update({ where: { id }, data: { name, gender, plan } });
  const { password: _, activationToken: __, ...userWithoutPassword } = updated;
  return res.json(userWithoutPassword);
});

router.delete("/users/:id", async (req: any, res: any) => {
  const { id } = req.params;

  await prisma.user.update({ where: { id }, data: { active: false } });
  req.logout((err: any) => {
    if (err) {
      console.error("Erro ao fazer logout após desativação:", err);
    }
    res.clearCookie("connect.sid", { path: "/" });
    res.status(200).json({ message: "Usuário desativado e logout realizado." });
  });
});

router.post("/resend-activation", [resendActivationLimiter], async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ errorCode: "missingEmail" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ errorCode: "userNotFound" });
  }
  if (user.active) {
    return res.status(400).json({ errorCode: "alreadyActivated" });
  }

  const activationToken = uuidv4();

  await prisma.user.update({
    where: { id: user.id },
    data: { activationToken },
  });

  const activationLink = `${process.env.CLIENT_URL}/activate/${activationToken}`;
  await sendActivationEmail(email, user.name, activationLink);

  return res.status(200).json({ message: "Activation email resent." });
});

router.post("/reset-password/:token", async (req: any, res: any) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ errorCode: "missingTokenOrPassword" });
  }

  const user = await prisma.user.findFirst({ where: { resetToken: token } });
  if (!user) {
    return res.status(404).json({ errorCode: "tokenNotFound" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
    },
  });

  return res.status(200).json({ message: "Password updated successfully!" });
});

router.post("/forgot-password", [forgotPasswordLimiter], async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ errorCode: "missingEmail" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ errorCode: "userNotFound" });
  }

  const resetToken = uuidv4();

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken },
  });

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendResetPasswordEmail(email, user.name, resetLink);

  return res.status(200).json({ message: "Reset password email sent." });
});

export default router;
