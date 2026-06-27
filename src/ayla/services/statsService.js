// src/services/statsService.js
import api from "../../api/Axios";

const BASE = "/ayla/stats";

const statsService = {

  /** Umumiy KPI ko'rsatkichlar */
  getOverview: async () => {
    const res = await api.get(`${BASE}/overview`);
    return res.data?.data || res.data;
  },

  /** Top mahsulotlar (daromad bo'yicha) */
  getTopProducts: async (limit = 10) => {
    const res = await api.get(`${BASE}/products`, { params: { limit } });
    return res.data?.data || res.data;
  },

  /** Top do'konlar (buyurtma hajmi bo'yicha) */
  getTopShops: async (limit = 10) => {
    const res = await api.get(`${BASE}/shops`, { params: { limit } });
    return res.data?.data || res.data;
  },

  /** Haydovchilar samaradorligi */
  getDriverStats: async () => {
    const res = await api.get(`${BASE}/drivers`);
    return res.data?.data || res.data;
  },

  /** Barcha to'rt endpointni parallel yuklash */
  getAll: async () => {
    const [overview, products, shops, drivers] = await Promise.all([
      statsService.getOverview(),
      statsService.getTopProducts(),
      statsService.getTopShops(),
      statsService.getDriverStats(),
    ]);
    return { overview, products, shops, drivers };
  },
};

export default statsService;

// ─── Yordamchi funksiyalar ────────────────────────────────────────────────────

export function fmtSom(v) {
  if (v == null) return "—";
  const n = Math.round(Number(v));
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} mlrd`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)} mln`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)} ming`;
  return `${n} so'm`;
}

export function fmtSomFull(v) {
  if (v == null) return "—";
  return new Intl.NumberFormat("uz-UZ").format(Math.round(Number(v))) + " so'm";
}

export function fmtQty(qty, unit) {
  const n = Number(qty);
  const display = n === Math.trunc(n) ? Math.trunc(n) : n.toFixed(1);
  const u = { LITR: "L", KG: "kg", DONA: "dona" }[unit] || unit;
  return `${display} ${u}`;
}