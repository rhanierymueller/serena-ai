import { Router, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from "uuid";
import { sendActivationEmail, sendResetPasswordEmail } from "../lib/email";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "path";
import fs from "fs";
import { UploadService } from "../lib/uploadService";

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

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/identity');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPEG, PNG ou PDF são permitidos!'));
    }
  }
});

router.post("/users", (async (req: any, res: any) => {
  const { 
    name, 
    email, 
    gender, 
    password, 
    birthdate, 
    phone,
    region, 
    provider = "credentials",
    isPsychologist = false,
    crpNumber,
    specialty,
    professionalLicense,
    identityFrontPhoto,
    identityBackPhoto
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ errorCode: "missingCredentials" });
  }

  // Validação específica para psicólogos
  if (isPsychologist && (!crpNumber || !specialty || !identityFrontPhoto || !identityBackPhoto)) {
    return res.status(400).json({ errorCode: "missingPsychologistData" });
  }

  // Verificar se CRP já está em uso
  if (isPsychologist && crpNumber) {
    const existingCrp = await prisma.user.findFirst({ 
      where: { crpNumber: crpNumber, isPsychologist: true } 
    });
    if (existingCrp) {
      return res.status(409).json({ errorCode: "crpAlreadyExists" });
    }
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
        birthdate,
        phone,
        region,
        password: hashedPassword,
        provider,
        active: false, 
        activationToken,
        isPsychologist,
        crpNumber,
        specialty,
        professionalLicense,
        identityFrontPhoto,
        identityBackPhoto,
        crpStatus: isPsychologist ? "pending" : null,
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
      birthdate,
      phone,
      region,
      provider,
      active: false,
      activationToken,
      isPsychologist,
      crpNumber,
      specialty,
      professionalLicense,
      identityFrontPhoto,
      identityBackPhoto,
      crpStatus: isPsychologist ? "pending" : null,
    },
  });

  const activationLink = `${process.env.CLIENT_URL}/activate/${activationToken}`;
  await sendActivationEmail(email, name, activationLink);

  const { password: _, activationToken: __, ...userWithoutPassword } = newUser;
  return res.status(201).json(userWithoutPassword);
}));

// Rota para upload de documentos de identidade
router.post("/upload-identity", upload.fields([
  { name: 'identityFront', maxCount: 1 },
  { name: 'identityBack', maxCount: 1 }
]), async (req: any, res: any) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    const uploadResult = UploadService.processDocumentUpload(files);
    
    if (!uploadResult) {
      return res.status(400).json({ 
        errorCode: "invalidFiles",
        message: "Arquivos inválidos ou ausentes" 
      });
    }

    return res.status(200).json(uploadResult);
  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ 
      errorCode: "uploadError",
      message: "Erro ao fazer upload dos arquivos" 
    });
  }
});

// Rota para validar CRP
router.post("/validate-crp", async (req: any, res: any) => {
  const { crpNumber, state } = req.body;
  
  if (!crpNumber || !state) {
    return res.status(400).json({ 
      errorCode: "missingCrpData",
      message: "Número do CRP e estado são obrigatórios" 
    });
  }

  try {
    // Usar UploadService para validar CRP
    const validationResult = await UploadService.validateCrp(crpNumber, state);
    
    if (!validationResult.isValid) {
      return res.status(400).json({ 
        errorCode: "invalidCrp",
        message: validationResult.message || "CRP inválido" 
      });
    }

    return res.status(200).json({
      valid: validationResult.isValid,
      data: validationResult
    });

  } catch (error) {
    console.error('Erro na validação do CRP:', error);
    return res.status(500).json({ 
      errorCode: "validationError",
      message: "Erro ao validar CRP" 
    });
  }
});

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
    if (err) {
      console.error(`❌ Erro durante login com Passport: ${err.message}`, err);
      return next(err);
    }    
    
    res.json({
      ...userSafe,
      sessionID: req.sessionID
    });
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
  const { name, gender, plan, birthdate, phone, region } = req.body;

  const updated = await prisma.user.update({ 
    where: { id }, 
    data: { 
      name, 
      gender, 
      plan, 
      birthdate, 
      phone, 
      region 
    } 
  });
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

router.post("/users/update-plan", async (req: any, res: any) => {
  const { userId, plan, tokenAmount } = req.body;

  if (!userId || !plan) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
        
    await prisma.$transaction(async (tx) => {
      if (currentUser.plan !== "pro") {
        await tx.user.update({
          where: { id: userId },
          data: { plan },
        });
      }

      if (tokenAmount) {
        const existing = await tx.userToken.findUnique({ where: { userId } });

        if (existing) {
          await tx.userToken.update({
            where: { userId },
            data: { total: existing.total + tokenAmount },
          });
        } else {
          await tx.userToken.create({
            data: {
              userId,
              total: tokenAmount,
              used: 0,
            },
          });
        }
      }
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { token: true },
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found after update" });
    }

    const { password, activationToken, resetToken, ...userSafe } = updatedUser;

    return res.status(200).json(userSafe);
  } catch (error) {
    console.error("❌ Erro ao atualizar plano manualmente:", error);
    return res.status(500).json({ error: "Failed to update plan" });
  }
});

router.post("/users/accept-terms", async (req: any, res: any) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { acceptedTerms: true },
    });

    const { password, activationToken, resetToken, ...userSafe } = updatedUser;
    return res.status(200).json(userSafe);
  } catch (error) {
    console.error("❌ Erro ao atualizar aceitação dos termos:", error);
    return res.status(500).json({ error: "Failed to update terms acceptance" });
  }
});

router.get('/users/:id/streak', async (req: any, res: any) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  return res.json({ streakCount: user.streakCount, streakLastDay: user.streakLastDay });
});

router.post('/users/:id/streak', async (req: any, res: any) => {
  const { id } = req.params;
  const today = new Date();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  let streakCount = user.streakCount || 1;
  let lastDay = user.streakLastDay ? new Date(user.streakLastDay) : null;
  const todayStr = today.toISOString().slice(0, 10);
  const lastDayStr = lastDay ? lastDay.toISOString().slice(0, 10) : null;

  if (lastDayStr !== todayStr) {
    if (lastDay && (today.getTime() - lastDay.getTime()) / 86400000 === 1) {
      streakCount += 1;
    } else if (lastDay && (today.getTime() - lastDay.getTime()) / 86400000 > 1) {
      streakCount = 1;
    }
    await prisma.user.update({
      where: { id },
      data: { streakCount, streakLastDay: today },
    });
  }

  return res.json({ streakCount, streakLastDay: today });
});

export default router;
