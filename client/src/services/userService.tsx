import { BASE_URL } from '../config';

export interface CreateUserInput {
  name: string;
  email: string;
  gender?: string;
  password?: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const json = await res.json();

  if (!res.ok) {
    const error = new Error(json?.error || 'Erro de API') as Error & { errorCode?: string };
    error.errorCode = json?.errorCode;
    throw error;
  }

  return json;
}

export function createUser(data: CreateUserInput) {
  return fetchJson(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function loginUser({ email, password }: { email: string; password: string }) {
  return fetchJson(`${BASE_URL}/api/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function resendActivationEmail(email: string) {
  return fetchJson(`${BASE_URL}/api/resend-activation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}
