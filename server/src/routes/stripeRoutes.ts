import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { stripe, PRICE_MAP } from "../lib/stripe.js";
import { wrapAsync } from "../utils/wrapAsync.js"; // adiciona esse import se ainda não

const router = express.Router();

router.post("/create-token-checkout", wrapAsync(async (req: Request, res: Response) => {
  const { userId, userEmail, tokenAmount } = req.body;

  if (!userId || !userEmail || tokenAmount == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (typeof tokenAmount !== "number" || !PRICE_MAP[tokenAmount]) {
    return res.status(400).json({ error: "Invalid token amount" });
  }

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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: PRICE_MAP[tokenAmount], quantity: 1 }],
    customer: customerId,
    success_url: `${process.env.CLIENT_URL}/chat`,
    cancel_url: `${process.env.CLIENT_URL}/planos`,
    metadata: {
      userId,
      tokenAmount: tokenAmount.toString(),
    },
  });

  res.json({ sessionId: session.id });
}));

export default router;
