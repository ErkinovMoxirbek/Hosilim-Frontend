import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import { authService } from "../services/authService";
import {
  getAccessToken,
  clearAuth,
  setTokens,
  getUser,
  setUser,
} from "../utils/tokenManager";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser() || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const access = getAccessToken();
      if (!access) {
        setLoading(false);
        return;
      }

      try {
        const user = await authService.me();

        if (!cancelled) {
          setUser(user);        // localStorage
          setUserState(user);   // react state
        }
      } catch (e) {
        clearAuth();
        if (!cancelled) setUserState(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {

    const res = await authService.login({ email, password });
    setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
    setUserState(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
  return ctx;
}
