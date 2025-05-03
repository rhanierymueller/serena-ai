import { Router, Request, Response } from 'express';
import { callOpenRouter } from '../lib/openrouter.js';

const router = Router();

const prompt: Record<'pt' | 'en' | 'es', string> = {
  pt: 'Me dê uma frase curta, inspiradora e positiva para o dia. A frase deve ser única e diferente das anteriores. Sem emojis. Apenas a frase. Seja criativo e original.',
  en: 'Give me a short, inspiring and positive quote for the day. The quote must be unique and different from previous ones. No emojis. Just the quote. Be creative and original.',
  es: 'Dame una frase corta, inspiradora y positiva para el día. La frase debe ser única y diferente de las anteriores. Sin emojis. Solo la frase. Sé creativo y original.',
};

const supportedLanguages = ['pt', 'en', 'es'] as const;
type Language = typeof supportedLanguages[number];

router.post('/', async (req: any, res: any) => {
  let lang: Language = 'pt';
  if (supportedLanguages.includes(req.body.language)) {
    lang = req.body.language;
  }

  const randomNumber = Math.floor(Math.random() * 1000);
  const timestamp = new Date().getTime();
  const randomSeed = Math.random().toString(36).substring(7);
  const randomPrompt = `${prompt[lang]} (random: ${randomNumber}, timestamp: ${timestamp}, seed: ${randomSeed})`;

  const messages = [
    {
      role: 'system',
      content: 'Você é um gerador de frases motivacionais criativas e únicas. Cada resposta deve ser diferente e original. Não repita frases anteriores.',
    },
    {
      role: 'user',
      content: randomPrompt,
    },
  ];

  const reply = await callOpenRouter(messages, {
    temperature: 0.9,
    max_tokens: 100,
    top_p: 0.95,
  });

  res.json({ quote: reply.trim().replace(/^["']|["']$/g, '') });
});

export default router;
