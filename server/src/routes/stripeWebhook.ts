import express, { Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import {stripe} from "../lib/stripe";

const router = express.Router();

// @ts-expect-error Express não aceita Promise<Response> diretamente, mas funciona
router.post("/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send("Missing signature or secret");
  }

  let event: any;

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
      const session = event.data.object;
    
      const userId = session.metadata?.userId;
      const tokenAmount = Number(session.metadata?.tokenAmount);
      if (!userId || !tokenAmount) {
        console.warn("⚠️ Metadata ausente na sessão:", session.metadata);
        break;
      }
    
      try {
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        
        if (!currentUser) {
          console.error("❌ Usuário não encontrado:", userId);
          break;
        }
                
        await prisma.$transaction(async (tx) => {
          const existing = await tx.userToken.findUnique({ where: { userId } });
    
          if (existing) {
            await tx.userToken.update({
              where: { userId },
              data: { total: existing.total + tokenAmount },
            });
          } else {
            await tx.userToken.create({
              data: {
                userId,
                total: tokenAmount,
                used: 0,
              },
            });
          }
    
          if (currentUser.plan !== "pro") {
            await tx.user.update({
              where: { id: userId },
              data: { plan: "pro" },
            });
          }
        });
  
      } catch (err) {
        console.error("❌ Erro ao processar webhook:", err);
        return res.status(500).send("Erro ao processar webhook.");
      }
      break;
    }

    default:
  }

  res.status(200).json({ received: true });
});

export default router;
