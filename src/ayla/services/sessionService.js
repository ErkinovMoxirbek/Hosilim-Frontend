// src/services/sessionService.js
import api from "../../api/Axios";

const BASE = "/ayla";

const sessionService = {

  // ─── Haydovchilar ────────────────────────────────────────────────────────
  getAllDrivers: async () => {
    const res = await api.get(`${BASE}/drivers`);
    return res.data?.data || res.data;
  },

  // ─── Reys ────────────────────────────────────────────────────────────────
  startSession: async (driverId) => {
    const res = await api.post(`${BASE}/sessions/start`, { driverId });
    return res.data?.data || res.data;
  },

  /** 404 qaytsa — faol reys yo'q (null qaytaradi) */
  getActiveSession: async (driverId) => {
    try {
      const res = await api.get(`${BASE}/sessions/active`, { params: { driverId } });
      return res.data?.data || res.data;
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  completeSession: async (sessionId) => {
    const res = await api.post(`${BASE}/sessions/${sessionId}/complete`);
    return res.data?.data || res.data;
  },

  // ─── Yuk ortish ──────────────────────────────────────────────────────────
  /** items: [{ productId, quantity }] */
  loadProducts: async (sessionId, items) => {
    const res = await api.post(`${BASE}/sessions/${sessionId}/loads`, { items });
    return res.data?.data || res.data;
  },

  getSessionLoads: async (sessionId) => {
    const res = await api.get(`${BASE}/sessions/${sessionId}/loads`);
    return res.data?.data || res.data;
  },

  // QO'SHILDI: Joriy mashina yuklash tarixini olish (Top 10)
  getSessionLoadHistory: async (sessionId) => {
    const res = await api.get(`${BASE}/sessions/${sessionId}/loads/history`);
    return res.data?.data || res.data;
  },

  // QO'SHILDI: Umumiy arxiv tarixi uchun (Paginatsiya va sana bilan)
  getGlobalLoadHistory: async (date, page = 0, size = 15) => {
    const params = { page, size };
    if (date) params.date = date; // Format: YYYY-MM-DD
    const res = await api.get(`${BASE}/load-history`, { params });
    // Boshqa apilardan farqli ravishda bu Spring Page obyekti qaytarishi mumkin
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  // ─── Buyurtma ─────────────────────────────────────────────────────────────
  createOrder: async (sessionId, payload) => {
    const res = await api.post(`${BASE}/sessions/${sessionId}/orders`, payload);
    return res.data?.data || res.data;
  },

  getSessionOrders: async (sessionId) => {
    const res = await api.get(`${BASE}/sessions/${sessionId}/orders`);
    return res.data?.data || res.data;
  },
};

export default sessionService;

/** Axios yoki backend xatosidan foydalanuvchiga ko'rsatiladigan matnni oladi */
export function extractSessionError(err) {
  return err?.response?.data?.message || err?.message || "Noma'lum xatolik";
}

/** Reys statusini o'zbekchaga o'giradi */
export function sessionStatusLabel(status) {
  return status === "STARTED" ? "Faol" : "Yakunlangan";
}

/** Vaqt satrini chiroyli formatga o'tkazadi: "2024-01-15T10:30:00" → "15.01.2024  10:30" */
export function fmtDateTime(raw) {
  if (!raw) return "—";
  try {
    const [date, time] = raw.replace("T", " ").substring(0, 16).split(" ");
    const [y, m, d] = date.split("-");
    return `${d}.${m}.${y}  ${time}`;
  } catch {
    return raw.substring(0, 16).replace("T", "  ");
  }
}

/** So'mni formatlaydi: 45000 → "45 000 so'm" */
export function fmtSom(v) {
  if (v == null) return "—";
  return new Intl.NumberFormat("uz-UZ").format(Math.round(v)) + " so'm";
}

/** O'lchov birligini qisqartiradi */
export function unitShort(unit) {
  return { LITR: "L", KG: "kg", DONA: "dona" }[unit] || unit;
}