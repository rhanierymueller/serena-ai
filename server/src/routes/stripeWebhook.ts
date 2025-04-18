// src/routes/stripeWebhook.ts

import express from "express";
import type Stripe from "stripe";
import { prisma } from "../lib/prisma"; // 👈 precisa importar o Prisma client
import stripe from "../lib/stripe";

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

  // 🔁 Eventos tratados
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription?.toString();

      if (!userId) {
        console.warn("⚠️ userId não encontrado na metadata do checkout");
        break;
      }
  
      console.log("✅ Assinatura criada com sucesso:", {
        userId,
        subscriptionId,
      });

      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: "pro",
          },
        });
      } catch (err) {
        console.error("Erro ao atualizar plano do usuário:", err);
      }

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      console.log("🚫 Assinatura cancelada:", customerId);

      try {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "free",
          },
        });
      } catch (err) {
        console.error("Erro ao rebaixar plano do usuário:", err);
      }

      break;
    }

    default:
      console.log(`ℹ️ Evento não tratado: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

export default router;
