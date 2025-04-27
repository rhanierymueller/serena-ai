import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import Redis from "ioredis";
// @ts-ignore
import connectRedis from "connect-redis";
import { URL } from "url";

import './auth/google.js';

import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import tokenRoutes from "./routes/tokenRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import motivacionalRoutes from "./routes/motivacionalRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();

// 🚦 confiar no proxy (Railway/Vercel) para req.secure funcionar
app.set('trust proxy', 1);

// determina domínio do front para o cookie
if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL não configurado no ambiente!");
}
const clientHost = new URL(process.env.CLIENT_URL).hostname

// 🌐 Domínios permitidos para o frontend (local + produção)
const allowedOrigins = [
  "http://localhost:5173",
  "https://serena-ai.vercel.app",
  "https://serena-ai-rhaniery-muellers-projects.vercel.app/",
  "https://www.avylia.com",
];

// ✅ CORS configurado antes de tudo
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🌐 CORS bloqueado para origem: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
}));

app.use(express.json());

if (!process.env.SESSION_SECRET) {
  console.warn("🚨 Atenção: Usando fallback SECRET para sessões. Configure SESSION_SECRET no ambiente.");
}

// 🔐 Sessão com Redis se disponível
const sessionOptions: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    // em produção, o cookie só é enviado via HTTPS e em chamadas cross‑site
    secure: process.env.NODE_ENV === "production",
    // em produção, permite envio em requisições cross‑site (fetch/XHR)
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
    path: "/",
  },
  // se você usa Redis, continue incluindo o store aqui
  // store: new RedisStore({ client: redisClient }),
};


if (process.env.REDIS_URL) {
  const RedisStore = connectRedis(session);
  const redisClient = new Redis(process.env.REDIS_URL);

  redisClient.on("connect", () => console.log("✅ Redis conectado"));
  redisClient.on("error", (err) => console.error("❌ Redis error:", err));

  sessionOptions.store = new RedisStore({ client: redisClient });
}

app.use(session(sessionOptions));

// 🔐 Auth
app.use(passport.initialize());
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string | undefined, done) => {
  if (!id) return done(null, false);
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return done(null, false);
  const { password, activationToken, ...safe } = u;
  done(null, safe);
});

app.use(passport.session());

// 🧩 Rotas
app.use("/api", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/llm", llmRoutes);
app.use("/api", authRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/mood", moodRoutes);
app.use('/api/motivacional', motivacionalRoutes);
app.use('/api/contact', contactRoutes);

// 🩺 Health Check
app.get("/", (_, res) => {
  res.send("✅ Avylia AI Backend rodando");
});

// 🚀 Porta (Railway já injeta automaticamente)
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// 🚨 Captura de erros não tratados
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});