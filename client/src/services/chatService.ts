import { BASE_URL } from '../config';
import { getOrCreateVisitorId } from '../utils/visitor';

const API_URL = `${BASE_URL}/api/chats`;

function validateId(id: string | null) {
  if (id && typeof id === 'string' && id.trim().length > 0) {
    return id;
  }
  return null;
}

export async function createChat(userId: string | null) {
  const visitorId = userId ? null : getOrCreateVisitorId();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: validateId(userId), visitorId: validateId(visitorId) }),
    });

    if (!response.ok) throw new Error('Erro ao criar chat');
    return await response.json();
  } catch (error) {
    throw new Error('Falha na criação do chat');
  }
}

export async function getChats(userId: string | null) {
  const visitorId = userId ? null : getOrCreateVisitorId();
  const query = userId ? `userId=${validateId(userId)}` : `visitorId=${validateId(visitorId)}`;

  try {
    const response = await fetch(`${API_URL}?${query}`);
    if (!response.ok) throw new Error('Erro ao buscar chats');
    return await response.json();
  } catch (error) {
    throw new Error('Falha na busca de chats');
  }
}

export async function deleteChat(chatId: string, userId: string | null) {
  const visitorId = userId ? null : getOrCreateVisitorId();
  const query = userId ? `userId=${validateId(userId)}` : `visitorId=${validateId(visitorId)}`;

  try {
    const response = await fetch(`${API_URL}/${chatId}?${query}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Erro ao deletar chat');
    return await response.json();
  } catch (error) {
    throw new Error('Falha na exclusão do chat');
  }
}
