import React from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import statsService, {
  DATE_RANGES, fmtSom, fmtSomFull, fmtQty, fmtDateShort,
} from "../services/statsService";
import SidebarMenuButton from "../components/SidebarMenuButton";
import "../styles/ios-theme.css";

// ─── Ranglar ──────────────────────────────────────────────────────────────────
const C = {
  blue:   "#3a6df0",
  green:  "#00b894",
  red:    "#e17055",
  yellow: "#fdcb6e",
  purple: "#6c5ce7",
  mint:   "#00cec9",
};

// ─── Umumiy shisha karta ──────────────────────────────────────────────────────
function GlassCard({ children, style }) {
  return (
    <div style={{
      borderRadius: "var(--r-xl)",
      background: "var(--glass-fill)",
      border: "1px solid var(--glass-border)",
      backdropFilter: "blur(var(--blur-glass)) saturate(1.4)",
      WebkitBackdropFilter: "blur(var(--blur-glass)) saturate(1.4)",
      boxShadow: "var(--shadow-float)",
      padding: 18,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Sarlavha ─────────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 12, fontWeight: 800, letterSpacing: "0.06em",
      textTransform: "uppercase", color: "var(--ayla-text-2)",
      margin: "0 0 12px",
    }}>
      {children}
    </p>
  );
}

// ─── KPI karta ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color }) {
  return (
    <GlassCard style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{
        width: 10, height: 10, borderRadius: 3,
        background: color, flexShrink: 0,
      }} />
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "var(--ayla-text-1)", lineHeight: 1 }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11.5, color: "var(--ayla-text-2)", marginTop: 3, fontWeight: 500 }}>
            {sub}
          </div>
        )}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ayla-text-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
    </GlassCard>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.96)",
      border: "1px solid var(--glass-outline)",
      borderRadius: 12,
      padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      fontSize: 12,
      fontWeight: 600,
    }}>
      <div style={{ color: "var(--ayla-text-2)", marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {fmtSomFull(p.value)}
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.96)",
      border: "1px solid var(--glass-outline)",
      borderRadius: 12,
      padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      fontSize: 12,
      fontWeight: 600,
    }}>
      <div style={{ color: "var(--ayla-text-1)", marginBottom: 6, fontWeight: 700 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.fill || p.color, marginBottom: 2 }}>
          {p.name}: {fmtQty(p.value, "")}
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ h = 200 }) {
  return <div className="ayla-skeleton" style={{ height: h, borderRadius: "var(--r-xl)" }} />;
}

// ─── Asosiy sahifa ────────────────────────────────────────────────────────────
export default function StatsPage() {
  // Sana oralig'i
  const [activeRange, setActiveRange] = React.useState(2); // "Bu oy" default
  const [customFrom, setCustomFrom]   = React.useState("");
  const [customTo,   setCustomTo]     = React.useState("");
  const [showCustom, setShowCustom]   = React.useState(false);

  // Ma'lumotlar
  const [data,    setData]    = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error,   setError]   = React.useState("");

  // Joriy sana oralig'ini hisoblash
  const range = React.useMemo(() => {
    if (showCustom && customFrom && customTo) return { from: customFrom, to: customTo };
    return DATE_RANGES[activeRange]?.getRange() || DATE_RANGES[2].getRange();
  }, [activeRange, showCustom, customFrom, customTo]);

  // Ma'lumotlarni yuklash
  const load = React.useCallback(() => {
    setLoading(true);
    setError("");
    statsService.getAll(range.from, range.to)
      .then(setData)
      .catch(e => setError(e?.response?.data?.message || "Yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [range]);

  React.useEffect(() => { load(); }, [load]);

  const { overview, trend, analysis, products, shops, drivers } = data || {};

  // To'lov darajasi
  const payRate = overview
    ? Math.round((Number(overview.totalRevenue) / Math.max(Number(overview.totalOrderAmount), 1)) * 100)
    : 0;

  // Grafik uchun trend ma'lumotlar
  const trendData = (trend || []).map(d => ({
    date: fmtDateShort(d.date),
    "Daromad": Number(d.revenue),
    "Buyurtma": Number(d.orderAmount),
  }));

  // Mahsulot tahlili grafik uchun (top 6)
  const analysisData = (analysis || []).slice(0, 6).map(a => ({
    name: a.productName.length > 14 ? a.productName.slice(0, 13) + "…" : a.productName,
    "Chiqim":   Number(a.loadedQty),
    "Sotilgan": Number(a.soldQty),
    "Qaytarish":Number(a.returnedQty),
    unit: a.unit,
  }));

  // Top mahsulotlar max daromad
  const maxRev = Math.max(...(products || []).map(p => Number(p.totalRevenue)), 1);

  return (
    <div className="ayla-app">
      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <header className="ayla-topbar">
        <div className="ayla-topbar__row">
          <div className="ayla-topbar__heading">
            <SidebarMenuButton />
            <div>
              <h1 className="ayla-topbar__title">Statistika</h1>
              <p className="ayla-topbar__subtitle">{range.from} — {range.to}</p>
            </div>
          </div>
          <button
            onClick={load}
            style={{
              border: "1px solid var(--glass-outline)", background: "var(--glass-fill)",
              borderRadius: "var(--r-md)", width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--ayla-text-2)",
            }}
          >
            ↻
          </button>
        </div>

        {/* Sana oralig'i tugmalari */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 10, paddingBottom: 2 }}>
          {DATE_RANGES.map((r, i) => (
            <button
              key={i}
              onClick={() => { setActiveRange(i); setShowCustom(false); }}
              style={{
                flexShrink: 0,
                padding: "7px 14px",
                borderRadius: "var(--r-pill)",
                border: "1px solid " + (activeRange === i && !showCustom ? "var(--ayla-accent)" : "var(--glass-outline)"),
                background: activeRange === i && !showCustom ? "var(--ayla-accent)" : "var(--glass-fill)",
                color: activeRange === i && !showCustom ? "#fff" : "var(--ayla-text-1)",
                fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            style={{
              flexShrink: 0,
              padding: "7px 14px",
              borderRadius: "var(--r-pill)",
              border: "1px solid " + (showCustom ? "var(--ayla-accent)" : "var(--glass-outline)"),
              background: showCustom ? "var(--ayla-accent)" : "var(--glass-fill)",
              color: showCustom ? "#fff" : "var(--ayla-text-1)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            📅 Tanlash
          </button>
        </div>

        {/* Custom sana kiritish */}
        {showCustom && (
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
            <input type="date" className="ayla-input" value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", fontSize: 13 }} />
            <span style={{ color: "var(--ayla-text-2)", fontWeight: 600 }}>—</span>
            <input type="date" className="ayla-input" value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", fontSize: 13 }} />
          </div>
        )}
      </header>

      <main className="ayla-content">
        {error && (
          <div className="ayla-error-banner">
            <span>{error}</span>
            <button onClick={load}>Qayta</button>
          </div>
        )}

        {/* ── KPI kartalar ─────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {loading ? (
            [0,1,2,3].map(i => <Skeleton key={i} h={110} />)
          ) : (
            <>
              <KpiCard label="Daromad"    value={fmtSom(overview?.totalRevenue)}    sub={fmtSomFull(overview?.totalRevenue)}    color={C.green}  />
              <KpiCard label="Jami qarz"  value={fmtSom(overview?.totalDebt)}       sub={fmtSomFull(overview?.totalDebt)}       color={Number(overview?.totalDebt) > 0 ? C.red : C.green} />
              <KpiCard label="Buyurtmalar" value={overview?.totalOrders || 0}        sub={`${overview?.totalSessions || 0} reys`} color={C.blue}   />
              <KpiCard label="Do'konlar"   value={overview?.totalActiveShops || 0}   sub="xaridorlar"                             color={C.purple} />
            </>
          )}
        </div>

        {/* To'lov darajasi progress */}
        {!loading && overview && (
          <GlassCard style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ayla-text-1)" }}>
                To'lov darajasi
              </span>
              <span style={{ fontSize: 14, fontWeight: 900, color: payRate >= 80 ? C.green : C.red }}>
                {payRate}%
              </span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: "rgba(231,113,85,0.18)", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${payRate}%`, borderRadius: 5,
                background: `linear-gradient(90deg, ${C.green}, ${C.mint})`,
                transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11.5, color: C.green, fontWeight: 600 }}>
                ✓ {fmtSom(overview.totalRevenue)} yig'ildi
              </span>
              <span style={{ fontSize: 11.5, color: C.red, fontWeight: 600 }}>
                ✗ {fmtSom(overview.totalDebt)} qarz
              </span>
            </div>
          </GlassCard>
        )}

        {/* ── Daromad trendi (Area chart) ──────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>📈 Daromad trendi</SectionLabel>
          {loading ? <Skeleton h={220} /> : (
            <GlassCard style={{ padding: "16px 8px 8px 8px" }}>
              {trendData.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--ayla-text-2)", padding: 40, fontSize: 13 }}>
                  Bu oraliqda ma'lumot yo'q
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.green}  stopOpacity={0.35} />
                        <stop offset="95%" stopColor={C.green}  stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gOrder" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.blue}  stopOpacity={0.25} />
                        <stop offset="95%" stopColor={C.blue}  stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                      tickFormatter={v => fmtSom(v)} width={52} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Area type="monotone" dataKey="Daromad"   stroke={C.green} strokeWidth={2.5} fill="url(#gRevenue)" dot={false} />
                    <Area type="monotone" dataKey="Buyurtma"  stroke={C.blue}  strokeWidth={1.5} fill="url(#gOrder)"   dot={false} strokeDasharray="4 3" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          )}
        </div>

        {/* ── Mahsulot tahlili (Grouped Bar) ──────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <SectionLabel>📦 Mahsulot tahlili — Chiqim / Sotilgan / Qaytarish</SectionLabel>
          {loading ? <Skeleton h={240} /> : (
            <GlassCard style={{ padding: "16px 8px 8px 8px" }}>
              {analysisData.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--ayla-text-2)", padding: 40, fontSize: 13 }}>
                  Bu oraliqda ma'lumot yo'q
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analysisData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<BarTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar dataKey="Chiqim"    fill={C.blue}   radius={[4,4,0,0]} maxBarSize={22} />
                    <Bar dataKey="Sotilgan"  fill={C.green}  radius={[4,4,0,0]} maxBarSize={22} />
                    <Bar dataKey="Qaytarish" fill={C.yellow} radius={[4,4,0,0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </GlassCard>
          )}
        </div>

        {/* ── Top mahsulotlar ──────────────────────────────────────────────── */}
        {!loading && products?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>🏆 Top mahsulotlar (daromad bo'yicha)</SectionLabel>
            <GlassCard style={{ padding: "6px 16px 10px" }}>
              {products.map((p, i) => {
                const pct = (Number(p.totalRevenue) / maxRev) * 100;
                const color = [C.blue,C.green,C.purple,C.red,C.mint,C.yellow,C.blue,C.green][i % 8];
                return (
                  <div key={p.productId} style={{ padding: "10px 0", borderBottom: i < products.length-1 ? "1px solid var(--divider)" : "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                          background: color + "20", color,
                          fontSize: 10, fontWeight: 800,
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                        }}>{i+1}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ayla-text-1)" }}>
                          {p.productName}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ayla-text-1)" }}>
                          {fmtSomFull(p.totalRevenue)}
                        </div>
                        <div style={{ fontSize: 10.5, color: "var(--ayla-text-2)" }}>
                          {fmtQty(p.totalQuantitySold, p.unit)} · {p.orderCount} marta
                        </div>
                      </div>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--divider)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, borderRadius: 3,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                      }} />
                    </div>
                  </div>
                );
              })}
            </GlassCard>
          </div>
        )}

        {/* ── Top do'konlar ────────────────────────────────────────────────── */}
        {!loading && shops?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>🏪 Top do'konlar</SectionLabel>
            <GlassCard style={{ padding: "6px 16px 10px" }}>
              {shops.map((s, i) => {
                const rate = Number(s.totalOrdered) > 0
                  ? Math.round((Number(s.totalPaid)/Number(s.totalOrdered))*100) : 100;
                const hasDebt = Number(s.totalDebt) > 0;
                return (
                  <div key={s.shopId} style={{
                    display: "grid", gridTemplateColumns: "22px 1fr auto",
                    gap: 10, padding: "11px 0", alignItems: "center",
                    borderBottom: i < shops.length-1 ? "1px solid var(--divider)" : "none",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: i < 3 ? C.blue : "var(--ayla-text-3)", textAlign: "center" }}>
                      {i+1}
                    </span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ayla-text-1)" }}>{s.shopName}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: 11, color: "var(--ayla-text-2)" }}>{s.orderCount} buyurtma</span>
                        <div style={{ height: 4, width: 50, borderRadius: 2, background: "var(--divider)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${rate}%`, borderRadius: 2, background: hasDebt ? C.yellow : C.green }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: hasDebt ? C.red : C.green }}>{rate}%</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ayla-text-1)" }}>{fmtSom(s.totalOrdered)}</div>
                      {hasDebt && <div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginTop: 1 }}>{fmtSom(s.totalDebt)} qarz</div>}
                    </div>
                  </div>
                );
              })}
            </GlassCard>
          </div>
        )}

        {/* ── Haydovchilar ─────────────────────────────────────────────────── */}
        {!loading && drivers?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <SectionLabel>🚚 Haydovchilar samaradorligi</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {drivers.map(d => (
                <GlassCard key={d.driverId} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--r-md)", flexShrink: 0,
                    background: `linear-gradient(150deg, ${C.purple}, #a29bfe)`,
                    color: "#fff", fontSize: 17, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(108,92,231,0.30)",
                  }}>
                    {d.driverName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ayla-text-1)" }}>{d.driverName}</div>
                    {d.vehicleNumber && (
                      <div style={{ fontSize: 11.5, color: "var(--ayla-text-2)", marginTop: 1 }}>🚗 {d.vehicleNumber}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: C.blue }}>{d.totalSessions}</div>
                      <div style={{ fontSize: 10, color: "var(--ayla-text-2)", fontWeight: 600 }}>reys</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: C.green }}>{fmtSom(d.totalRevenue)}</div>
                      <div style={{ fontSize: 10, color: "var(--ayla-text-2)", fontWeight: 600 }}>daromad</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: "var(--ayla-text-1)" }}>{d.shopsVisited}</div>
                      <div style={{ fontSize: 10, color: "var(--ayla-text-2)", fontWeight: 600 }}>do'kon</div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {!loading && !error && !overview && (
          <div className="ayla-empty">
            <p className="ayla-empty__title">Ma'lumot yo'q</p>
            <p className="ayla-empty__subtitle">Bu oraliqda buyurtmalar kiritilmagan</p>
          </div>
        )}
      </main>
    </div>
  );
}