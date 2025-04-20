import { Router } from 'express';
import { callOpenRouter } from '../lib/openrouter.js';

const router = Router();

const prompt: Record<'pt' | 'en' | 'es', string> = {
  pt: 'Me dê uma frase curta, inspiradora e positiva para o dia. Sem emojis. Apenas a frase.',
  en: 'Give me a short, inspiring and positive quote for the day. No emojis. Just the quote.',
  es: 'Dame una frase corta, inspiradora y positiva para el día. Sin emojis. Solo la frase.',
};

const supportedLanguages = ['pt', 'en', 'es'] as const;
type Language = typeof supportedLanguages[number];

router.post('/', async (req, res) => {
  let lang: Language = 'pt';
  if (supportedLanguages.includes(req.body.language)) {
    lang = req.body.language;
  }

  const messages: { role: string; content: string }[] = [
    {
      role: 'user',
      content: prompt[lang],
    },
  ];

  try {
    const reply = await callOpenRouter(messages);
    res.json({ quote: reply.trim().replace(/^["']|["']$/g, '') });
  } catch (err) {
    console.error('Erro ao gerar frase:', err);
    res.status(500).json({ error: 'Erro ao gerar frase motivacional.' });
  }
});

export default router;
