import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";

import './auth/google.js'; 

import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import llmRoutes from "./routes/llmRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";

dotenv.config();

const app = express();

// ✅ Lista de domínios permitidos
const allowedOrigins = [
  "http://localhost:5173",
  "https://serena-ai.vercel.app",
  "https://serena-7wvz3len9-rhaniery-muellers-projects.vercel.app", // preview
];

// ✅ Middleware de CORS flexível
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("CORS request from:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // 🔥 importante!
      sameSite: "none", // 🔥 obrigatório para funcionar com domínio cruzado
    }
  })  
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/llm", llmRoutes); 
app.use("/api", authRoutes);
app.use("/api/stripe", stripeRoutes);

// ✅ Removido o segundo `cors` duplicado
// ✅ Mantido apenas um middleware de CORS (acima)

// Teste de rota viva
app.get("/", (_, res) => {
  res.send("Serena AI Backend rodando");
});

const PORT = parseInt(process.env.PORT || '8000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server on http://localhost:${PORT}`);
});


process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});
