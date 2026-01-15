// src/utils/tokenManager.js

// Primary keys (tavsiya)
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user";

// Legacy keys (sizda eski kodlarda uchrashi mumkin)
const LEGACY_AUTH_TOKEN = "authToken";
const LEGACY_ACCESS_TOKEN = "accessToken";

function safeSet(key, val) {
  if (typeof window === "undefined") return;
  try {
    if (val === undefined || val === null || String(val).trim() === "") {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(val));
    }
  } catch {
    // ignore
  }
}

function safeGet(key) {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

export function setTokens(accessToken, refreshToken) {
  const at = (accessToken || "").trim();
  const rt = (refreshToken || "").trim();

  // Primary
  safeSet(ACCESS_KEY, at);
  safeSet(REFRESH_KEY, rt);

  // Legacy (kompatibil)
  safeSet(LEGACY_AUTH_TOKEN, at);
  safeSet(LEGACY_ACCESS_TOKEN, at);
}

export function getAccessToken() {
  // Primary -> Legacy fallback
  return (
    safeGet(ACCESS_KEY) ||
    safeGet(LEGACY_AUTH_TOKEN) ||
    safeGet(LEGACY_ACCESS_TOKEN) ||
    safeGet("token") ||
    safeGet("jwt")
  ).trim();
}

export function getRefreshToken() {
  return safeGet(REFRESH_KEY).trim();
}

export function setUser(user) {
  if (typeof window === "undefined") return;
  try {
    if (!user) {
      localStorage.removeItem(USER_KEY);
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function getUser() {
  const raw = safeGet(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  safeSet(ACCESS_KEY, "");
  safeSet(REFRESH_KEY, "");
  safeSet(USER_KEY, "");

  // Legacy cleanup
  safeSet(LEGACY_AUTH_TOKEN, "");
  safeSet(LEGACY_ACCESS_TOKEN, "");
  safeSet("token", "");
  safeSet("jwt", "");
}
