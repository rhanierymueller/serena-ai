import express, { Request, Response } from "express";
import type Stripe from "stripe";
import { prisma } from "../lib/prisma.js";
import {stripe} from "../lib/stripe.js";

const router = express.Router();

// @ts-expect-error Express não aceita Promise<Response> diretamente, mas funciona
router.post("/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
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

      console.log("💳 Compra concluída - adicionando tokens:", { userId, tokenAmount });

      try {
        const existing = await prisma.userToken.findUnique({ where: { userId } });

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
        return res.status(500).send("Erro ao processar webhook.");
      }

      break;
    }

    default:
      console.log(`ℹ️ Evento ignorado: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

export default router;
