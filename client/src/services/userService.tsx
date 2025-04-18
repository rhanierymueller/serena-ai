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

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Erro ao fazer login');
  }

  return await res.json();
}
