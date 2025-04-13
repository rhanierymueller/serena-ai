const API_URL = 'http://localhost:4000/api/chats';

export async function createChat(userId: string) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) throw new Error('Erro ao criar chat');
  return response.json();
}

export async function getChats(userId: string) {
  const response = await fetch(`${API_URL}?userId=${userId}`);
  if (!response.ok) throw new Error('Erro ao buscar chats');
  return response.json();
}
