import { getOrCreateVisitorId } from '../utils/visitor';

const API_URL = 'http://192.168.1.2:4000/api/chats';

//const API_URL = 'http://localhost:4000/api/chats';

export async function createChat(userId: string | null) {
  const visitorId = userId ? null : getOrCreateVisitorId();

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, visitorId }),
  });

  if (!response.ok) throw new Error('Erro ao criar chat');
  return response.json();
}

export async function getChats(userId: string | null) {
  const visitorId = userId ? null : getOrCreateVisitorId();
  const query = userId ? `userId=${userId}` : `visitorId=${visitorId}`;

  const response = await fetch(`${API_URL}?${query}`);
  if (!response.ok) throw new Error('Erro ao buscar chats');
  return response.json();
}

export const deleteChat = async (chatId: string, userId: string | null) => {
  const visitorId = userId ? null : getOrCreateVisitorId();
  const query = userId ? `userId=${userId}` : `visitorId=${visitorId}`;

  const res = await fetch(`${API_URL}/${chatId}?${query}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Erro ao deletar chat');
  return res.json();
};
