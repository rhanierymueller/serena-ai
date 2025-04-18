// src/routes/stripeRoutes.ts
import express from "express";
import { prisma } from "../lib/prisma";
import stripe from "../lib/stripe";

const router = express.Router();

router.post("/create-subscription-checkout", async (req: any, res: any) => {
  const { priceId, userId, userEmail } = req.body;

  if (!priceId || !userId || !userEmail) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Cria cliente no Stripe
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { userId },
    });
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: customer.id,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customer.id,
      success_url: `${process.env.CLIENT_URL}/chat`,
      cancel_url: `${process.env.CLIENT_URL}/plans`,
      metadata: {
        userId,
        price: priceId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Stripe error" });
  }
});

export default router;
