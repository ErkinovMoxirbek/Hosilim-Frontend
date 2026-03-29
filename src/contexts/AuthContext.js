import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import {
  getAccessToken,
  getRefreshToken,
  clearAuth,
  setTokens,
  getUser,
  setUser,
} from "../utils/tokenManager";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser() || null);
  const [loading, setLoading] = useState(true);

  const boot = useCallback(async () => {
    const access = getAccessToken();
    const refresh = getRefreshToken();

    if (!access && !refresh) {
      setUserState(null);
      setLoading(false);
      return null;
    }

    setLoading(true);

    try {
      const meResp = await authService.me();
      const api = meResp?.data ?? meResp;
      const currentUser = api?.data ?? api;

      setUser(currentUser);
      setUserState(currentUser);
      return currentUser;
    } catch (e) {
      try {
        if (!refresh) throw e;

        const refResp = await authService.refresh(refresh);
        const api = refResp?.data ?? refResp;
        const tokens = api?.data ?? api;

        const newAccess = tokens?.accessToken;
        const newRefresh = tokens?.refreshToken;

        if (!newAccess || !newRefresh) throw e;

        setTokens(newAccess, newRefresh);

        const me2 = await authService.me();
        const api2 = me2?.data ?? me2;
        const currentUser2 = api2?.data ?? api2;

        setUser(currentUser2);
        setUserState(currentUser2);
        return currentUser2;
      } catch (e2) {
        clearAuth();
        setUserState(null);
        return null;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  const login = useCallback(async ({ email, password, role }) => {
    setLoading(true);
    try {
      const resp = await authService.login({ email, password, role });
      const api = resp?.data ?? resp;
      const payload = api?.data ?? api;

      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;
      const currentUser = payload?.user;

      if (!accessToken || !refreshToken || !currentUser) {
        console.log("LOGIN RAW:", resp);
        throw new Error(api?.message || "Login javobi noto‘g‘ri");
      }

      setTokens(accessToken, refreshToken);
      setUser(currentUser);
      setUserState(currentUser);

      return currentUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, boot }),
    [user, loading, login, logout, boot]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}