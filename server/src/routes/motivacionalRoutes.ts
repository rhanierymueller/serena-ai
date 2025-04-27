import { Router, Request, Response } from 'express';
import { wrapAsync } from '../../utils/wrapAsync';
import { callOpenRouter } from '../lib/openrouter.js';

const router = Router();

const prompt: Record<'pt' | 'en' | 'es', string> = {
  pt: 'Me dê uma frase curta, inspiradora e positiva para o dia. Sem emojis. Apenas a frase.',
  en: 'Give me a short, inspiring and positive quote for the day. No emojis. Just the quote.',
  es: 'Dame una frase corta, inspiradora y positiva para el día. Sin emojis. Solo la frase.',
};

const supportedLanguages = ['pt', 'en', 'es'] as const;
type Language = typeof supportedLanguages[number];

router.post('/', wrapAsync(async (req: Request, res: Response) => {
  let lang: Language = 'pt';
  if (supportedLanguages.includes(req.body.language)) {
    lang = req.body.language;
  }

  const messages = [
    {
      role: 'user',
      content: prompt[lang],
    },
  ];

  const reply = await callOpenRouter(messages);
  res.json({ quote: reply.trim().replace(/^["']|["']$/g, '') });
}));

export default router;
