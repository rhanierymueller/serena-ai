import express from "express";

const router = express.Router();

router.get("/public-config", (req, res) => {
  
  const priceUsd2k = parseFloat(process.env.PLAN_PRICE_USD_2K || "9.99");
  const priceUsd5k = parseFloat(process.env.PLAN_PRICE_USD_5K || "19.99");
  const priceUsd10k = parseFloat(process.env.PLAN_PRICE_USD_10K || "29.99");
  
  
  const priceBrl2k = parseFloat(process.env.PLAN_PRICE_BRL_2K || "49.9");
  const priceBrl5k = parseFloat(process.env.PLAN_PRICE_BRL_5K || "99.0");
  const priceBrl10k = parseFloat(process.env.PLAN_PRICE_BRL_10K || "149.9");
  
  
  const conversionRate = parseFloat(process.env.CURRENCY_CONVERSION_RATE || "6.0");

  const publicConfig = {
    stripePubKey: process.env.NEXT_PUBLIC_STRIPE_PUB_KEY,
    plans: [
      { tokens: 2000, priceUsd: priceUsd2k, priceBrl: priceBrl2k },
      { tokens: 5000, priceUsd: priceUsd5k, priceBrl: priceBrl5k },
      { tokens: 10000, priceUsd: priceUsd10k, priceBrl: priceBrl10k },
    ],
    currencyConversionRate: conversionRate,
    emailjs: {
      serviceId: process.env.EMAILJS_SERVICE_ID,
      templateId: process.env.EMAILJS_TEMPLATE_ID,
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
    },
  };

  res.json(publicConfig);
});

export default router;
