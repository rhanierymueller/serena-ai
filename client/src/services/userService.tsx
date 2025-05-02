import { BASE_URL } from '../config';
import { UserProfile } from './userSession';

export interface CreateUserInput {
  name: string;
  email: string;
  gender?: string;
  password?: string;
  birthDate?: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    // Adiciona cabeçalhos padrão para todas as requisições
    const defaultOptions: RequestInit = {
      credentials: 'include', // Sempre inclui cookies
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      ...options,
    };

    // Mescla os cabeçalhos personalizados com os padrão
    if (options?.headers) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        ...options.headers,
      };
    }

    const res = await fetch(url, defaultOptions);

    // Tenta obter o JSON, mas lida com respostas vazias
    let json;
    const text = await res.text();
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Erro ao parsear resposta JSON:', e);
      json = { error: 'Erro ao parsear resposta' };
    }

    if (!res.ok) {
      const error = new Error(json?.error || 'Erro de API') as Error & {
        errorCode?: string;
        status?: number;
      };
      error.errorCode = json?.errorCode;
      error.status = res.status;
      throw error;
    }

    return json as T;
  } catch (error) {
    // Adiciona mais informações ao erro para depuração
    console.error(`Erro na requisição para ${url}:`, error);
    throw error;
  }
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
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Verifica se o usuário está autenticado
 */
export async function checkAuth(): Promise<UserProfile | null> {
  try {
    return await fetchJson<UserProfile>(`${BASE_URL}/api/auth/me`);
  } catch (error) {
    console.warn('Usuário não autenticado:', error);
    return null;
  }
}

export function resendActivationEmail(email: string) {
  return fetchJson(`${BASE_URL}/api/resend-activation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}
