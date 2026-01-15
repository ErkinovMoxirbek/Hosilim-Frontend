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
      return;
    }

    setLoading(true);

    try {
      // 1) access token bilan /me
      const meResp = await authService.me();
      const mePayload = meResp?.data ?? meResp; // ApiResponse bo‘lsa data ichida bo‘ladi
      const currentUser = mePayload?.data ?? mePayload; // me() ham ApiResponse qaytarishi mumkin

      setUser(currentUser);
      setUserState(currentUser);
    } catch (e) {
      // 2) access ishlamasa refresh qilamiz
      try {
        if (!refresh) throw e;

        const refResp = await authService.refresh(refresh);
        const refPayload = refResp?.data ?? refResp;
        const tokens = refPayload?.data ?? refPayload;

        const newAccess = tokens?.accessToken;
        const newRefresh = tokens?.refreshToken;

        if (!newAccess || !newRefresh) throw e;

        setTokens(newAccess, newRefresh);

        const me2 = await authService.me();
        const me2Payload = me2?.data ?? me2;
        const currentUser2 = me2Payload?.data ?? me2Payload;

        setUser(currentUser2);
        setUserState(currentUser2);
      } catch (e2) {
        clearAuth();
        setUserState(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  const login = useCallback(async ({ email, password, role = "u" }) => {
    setLoading(true);
    try {
      const resp = await authService.login({ email, password, role });
      const api = resp?.data ?? resp;         // axios => res.data; yoki ApiResponse
      const payload = api?.data ?? api;       // ApiResponse.data ichidagi LoginResponse

      const accessToken = payload?.accessToken;
      const refreshToken = payload?.refreshToken;
      const currentUser = payload?.user;

      if (!accessToken || !refreshToken || !currentUser) {
        console.log("LOGIN RESPONSE (RAW):", resp);
        throw new Error(api?.message || "Login javobi noto‘g‘ri (token/user yo‘q)");
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used inside <AuthProvider>");
  return ctx;
}
