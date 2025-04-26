import { BASE_URL } from '../config';

export interface CreateUserInput {
  name: string;
  email: string;
  gender?: string;
  password?: string;
}

export async function createUser(data: CreateUserInput) {
  const response = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || 'Erro ao criar usuário');
  }

  return await response.json();
}

export async function loginUser({ email, password }: { email: string; password: string }) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Falha no login');
  }
  return res.json();
}
