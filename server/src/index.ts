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

dotenv.config();

const app = express();

// 🚦 confiar no proxy (Railway/Vercel) para req.secure funcionar
app.set('trust proxy', 1);

// determina domínio do front para o cookie
const clientHost = new URL(process.env.CLIENT_URL!).hostname; // ex: "serena-ai.vercel.app"

// 🌐 Domínios permitidos para o frontend (local + produção)
const allowedOrigins = [
  "http://localhost:5173",
  "https://serena-ai.vercel.app",
  "https://serena-7wvz3len9-rhaniery-muellers-projects.vercel.app",
];

// ✅ CORS configurado antes de tudo
app.use(cors({
  origin: (origin, callback) => {
    console.log("🌐 CORS request from:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// 🔐 Sessão com Redis se disponível
const sessionOptions: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // só envia cookie se for HTTPS
    sameSite: "none",                            // cookie válido em serena-ai.vercel.app
    path: "/",
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

// 🔐 Auth
app.use(passport.initialize());
app.use(passport.session());

// 🧩 Rotas
app.use("/api", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/llm", llmRoutes);
app.use("/api", authRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/tokens", tokenRoutes);

// 🩺 Health Check
app.get("/", (_, res) => {
  res.send("✅ Serena AI Backend rodando");
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