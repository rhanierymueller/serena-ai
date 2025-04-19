import { prisma } from './prisma.js';

const TOKEN_FACTOR = 2000; 

export async function canUseTokens(userId: string, openAITokens: number) {
  const tokenEntry = await prisma.userToken.findUnique({ where: { userId } });
  if (!tokenEntry) return false;

  const tokensToConsume = Math.ceil(openAITokens / TOKEN_FACTOR);
  return tokenEntry.total - tokenEntry.used >= tokensToConsume;
}

export async function consumeTokens(userId: string, openAITokens: number) {
  const tokenEntry = await prisma.userToken.findUnique({ where: { userId } });
  if (!tokenEntry) throw new Error('Usuário não possui tokens');

  const tokensToConsume = Math.ceil(openAITokens / TOKEN_FACTOR);

  if (tokenEntry.used + tokensToConsume > tokenEntry.total) {
    throw new Error('Limite de tokens atingido');
  }

  await prisma.userToken.update({
    where: { userId },
    data: { used: tokenEntry.used + tokensToConsume },
  });
}
