// src/services/authService.js
import API_BASE_URL from "../config";
import { setTokens, getAccessToken, setUser, clearAuth } from "../utils/tokenManager";

async function readErrorText(res) {
  try {
    const t = await res.text();
    return t || res.statusText;
  } catch {
    return res.statusText || "Request failed";
  }
}

export const authService = {
  async sendOtp(phoneE164, signal) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneE164 }),
      signal,
    });

    if (!res.ok) throw new Error(await readErrorText(res));

    // backend json qaytarsa ham, qaytarmasa ham muammo yo‘q
    try {
      return await res.json();
    } catch {
      return {};
    }
  },

  async verifyOtp(phoneE164, otp, signal) {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phoneE164, otp }),
      signal,
    });

    if (!res.ok) throw new Error(await readErrorText(res));

    const data = await res.json().catch(() => ({}));

    const accessToken = (data?.data?.accessToken || data?.accessToken || "").trim();
    const refreshToken = (data?.data?.refreshToken || data?.refreshToken || "").trim();

    if (!accessToken) throw new Error("Access token kelmadi (backend response tekshiring)");

    setTokens(accessToken, refreshToken);
    return { raw: data, accessToken, refreshToken };
  },

  async me(signal) {
    const token = getAccessToken();
    if (!token) throw new Error("Token topilmadi");

    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });

    if (!res.ok) {
      // token invalid bo‘lsa, tozalab yuboramiz
      if (res.status === 401 || res.status === 403) clearAuth();
      const err = new Error(await readErrorText(res));
      err.status = res.status;
      throw err;
    }

    const me = await res.json().catch(() => ({}));

    // ixtiyoriy: userni saqlab qo‘yish
    if (me?.data) setUser(me.data);

    return me;
  },
};
