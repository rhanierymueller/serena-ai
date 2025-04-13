const USER_KEY = "serena_user_profile";

export function saveUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}
