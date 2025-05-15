import { BASE_URL } from '../config';
import { UserProfile, getSessionID } from './userSession';

export interface CreateUserInput {
  name: string;
  email: string;
  gender?: string;
  password?: string;
  birthDate?: string;
  region?: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      ...options,
    };

    if (options?.headers) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        ...options.headers,
      };
    }

    const res = await fetch(url, defaultOptions);

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
 * Usa sessionID se disponível para melhorar a confiabilidade da autenticação
 */
export async function checkAuth(): Promise<UserProfile | null> {
  try {
    const sessionID = getSessionID();
    const response = sessionID
      ? await fetchJson<UserProfile | null>(`${BASE_URL}/api/auth/me?sessionID=${sessionID}`)
      : await fetchJson<UserProfile | null>(`${BASE_URL}/api/auth/me`);

    return response;
  } catch (error) {
    console.warn('Usuário não autenticado:', error);
    return null;
  }
}

/**
 * Busca o perfil do usuário diretamente do servidor
 * Usa sessionID se disponível para melhorar a confiabilidade da autenticação
 */
export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const sessionID = getSessionID();
    if (sessionID) {
      return await fetchJson<UserProfile>(`${BASE_URL}/api/auth/me?sessionID=${sessionID}`);
    }

    return await fetchJson<UserProfile>(`${BASE_URL}/api/auth/me`);
  } catch (error) {
    console.warn('Erro ao buscar perfil do usuário:', error);
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
