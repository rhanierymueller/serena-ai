const USER_KEY = 'Avylia_user_profile';
import { isMobileDevice } from '../utils/deviceDetection';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan?: 'free' | 'pro';
  [key: string]: any;
}

/**
 * Verifica se o localStorage está disponível e funcionando
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Verifica se o sessionStorage está disponível e funcionando
 */
function isSessionStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

// Determina qual armazenamento usar
const useLocalStorage = isLocalStorageAvailable() && !isMobileDevice();
const useSessionStorage = isSessionStorageAvailable() && !isMobileDevice();

// Variável para armazenamento em memória como último recurso
let memoryStorage: UserProfile | null = null;

/**
 * Salva o usuário no armazenamento disponível
 * Em dispositivos móveis, apenas armazena em memória
 */
export function saveUser(user: UserProfile | null) {
  if (user) {
    // Sempre armazena em memória
    memoryStorage = user;

    // Se não for dispositivo móvel, armazena no localStorage/sessionStorage
    if (!isMobileDevice()) {
      const userData = JSON.stringify(user);

      if (useLocalStorage) {
        try {
          localStorage.setItem(USER_KEY, userData);
        } catch (e) {
          console.warn('Falha ao salvar no localStorage:', e);
        }
      }

      if (useSessionStorage) {
        try {
          sessionStorage.setItem(USER_KEY, userData);
        } catch (e) {
          console.warn('Falha ao salvar no sessionStorage:', e);
        }
      }
    }
  } else {
    // Limpa o usuário
    memoryStorage = null;

    if (useLocalStorage) {
      try {
        localStorage.removeItem(USER_KEY);
      } catch (e) {
        console.warn('Falha ao remover do localStorage:', e);
      }
    }

    if (useSessionStorage) {
      try {
        sessionStorage.removeItem(USER_KEY);
      } catch (e) {
        console.warn('Falha ao remover do sessionStorage:', e);
      }
    }
  }
}

/**
 * Obtém o usuário do armazenamento disponível
 * Em dispositivos móveis, sempre retorna null para forçar a busca no banco de dados
 */
export function getUser(): UserProfile | null {
  // Em dispositivos móveis, retorna null para forçar a busca no banco de dados
  if (isMobileDevice()) {
    return null;
  }

  // Primeiro tenta localStorage
  if (useLocalStorage) {
    try {
      const user = localStorage.getItem(USER_KEY);
      if (user !== null) {
        return JSON.parse(user) as UserProfile;
      }
    } catch (error) {
      console.warn('Erro ao obter usuário do localStorage:', error);
    }
  }

  // Depois tenta sessionStorage
  if (useSessionStorage) {
    try {
      const user = sessionStorage.getItem(USER_KEY);
      if (user !== null) {
        return JSON.parse(user) as UserProfile;
      }
    } catch (error) {
      console.warn('Erro ao obter usuário do sessionStorage:', error);
    }
  }

  // Por último, usa o armazenamento em memória
  return memoryStorage;
}

/**
 * Limpa o usuário de todos os armazenamentos
 */
export function clearUser() {
  memoryStorage = null;

  if (useLocalStorage) {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Falha ao remover do localStorage:', e);
    }
  }

  if (useSessionStorage) {
    try {
      sessionStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Falha ao remover do sessionStorage:', e);
    }
  }
}
