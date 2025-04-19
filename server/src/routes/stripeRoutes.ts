import express from "express";
import { prisma } from "../lib/prisma.js";
import stripe, { PRICE_MAP } from "../lib/stripe.js";

const router = express.Router();

router.post("/create-token-checkout", async (req: any, res: any) => {
  const { userId, userEmail, tokenAmount } = req.body;

  if (!userId || !userEmail || !tokenAmount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const priceId = PRICE_MAP[tokenAmount];
  if (!priceId) {
    return res.status(400).json({ error: "Invalid token amount" });
  }

  try {
    // 🔁 Reutiliza ou cria novo cliente Stripe
    let customerId: string;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.stripeCustomerId) {
      customerId = user.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id },
      });

      customerId = customer.id;
    }

    // 💳 Cria sessão de pagamento única
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer: customerId,
      success_url: `${process.env.CLIENT_URL}/chat`,
      cancel_url: `${process.env.CLIENT_URL}/planos`,
      metadata: {
        userId,
        tokenAmount: tokenAmount.toString(), // ← usado no webhook
      },
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Stripe error" });
  }
});

export default router;
