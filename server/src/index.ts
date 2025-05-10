import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import { URL } from "url";

import './auth/google.js';

import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import stripeWebhook from "./routes/stripeWebhook.js";
import tokenRoutes from "./routes/tokenRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import motivacionalRoutes from "./routes/motivacionalRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import thoughtReframeRoutes from "./routes/thoughtReframeRoutes.js";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);


if (!process.env.CLIENT_URL) {
  throw new Error("CLIENT_URL não configurado no ambiente!");
}

const clientHost = new URL(process.env.CLIENT_URL).hostname;


const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.2:5173",
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
    
    if (!origin) {
      return callback(null, true);
    }
  
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }
    
    
    if (origin.startsWith('http://192.168.')) {
      return callback(null, origin);
    }

    console.warn(`🌐 CORS bloqueado para origem: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Mobile-Device'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use("/api/stripe/webhook", stripeWebhook);

app.use(express.json());

app.use((req, res, next) => {
  
  const isMobileHeader = req.headers['x-mobile-device'] === 'true';
  
  
  const userAgent = req.headers['user-agent'] || '';
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  (req as any).isMobile = isMobileHeader || isMobileUserAgent;

  next();
});


const sessionOptions: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    
    secure: false,
    sameSite: "none",
    httpOnly: true,
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  },
};

if (process.env.COOKIE_DOMAIN) {
  sessionOptions.cookie!.domain = process.env.COOKIE_DOMAIN;
}

if (process.env.REDIS_URL) {
  const RedisStore = connectRedis(session);
  const redisClient = new Redis(process.env.REDIS_URL);

  redisClient.on("connect", () => console.log("✅ Redis conectado"));
  redisClient.on("error", (err) => console.error("❌ Redis error:", err));

  sessionOptions.store = new RedisStore({ client: redisClient });
}

app.use(session(sessionOptions));

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
app.use('/api/thought-reframe', thoughtReframeRoutes);


app.get("/", (_, res) => {
  res.send("✅ Avylia AI Backend rodando");
});


async function startServer() {
  try {
    await prisma.$connect();
    const PORT = Number(process.env.PORT) || 4000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
    process.exit(1); 
  }
}

startServer();


process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});
