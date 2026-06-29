// src/services/statsService.js
import api from "../../api/Axios";

const BASE = "/ayla/stats";

const statsService = {
  getOverview:        (from, to) => api.get(`${BASE}/overview`,           { params: { from, to } }).then(r => r.data?.data || r.data),
  getTrend:           (from, to) => api.get(`${BASE}/trend`,              { params: { from, to } }).then(r => r.data?.data || r.data),
  getProductAnalysis: (from, to) => api.get(`${BASE}/products/analysis`,  { params: { from, to } }).then(r => r.data?.data || r.data),
  getTopProducts:     (from, to) => api.get(`${BASE}/products`,           { params: { from, to, limit: 8 } }).then(r => r.data?.data || r.data),
  getTopShops:        (from, to) => api.get(`${BASE}/shops`,              { params: { from, to, limit: 8 } }).then(r => r.data?.data || r.data),
  getDriverStats:     (from, to) => api.get(`${BASE}/drivers`,            { params: { from, to } }).then(r => r.data?.data || r.data),

  /** Hammasi parallel — bitta chaqiruvda */
  getAll: (from, to) => Promise.all([
    statsService.getOverview(from, to),
    statsService.getTrend(from, to),
    statsService.getProductAnalysis(from, to),
    statsService.getTopProducts(from, to),
    statsService.getTopShops(from, to),
    statsService.getDriverStats(from, to),
  ]).then(([overview, trend, analysis, products, shops, drivers]) =>
    ({ overview, trend, analysis, products, shops, drivers })
  ),
};

export default statsService;

// ─── Sana yordamchilari ───────────────────────────────────────────────────────
export const DATE_RANGES = [
  { label: "Bugun",     getRange: () => { const t = today(); return { from: t, to: t }; } },
  { label: "Bu hafta",  getRange: () => { const t = new Date(); const d = new Date(t); d.setDate(t.getDate() - t.getDay() + 1); return { from: fmt(d), to: today() }; } },
  { label: "Bu oy",     getRange: () => { const t = new Date(); return { from: `${t.getFullYear()}-${p2(t.getMonth()+1)}-01`, to: today() }; } },
  { label: "O'tgan oy", getRange: () => { const t = new Date(); t.setDate(1); t.setMonth(t.getMonth()-1); const e = new Date(t.getFullYear(), t.getMonth()+1, 0); return { from: fmt(t), to: fmt(e) }; } },
  { label: "3 oy",      getRange: () => { const t = new Date(); t.setMonth(t.getMonth()-3); return { from: fmt(t), to: today() }; } },
];

const today = () => fmt(new Date());
const fmt = d => `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`;
const p2 = n => String(n).padStart(2, "0");

// ─── Format yordamchilari ─────────────────────────────────────────────────────
export function fmtSom(v) {
  if (v == null) return "—";
  const n = Math.round(Number(v));
  if (n >= 1_000_000_000) return `${(n/1e9).toFixed(1)} mlrd`;
  if (n >= 1_000_000)     return `${(n/1e6).toFixed(1)} mln`;
  if (n >= 1_000)         return `${(n/1e3).toFixed(0)} ming`;
  return `${n}`;
}

export function fmtSomFull(v) {
  if (v == null) return "—";
  return new Intl.NumberFormat("uz-UZ").format(Math.round(Number(v))) + " so'm";
}

export function fmtQty(qty, unit) {
  const n = Number(qty);
  const s = n === Math.trunc(n) ? Math.trunc(n) : n.toFixed(1);
  return `${s} ${{ LITR: "L", KG: "kg", DONA: "dona" }[unit] || unit}`;
}

export function fmtDateShort(dateStr) {
  if (!dateStr) return "";
  const [, m, d] = dateStr.split("-");
  return `${d}.${m}`;
}