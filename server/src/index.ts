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
import configRoutes from "./routes/configRoutes.js";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);

// Verificação do CLIENT_URL
if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL não configurado no ambiente!");
}

const clientHost = new URL(process.env.CLIENT_URL).hostname;

// 🌐 CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://serena-ai.vercel.app",
  "https://serena-ai-rhaniery-muellers-projects.vercel.app",
  "https://www.avylia.com",
  "capacitor://localhost",
  "ionic://localhost",
  "http://localhost",
  "file://",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, false);
  
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin); // Retorna a origem, não true
    }
  
    console.warn(`🌐 CORS bloqueado para origem: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());

// 🔐 Sessão
const sessionOptions: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    httpOnly: true,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias em milissegundos
  },
};

if (process.env.REDIS_URL) {
  const RedisStore = connectRedis(session);
  const redisClient = new Redis(process.env.REDIS_URL);

  redisClient.on("connect", () => console.log("✅ Redis conectado"));
  redisClient.on("error", (err) => console.error("❌ Redis error:", err));

  sessionOptions.store = new RedisStore({ client: redisClient });
}

app.use(session(sessionOptions));

// 🔐 Passport
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
app.use('/api/config', configRoutes);

// 🩺 Health Check
app.get("/", (_, res) => {
  res.send("✅ Avylia AI Backend rodando");
});

// 🚀 Inicializar servidor com conexão garantida
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma conectado com sucesso');

    const PORT = Number(process.env.PORT) || 4000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
    process.exit(1); // encerra para Railway mostrar erro
  }
}

startServer();

// 🚨 Captura de erros não tratados
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});
