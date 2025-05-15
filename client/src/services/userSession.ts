const USER_KEY = 'Avylia_user_profile';
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  acceptedTerms: boolean;
  plan?: 'free' | 'pro';
  sessionID?: string;
  isMobile?: boolean;
  [key: string]: any;
}

const SESSION_ID_KEY = 'Avylia_session_id';

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

const useLocalStorage = isLocalStorageAvailable();
const useSessionStorage = isSessionStorageAvailable();

let memoryStorage: UserProfile | null = null;

/**
 * Salva o usuário no armazenamento disponível
 * Tenta salvar em todos os armazenamentos disponíveis
 */
export function saveUser(user: UserProfile | null) {
  if (user) {
    memoryStorage = user;

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

    if (user.sessionID) {
      saveSessionID(user.sessionID);
    }
  } else {
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

    try {
      if (isLocalStorageAvailable()) {
        localStorage.removeItem(SESSION_ID_KEY);
      }
    } catch (e) {
      console.warn('Falha ao remover sessionID do localStorage:', e);
    }

    try {
      if (isSessionStorageAvailable()) {
        sessionStorage.removeItem(SESSION_ID_KEY);
      }
    } catch (e) {
      console.warn('Falha ao remover sessionID do sessionStorage:', e);
    }
  }
}

/**
 * Obtém o usuário do armazenamento disponível
 * Tenta obter de todos os armazenamentos disponíveis
 */
export function getUser(): UserProfile | null {
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

  return memoryStorage;
}

/**
 * Salva o sessionID para uso em dispositivos móveis
 * Mesmo em dispositivos móveis, tentamos salvar em localStorage/sessionStorage
 * como fallback, mas também mantemos em memória
 */
export function saveSessionID(sessionID: string | undefined) {
  if (!sessionID) return;

  if (memoryStorage) {
    memoryStorage.sessionID = sessionID;
  }

  try {
    if (isLocalStorageAvailable()) {
      localStorage.setItem(SESSION_ID_KEY, sessionID);
    }
  } catch (e) {
    console.warn('Falha ao salvar sessionID no localStorage:', e);
  }

  try {
    if (isSessionStorageAvailable()) {
      sessionStorage.setItem(SESSION_ID_KEY, sessionID);
    }
  } catch (e) {
    console.warn('Falha ao salvar sessionID no sessionStorage:', e);
  }
}

/**
 * Obtém o sessionID salvo
 * Tenta obter de todas as fontes disponíveis
 */
export function getSessionID(): string | null {
  if (memoryStorage?.sessionID) {
    return memoryStorage.sessionID;
  }

  try {
    if (isLocalStorageAvailable()) {
      const sessionID = localStorage.getItem(SESSION_ID_KEY);
      if (sessionID) {
        return sessionID;
      }
    }
  } catch (e) {
    console.warn('Erro ao obter sessionID do localStorage:', e);
  }

  try {
    if (isSessionStorageAvailable()) {
      const sessionID = sessionStorage.getItem(SESSION_ID_KEY);
      if (sessionID) {
        return sessionID;
      }
    }
  } catch (e) {
    console.warn('Erro ao obter sessionID do sessionStorage:', e);
  }

  return null;
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

  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(SESSION_ID_KEY);
    }
  } catch (e) {
    console.warn('Falha ao remover sessionID do localStorage:', e);
  }

  try {
    if (isSessionStorageAvailable()) {
      sessionStorage.removeItem(SESSION_ID_KEY);
    }
  } catch (e) {
    console.warn('Falha ao remover sessionID do sessionStorage:', e);
  }
}
