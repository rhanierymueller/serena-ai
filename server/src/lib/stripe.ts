import Stripe from "stripe";

// ✅ Verifica se as chaves obrigatórias estão no .env
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}

if (
  !process.env.STRIPE_PAYMENT_PRICE_ID_2K ||
  !process.env.STRIPE_PAYMENT_PRICE_ID_5K ||
  !process.env.STRIPE_PAYMENT_PRICE_ID_10K
) {
  throw new Error("Missing Stripe USD Price IDs in environment variables");
}

if (
  !process.env.STRIPE_PAYMENT_PRICE_ID_2K_BRL ||
  !process.env.STRIPE_PAYMENT_PRICE_ID_5K_BRL ||
  !process.env.STRIPE_PAYMENT_PRICE_ID_10K_BRL
) {
  console.warn("⚠️ BRL price IDs are missing. Defaulting to USD prices for all regions.");
}

// ✅ Inicializa o Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15", // use a versão estável suportada
});

// ✅ Mapeia preços por moeda
export const PRICE_MAP_USD: Record<number, string> = {
  2000: process.env.STRIPE_PAYMENT_PRICE_ID_2K!,
  5000: process.env.STRIPE_PAYMENT_PRICE_ID_5K!,
  10000: process.env.STRIPE_PAYMENT_PRICE_ID_10K!,
};

export const PRICE_MAP_BRL: Record<number, string> = {
  2000: process.env.STRIPE_PAYMENT_PRICE_ID_2K_BRL || process.env.STRIPE_PAYMENT_PRICE_ID_2K!,
  5000: process.env.STRIPE_PAYMENT_PRICE_ID_5K_BRL || process.env.STRIPE_PAYMENT_PRICE_ID_5K!,
  10000: process.env.STRIPE_PAYMENT_PRICE_ID_10K_BRL || process.env.STRIPE_PAYMENT_PRICE_ID_10K!,
};

// ✅ Função para retornar o preço correto com base na região
export const getPriceMap = (region: string) => {
  const isBRL = region?.toLowerCase().startsWith("br") || region === "pt";
  return isBRL ? PRICE_MAP_BRL : PRICE_MAP_USD;
};

// ✅ Mapeamento reverso: price_id → tokenAmount
export const PRICE_ID_TO_TOKENS: Record<string, number> = {
  ...Object.fromEntries(Object.entries(PRICE_MAP_USD).map(([tokens, id]) => [id, Number(tokens)])),
  ...Object.fromEntries(Object.entries(PRICE_MAP_BRL).map(([tokens, id]) => [id, Number(tokens)])),
};
