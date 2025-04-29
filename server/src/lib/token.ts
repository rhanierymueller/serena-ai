import { prisma } from "./prisma.js";

export const TOKEN_FACTOR = 2000;

export async function getOrCreateUserToken(userId: string, quota = 100_000) {
  const found = await prisma.userToken.findUnique({ where: { userId } });
  if (found) return found;
  return prisma.userToken.create({ data: { userId, total: quota } });
}

export async function remainingOpenAITokens(userId: string) {
  const row = await getOrCreateUserToken(userId);
  const internosRestantes = row.total - row.used;
  return internosRestantes * TOKEN_FACTOR; 
}

export async function canUseTokens(userId: string, openAITokens: number) {
  const tokenEntry = await prisma.userToken.findUnique({ where: { userId } });
  if (!tokenEntry) return false;

  const tokensToConsume = Math.max(1, Math.ceil(openAITokens / TOKEN_FACTOR));
  return tokenEntry.total - tokenEntry.used >= tokensToConsume;
}

export async function consumeTokens(userId: string, openAITokens: number) {
  const tokenEntry = await prisma.userToken.findUnique({ where: { userId } });
  if (!tokenEntry) throw new Error('Usuário não possui tokens');

  const tokensToConsume = Math.max(1, Math.ceil(openAITokens / TOKEN_FACTOR));

  if (tokenEntry.used + tokensToConsume > tokenEntry.total) {
    throw new Error('Limite de tokens atingido');
  }

  await prisma.userToken.update({
    where: { userId },
    data: { used: tokenEntry.used + tokensToConsume },
  });
}
