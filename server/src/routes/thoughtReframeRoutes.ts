import { Router } from 'express';
import { openai } from '../lib/openai.js';
import { callOpenRouter } from '../lib/openrouter.js';
import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

const router = Router();

function getUser(req: any) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return req.user;
  }
  return null;
}

router.post('/', async (req: any, res: any) => {
  try {
    const { thought, belief, lang = 'pt-BR' } = req.body;

    if (!thought) {
      return res.status(400).json({ error: 'Pensamento é obrigatório' });
    }

    if (containsSuicidalContent(thought)) {
      return res.status(400).json({ 
        error: 'Conteúdo sensível detectado', 
        isSuicidal: true,
        helpMessage: 'Procure ajuda 24h: CVV 188'
      });
    }

    const user = await getUser(req);
    const isPro = user?.plan === 'pro';

    const prompt = getPromptByLanguage(lang, thought);
    
    let reframe: string;
    
    if (isPro) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });
      
      reframe = completion.choices[0]?.message?.content?.trim() || '';
    } else {
      try {
        let rawReframe = await callOpenRouter([
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user }
        ], {
          max_tokens: 150,
          temperature: 0.7
        });
        
        reframe = rawReframe.replace(/^["'](.*)["']$/, '$1');
        
        reframe = reframe.replace(/"{2,}/g, '"');
        
        reframe = reframe.trim().replace(/^["']|["']$/g, '');
      } catch (error) {
        console.error('Erro ao chamar OpenRouter:', error);
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user }
          ],
          max_tokens: 150,
          temperature: 0.7,
        });
        
        reframe = completion.choices[0]?.message?.content?.trim() || '';
      }
    }

    if (user) {
      try {
        await prisma.$executeRaw`
          INSERT INTO "ThoughtReframe" (
            "id", "userId", "originalThought", "beliefStrength", 
            "reframedThought", "language", "createdAt"
          ) 
          VALUES (
            ${crypto.randomUUID()}, ${user.id}, ${thought}, ${belief || 50}, 
            ${reframe}, ${lang}, ${new Date()}
          )
        `;
      } catch (err) {
        console.error('Erro ao salvar pensamento:', err);
      }
    }

    return res.json({ reframe });
  } catch (error) {
    console.error('Erro ao processar reestruturação:', error);
    return res.status(500).json({ error: 'Erro ao processar reestruturação' });
  }
});

function containsSuicidalContent(text: string): boolean {
  const suicidalKeywords = [
    'suicídio', 'suicida', 'me matar', 'acabar com minha vida', 'não quero mais viver',
    'suicide', 'kill myself', 'end my life', 'don\'t want to live'
  ];
  
  const lowerText = text.toLowerCase();
  return suicidalKeywords.some(keyword => lowerText.includes(keyword));
}

function getPromptByLanguage(lang: string, thought: string) {
  const prompts: Record<string, { system: string, user: string }> = {
    'pt-BR': {
      system: `Você é um terapeuta cognitivo-comportamental especializado em reestruturação cognitiva.
Sua tarefa é reestruturar o pensamento do usuário em no máximo 45 palavras,
de forma empática, realista e em 1ª pessoa.
Ofereça uma perspectiva alternativa que seja compassiva, baseada em evidências e que ajude a pessoa a ver a situação de forma mais equilibrada.
Não use frases como "Eu entendo que..." ou "É compreensível que...".
Vá direto ao ponto com a reestruturação.
IMPORTANTE: Não coloque aspas no início ou fim da sua resposta.`,
      user: `Meu pensamento: "${thought}"
Por favor, reestruture este pensamento de forma compassiva e realista.`
    },
    'en': {
      system: `You are a cognitive-behavioral therapist specialized in cognitive restructuring.
Your task is to reframe the user's thought in at most 45 words,
in an empathetic, realistic way and in 1st person.
Offer an alternative perspective that is compassionate, evidence-based, and helps the person see the situation in a more balanced way.
Don't use phrases like "I understand that..." or "It's understandable that...".
Go straight to the reframing.
IMPORTANT: Do not put quotation marks at the beginning or end of your response.`,
      user: `My thought: "${thought}"
Please reframe this thought in a compassionate and realistic way.`
    },
    'es': {
      system: `Eres un terapeuta cognitivo-conductual especializado en reestructuración cognitiva.
Tu tarea es reestructurar el pensamiento del usuario en máximo 45 palabras,
de forma empática, realista y en 1ª persona.
Ofrece una perspectiva alternativa que sea compasiva, basada en evidencias y que ayude a la persona a ver la situación de forma más equilibrada.
No uses frases como "Entiendo que..." o "Es comprensible que...".
Ve directo al punto con la reestructuración.
IMPORTANTE: No coloques comillas al inicio o al final de tu respuesta.`,
      user: `Mi pensamiento: "${thought}"
Por favor, reestructura este pensamiento de forma compasiva y realista.`
    }
  };

  return prompts[lang] || prompts['pt-BR'];
}

export default router;
