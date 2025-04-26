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

  const json = await response.json();

  if (!response.ok) {
    const error = new Error(json.error) as Error & {
      errorCode?: string;
    };
    error.errorCode = json.errorCode;
    throw error;
  }

  return json;
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
    throw new Error(err?.error || 'Falha no login');
  }
  return res.json();
}
