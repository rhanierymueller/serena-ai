const API_URL = 'http://localhost:4000/api/messages';

export async function sendMessage(chatId: string, role: 'user' | 'assistant', content: string) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, role, content }),
  });

  if (!response.ok) throw new Error('Erro ao enviar mensagem');
  return response.json();
}

export async function getMessages(chatId: string) {
  const response = await fetch(`${API_URL}?chatId=${chatId}`);
  if (!response.ok) throw new Error('Erro ao buscar mensagens');
  return response.json();
}
