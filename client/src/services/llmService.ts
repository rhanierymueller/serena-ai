import { BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/llm`;

export async function generateReply(chatId: string) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId }),
  });

  if (!response.ok) throw new Error('Erro ao gerar resposta');
  return response.json();
}
