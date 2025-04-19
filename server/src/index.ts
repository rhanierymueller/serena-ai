import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import Redis from "ioredis";
// @ts-ignore
import connectRedis from "connect-redis/dist/index.js";

import './auth/google.js';

import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";

dotenv.config();

const app = express();

// 🌐 Domínios permitidos (CORS)
const allowedOrigins = [
  "http://localhost:5173",
  "https://serena-ai.vercel.app",
  "https://serena-7wvz3len9-rhaniery-muellers-projects.vercel.app",
];

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

// 🧠 Sessão com Redis se disponível (Railway)
let sessionOptions: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  },
};

if (process.env.REDIS_URL) {
  const RedisStore = connectRedis(session);
  const redisClient = new Redis(process.env.REDIS_URL);

  redisClient.on("error", (err) => console.error("❌ Redis error:", err));
  redisClient.on("connect", () => console.log("✅ Redis conectado"));

  sessionOptions.store = new RedisStore({ client: redisClient });
}

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());

// Rotas
app.use("/api", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/llm", llmRoutes);
app.use("/api", authRoutes);
app.use("/api/stripe", stripeRoutes);

// Ping
app.get("/", (_, res) => {
  res.send("Serena AI Backend rodando");
});

// 🔥 Railway define PORT automaticamente
const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Logs de erro globais
process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});
