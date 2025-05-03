import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { stripe, PRICE_MAP, getPriceMap } from "../lib/stripe";
 

const router = express.Router();

router.post("/create-token-checkout", async (req: any, res: any) => {
  const { userId, userEmail, tokenAmount } = req.body;

  if (!userId || !userEmail || tokenAmount == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (typeof tokenAmount !== "number" || !PRICE_MAP[tokenAmount]) {
    return res.status(400).json({ error: "Invalid token amount" });
  }

  let customerId: string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const priceMap = getPriceMap(user.region || 'other');

  if (user.stripeCustomerId) {
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
    line_items: [{ price: priceMap[tokenAmount], quantity: 1 }],
    customer: customerId,
    success_url: `${process.env.CLIENT_URL}/chat?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/planos`,
    metadata: {
      userId,
      tokenAmount: tokenAmount.toString(),
      planType: "pro", 
      // @ts-ignore - A propriedade region existe no modelo User, mas o TypeScript não a reconhece
      region: user.region || 'other',
    },
  });

  res.json({ sessionId: session.id });
});

router.get("/session/:sessionId", async (req: any, res: any) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing session ID" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    const response = {
      id: session.id,
      userId: session.metadata?.userId,
      tokenAmount: session.metadata?.tokenAmount,
      planType: session.metadata?.planType,
      status: session.status,
    };
        
    return res.status(200).json(response);
  } catch (error) {
    console.error(`❌ Erro ao buscar sessão: ${sessionId}`, error);
    return res.status(500).json({ error: "Failed to retrieve session" });
  }
});

export default router;
