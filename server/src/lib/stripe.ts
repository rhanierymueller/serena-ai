import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export default stripe;

// 💳 Mapeamento de preços e tokens (recorrente)
export const PRICE_MAP: Record<number, string> = {
  2000: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_2K!,
  5000: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_5K!,
  10000: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_10K!,
};

// 🔁 Inverso: priceId => tokens
export const PRICE_ID_TO_TOKENS: Record<string, number> = Object.fromEntries(
  Object.entries(PRICE_MAP).map(([tokens, priceId]) => [priceId, Number(tokens)])
);
