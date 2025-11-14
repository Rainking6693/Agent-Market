import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/lib/constants';

export interface StoredAuthUser {
  id: string;
  email: string;
  displayName: string;
}

export const persistAuth = (user: StoredAuthUser, token: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
};

export const getStoredAuth = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
  const userRaw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!token || !userRaw) {
    return null;
  }

  try {
    const user = JSON.parse(userRaw) as StoredAuthUser;
    return { token, user };
  } catch {
    clearStoredAuth();
    return null;
  }
};
