import { BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/llm`;

function validateId(id: string) {
  if (typeof id === 'string' && id.trim().length > 0) {
    return id;
  }
  throw new Error('Chat ID inválido');
}

export async function generateReply(chatId: string) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: validateId(chatId) }),
    });

    if (!response.ok) throw new Error('Erro ao gerar resposta');
    return await response.json();
  } catch (error) {
    throw new Error('Falha na geração de resposta');
  }
}
