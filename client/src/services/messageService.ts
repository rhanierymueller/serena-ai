import { BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api/messages`;

function validateChatId(chatId: string) {
  if (typeof chatId !== 'string' || chatId.trim().length === 0) {
    throw new Error('Chat ID inválido');
  }
}

function validateRole(role: string) {
  if (role !== 'user' && role !== 'assistant') {
    throw new Error('Role inválido');
  }
}

function validateContent(content: string) {
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Mensagem vazia');
  }
}

export async function sendMessage(chatId: string, role: 'user' | 'assistant', content: string) {
  validateChatId(chatId);
  validateRole(role);
  validateContent(content);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, role, content }),
    });

    if (!response.ok) throw new Error('Erro ao enviar mensagem');
    return await response.json();
  } catch (error) {
    throw new Error('Falha ao enviar mensagem');
  }
}

export async function getMessages(chatId: string) {
  validateChatId(chatId);

  try {
    const response = await fetch(`${API_URL}?chatId=${chatId}`);
    if (!response.ok) throw new Error('Erro ao buscar mensagens');
    return await response.json();
  } catch (error) {
    throw new Error('Falha ao buscar mensagens');
  }
}
