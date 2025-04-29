const USER_KEY = 'Avylia_user_profile';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan?: 'free' | 'pro';
  [key: string]: any;
}

export function saveUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getUser(): UserProfile | null {
  const user = localStorage.getItem(USER_KEY);
  if (user !== null) {
    try {
      return JSON.parse(user) as UserProfile;
    } catch (error) {
      console.error('Erro ao parsear usuário do localStorage:', error);
      return null;
    }
  }
  return null;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}
