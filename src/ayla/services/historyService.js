// src/services/historyService.js
import api from "../../api/Axios";

const BASE = "/ayla";

const historyService = {

  /** Barcha reyslar ro'yxati (yangilikdan eskiga tartiblangan) */
  getAllSessions: async () => {
    const res = await api.get(`${BASE}/sessions`);
    const data = res.data?.data || res.data;
    return [...(data || [])].sort((a, b) =>
      (b.startedAt || "").localeCompare(a.startedAt || "")
    );
  },

  /** Reys to'liq xulosasi (moliyaviy, sotilgan, qaytarilgan) */
  getSessionSummary: async (sessionId) => {
    const res = await api.get(`${BASE}/sessions/${sessionId}/summary`);
    return res.data?.data || res.data;
  },

  /** Reysdagi barcha buyurtmalar (do'konlar bo'yicha) */
  getSessionOrders: async (sessionId) => {
    const res = await api.get(`${BASE}/sessions/${sessionId}/orders`);
    return res.data?.data || res.data;
  },
};

export default historyService;