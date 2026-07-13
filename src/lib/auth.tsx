import { useEffect, useState, ReactNode } from 'react';
import { Redirect } from 'wouter';
import { login as apiLogin, signup as apiSignup, type AuthUser, type LoginResponse } from '@/lib/api';

// Auth is client-side: the backend mints a JWT and we store it. The backend
// does not yet enforce the JWT on routes (see DEPLOY plan Phase C-13), so this
// gates the UI only until the backend Depends guard ships. Token kept in
// localStorage so it survives reloads.

const TOKEN_KEY = 'nowhere.token';
const USER_KEY = 'nowhere.user';

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch { return null; }
}
export function clearAuth() {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
}
function setAuth(res: LoginResponse) {
  try {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user ?? {}));
  } catch { /* ignore */ }
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const res = await apiLogin({ email, password });
  setAuth(res);
  return res.user ?? {};
}
export async function signUp(email: string, password: string, name?: string): Promise<AuthUser> {
  const res = await apiSignup({ email, password, name });
  setAuth(res);
  return res.user ?? {};
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getUser);
  const [token, setToken] = useState<string | null>(getToken);

  useEffect(() => {
    const onStorage = () => {
      setUser(getUser());
      setToken(getToken());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const refresh = () => {
    setUser(getUser());
    setToken(getToken());
  };

  const signOut = () => {
    clearAuth();
    refresh();
  };

  return { user, token, isAuthed: Boolean(token), signOut, refresh };
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Redirect to="/login" />;
  return <>{children}</>;
}