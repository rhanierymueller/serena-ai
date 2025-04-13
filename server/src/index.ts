import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import llmRoutes from "./routes/llmRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/llm", llmRoutes); 

app.get("/", (_, res) => {
  res.send("Serena AI Backend rodando 🧠");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🔥 Server on http://localhost:${PORT}`);
});
