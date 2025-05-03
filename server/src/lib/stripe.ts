import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}
if (!process.env.STRIPE_SUBSCRIPTION_PRICE_ID_2K ||
    !process.env.STRIPE_SUBSCRIPTION_PRICE_ID_5K ||
    !process.env.STRIPE_SUBSCRIPTION_PRICE_ID_10K) {
  throw new Error("Missing Stripe Price IDs in environment variables");
}

// Verificar preços em BRL
if (!process.env.STRIPE_SUBSCRIPTION_PRICE_ID_2K_BRL ||
    !process.env.STRIPE_SUBSCRIPTION_PRICE_ID_5K_BRL ||
    !process.env.STRIPE_SUBSCRIPTION_PRICE_ID_10K_BRL) {
  console.warn("Missing Stripe BRL Price IDs in environment variables. Using USD prices for all regions.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-03-31.basil",
});


// Preços em USD (padrão)
export const PRICE_MAP_USD: Record<number, string> = {
  2000: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_2K,
  5000: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_5K,
  10000: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_10K,
};

// Preços em BRL (para Brasil)
export const PRICE_MAP_BRL: Record<number, string> = {
  2000: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_2K_BRL || process.env.STRIPE_SUBSCRIPTION_PRICE_ID_2K,
  5000: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_5K_BRL || process.env.STRIPE_SUBSCRIPTION_PRICE_ID_5K,
  10000: process.env.STRIPE_SUBSCRIPTION_PRICE_ID_10K_BRL || process.env.STRIPE_SUBSCRIPTION_PRICE_ID_10K,
};

// Função para obter o mapa de preços com base na região
export function getPriceMap(region: string): Record<number, string> {
  return region === 'brasil' ? PRICE_MAP_BRL : PRICE_MAP_USD;
}

// Mapa de preços padrão (para compatibilidade)
export const PRICE_MAP = PRICE_MAP_USD;


// Mapeamento de IDs de preço para tokens
export const PRICE_ID_TO_TOKENS: Record<string, number> = {
  ...Object.fromEntries(Object.entries(PRICE_MAP_USD).map(([tokens, priceId]) => [priceId, Number(tokens)])),
  ...Object.fromEntries(Object.entries(PRICE_MAP_BRL).map(([tokens, priceId]) => [priceId, Number(tokens)]))
};
