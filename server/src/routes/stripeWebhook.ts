import express from "express";
import type Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import stripe from "../lib/stripe.js";

const router = express.Router();

// 🚨 Esse middleware precisa vir ANTES de app.use(express.json()) no seu app principal!
router.post("/webhook", express.raw({ type: "application/json" }), async (req: any, res: any) => {
  const sig = req.headers["stripe-signature"];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send("Missing signature or secret");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const tokenAmount = Number(session.metadata?.tokenAmount);

      if (!userId || !tokenAmount) {
        console.warn("⚠️ Metadata ausente na sessão:", session.metadata);
        break;
      }

      console.log("💳 Compra concluída - adicionando tokens:", {
        userId,
        tokenAmount,
      });

      try {
        // Verifica se o usuário já tem entrada de tokens
        const existing = await prisma.userToken.findUnique({
          where: { userId },
        });

        if (existing) {
          await prisma.userToken.update({
            where: { userId },
            data: { total: existing.total + tokenAmount },
          });
        } else {
          await prisma.userToken.create({
            data: {
              userId,
              total: tokenAmount,
              used: 0,
            },
          });
        }

        console.log("✅ Tokens adicionados com sucesso.");
      } catch (err) {
        console.error("❌ Erro ao adicionar tokens:", err);
      }

      break;
    }

    default:
      console.log(`ℹ️ Evento ignorado: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

export default router;
