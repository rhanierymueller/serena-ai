const API_URL = "http://localhost:4000/api/llm";

export async function generateReply(chatId: string) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId }),
  });

  if (!response.ok) throw new Error("Erro ao gerar resposta");
  return response.json();
}
