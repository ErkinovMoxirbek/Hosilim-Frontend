// src/pages/StatsPage.jsx
import React from "react";
import statsService, { fmtSom, fmtSomFull, fmtQty } from "../services/statsService";
import SidebarMenuButton from "../components/SidebarMenuButton";
import Toast, { useToast } from "../components/Toast";
import "../styles/ios-theme.css";

// ─── Ikonkalar ────────────────────────────────────────────────────────────────
const Icon = {
  Revenue: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Debt: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Orders: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Shop: () => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path d="M23 4v6h-6M1 20v-6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
};

// ─── KPI karta ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, accent, bg }) {
  return (
    <div
      style={{
        borderRadius: "var(--r-xl)",
        background: bg || "var(--glass-fill)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(var(--blur-glass)) saturate(1.4)",
        WebkitBackdropFilter: "blur(var(--blur-glass)) saturate(1.4)",
        boxShadow: "var(--shadow-float)",
        padding: "20px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "var(--r-md)",
          background: accent + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ayla-text-1)", lineHeight: 1.1 }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11.5, color: "var(--ayla-text-2)", marginTop: 2, fontWeight: 500 }}>
            {sub}
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ayla-text-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Mahsulot progress satri ─────────────────────────────────────────────────
function ProductBar({ product, maxRevenue, index }) {
  const pct = maxRevenue > 0 ? (Number(product.totalRevenue) / maxRevenue) * 100 : 0;
  const colors = [
    "#3a6df0", "#00b894", "#fd79a8", "#e17055", "#6c5ce7",
    "#00cec9", "#fdcb6e", "#2d3436", "#74b9ff", "#a29bfe",
  ];
  const color = colors[index % colors.length];

  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid var(--divider)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 24, height: 24, borderRadius: 8,
            background: color + "22",
            color,
            fontSize: 11,
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            {index + 1}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ayla-text-1)" }}>
            {product.productName}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ayla-text-1)" }}>
            {fmtSom(product.totalRevenue)}
          </div>
          <div style={{ fontSize: 11, color: "var(--ayla-text-2)", fontWeight: 500 }}>
            {fmtQty(product.totalQuantitySold, product.unit)} · {product.orderCount} buyurtma
          </div>
        </div>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: "var(--divider)", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 4,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
        }} />
      </div>
    </div>
  );
}

// ─── Do'kon satri ─────────────────────────────────────────────────────────────
function ShopRow({ shop, rank }) {
  const hasDebt = Number(shop.totalDebt) > 0;
  const payRate = Number(shop.totalOrdered) > 0
    ? Math.round((Number(shop.totalPaid) / Number(shop.totalOrdered)) * 100)
    : 100;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "24px 1fr auto",
      gap: 12,
      padding: "13px 0",
      borderBottom: "1px solid var(--divider)",
      alignItems: "center",
    }}>
      <span style={{
        fontSize: 12, fontWeight: 800,
        color: rank <= 3 ? "#3a6df0" : "var(--ayla-text-3)",
        textAlign: "center",
      }}>
        {rank}
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ayla-text-1)" }}>
          {shop.shopName}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
          <div style={{ fontSize: 11, color: "var(--ayla-text-2)" }}>
            {shop.orderCount} buyurtma
          </div>
          <div style={{
            height: 4, flex: 1, maxWidth: 80, borderRadius: 2,
            background: "var(--divider)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${payRate}%`,
              borderRadius: 2,
              background: hasDebt ? "#fdcb6e" : "#00b894",
            }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: hasDebt ? "#e17055" : "#00b894" }}>
            {payRate}% to'landi
          </div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--ayla-text-1)" }}>
          {fmtSom(shop.totalOrdered)}
        </div>
        {hasDebt && (
          <div style={{ fontSize: 11, color: "#e17055", fontWeight: 600, marginTop: 2 }}>
            {fmtSom(shop.totalDebt)} qarz
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Haydovchi kartasi ────────────────────────────────────────────────────────
function DriverCard({ driver }) {
  return (
    <div style={{
      borderRadius: "var(--r-lg)",
      background: "var(--glass-fill)",
      border: "1px solid var(--glass-border)",
      backdropFilter: "blur(var(--blur-glass))",
      WebkitBackdropFilter: "blur(var(--blur-glass))",
      boxShadow: "var(--shadow-float)",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: "var(--r-md)", flexShrink: 0,
        background: "linear-gradient(150deg, #6c5ce7, #a29bfe)",
        color: "#fff", fontSize: 17, fontWeight: 800,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(108,92,231,0.30)",
      }}>
        {driver.driverName.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ayla-text-1)" }}>
          {driver.driverName}
        </div>
        {driver.vehicleNumber && (
          <div style={{ fontSize: 11.5, color: "var(--ayla-text-2)", marginTop: 1, fontWeight: 500 }}>
            🚗 {driver.vehicleNumber}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 14, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#3a6df0" }}>
            {driver.totalSessions}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ayla-text-2)", fontWeight: 600 }}>reys</div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#00b894" }}>
            {fmtSom(driver.totalRevenue)}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ayla-text-2)", fontWeight: 600 }}>daromad</div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ayla-text-1)" }}>
            {driver.shopsVisited}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--ayla-text-2)", fontWeight: 600 }}>do'kon</div>
        </div>
      </div>
    </div>
  );
}

// ─── Section sarlavhasi ───────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{
        fontSize: 14, fontWeight: 800, color: "var(--ayla-text-2)",
        textTransform: "uppercase", letterSpacing: "0.05em",
        margin: "0 0 14px",
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Asosiy sahifa ────────────────────────────────────────────────────────────
export default function StatsPage() {
  const { toast, showToast } = useToast();

  const [data, setData] = React.useState({ overview: null, products: [], shops: [], drivers: [] });
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const result = await statsService.getAll();
      setData(result);
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Statistikani yuklab bo'lmadi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  React.useEffect(() => { load(); }, [load]);

  const { overview, products, shops, drivers } = data;
  const maxRevenue = products.length > 0
    ? Math.max(...products.map((p) => Number(p.totalRevenue)))
    : 0;

  return (
    <div className="ayla-app">
      <Toast toast={toast} />

      <header className="ayla-topbar">
        <div className="ayla-topbar__row">
          <div className="ayla-topbar__heading">
            <SidebarMenuButton />
            <div>
              <h1 className="ayla-topbar__title">Statistika</h1>
              <p className="ayla-topbar__subtitle">Biznes tahlili</p>
            </div>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            style={{
              border: "1px solid var(--glass-outline)",
              background: "var(--glass-fill)",
              borderRadius: "var(--r-md)",
              width: 38, height: 38,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: "var(--ayla-text-2)",
              opacity: refreshing ? 0.5 : 1,
            }}
            aria-label="Yangilash"
          >
            <Icon.Refresh />
          </button>
        </div>
      </header>

      <main className="ayla-content">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[120, 80, 200, 160].map((h, i) => (
              <div key={i} className="ayla-skeleton" style={{ height: h }} />
            ))}
          </div>
        ) : (
          <>
            {/* ── KPI kartalar ─────────────────────────────────────────────── */}
            <Section title="Umumiy ko'rsatkichlar">
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
              }}>
                <KpiCard
                  label="Jami daromad"
                  value={fmtSom(overview?.totalRevenue)}
                  sub={fmtSomFull(overview?.totalRevenue)}
                  icon={<Icon.Revenue />}
                  accent="#00b894"
                />
                <KpiCard
                  label="Jami qarz"
                  value={fmtSom(overview?.totalDebt)}
                  sub={fmtSomFull(overview?.totalDebt)}
                  icon={<Icon.Debt />}
                  accent={Number(overview?.totalDebt) > 0 ? "#e17055" : "#00b894"}
                />
                <KpiCard
                  label="Buyurtmalar"
                  value={(overview?.totalOrders || 0).toLocaleString()}
                  sub={`${overview?.totalSessions || 0} ta reys`}
                  icon={<Icon.Orders />}
                  accent="#3a6df0"
                />
                <KpiCard
                  label="Hamkor do'konlar"
                  value={overview?.totalActiveShops || 0}
                  sub="buyurtma bo'lgan"
                  icon={<Icon.Shop />}
                  accent="#6c5ce7"
                />
              </div>

              {/* Qarz ulushi indicator */}
              {overview && Number(overview.totalOrderAmount) > 0 && (
                <div style={{
                  marginTop: 14,
                  borderRadius: "var(--r-lg)",
                  background: "var(--glass-fill)",
                  border: "1px solid var(--glass-border)",
                  backdropFilter: "blur(var(--blur-glass))",
                  WebkitBackdropFilter: "blur(var(--blur-glass))",
                  padding: "16px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ayla-text-2)" }}>
                      To'lov darajasi
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ayla-text-1)" }}>
                      {Math.round((Number(overview.totalRevenue) / Number(overview.totalOrderAmount)) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: "rgba(231,113,85,0.2)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.round((Number(overview.totalRevenue) / Number(overview.totalOrderAmount)) * 100)}%`,
                      borderRadius: 5,
                      background: "linear-gradient(90deg, #00b894, #00cec9)",
                      transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: "#00b894", fontWeight: 600 }}>
                      Yig'ildi: {fmtSom(overview.totalRevenue)}
                    </span>
                    <span style={{ fontSize: 11, color: "#e17055", fontWeight: 600 }}>
                      Qarz: {fmtSom(overview.totalDebt)}
                    </span>
                  </div>
                </div>
              )}
            </Section>

            {/* ── Top mahsulotlar ──────────────────────────────────────────── */}
            {products.length > 0 && (
              <Section title="🏆 Top mahsulotlar">
                <div style={{
                  borderRadius: "var(--r-xl)",
                  background: "var(--glass-fill)",
                  border: "1px solid var(--glass-border)",
                  backdropFilter: "blur(var(--blur-glass))",
                  WebkitBackdropFilter: "blur(var(--blur-glass))",
                  boxShadow: "var(--shadow-float)",
                  padding: "6px 16px 4px",
                }}>
                  {products.map((p, i) => (
                    <ProductBar key={p.productId} product={p} maxRevenue={maxRevenue} index={i} />
                  ))}
                </div>
              </Section>
            )}

            {/* ── Top do'konlar ────────────────────────────────────────────── */}
            {shops.length > 0 && (
              <Section title="🏪 Top do'konlar">
                <div style={{
                  borderRadius: "var(--r-xl)",
                  background: "var(--glass-fill)",
                  border: "1px solid var(--glass-border)",
                  backdropFilter: "blur(var(--blur-glass))",
                  WebkitBackdropFilter: "blur(var(--blur-glass))",
                  boxShadow: "var(--shadow-float)",
                  padding: "6px 16px 4px",
                }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr auto",
                    gap: 12,
                    padding: "8px 0 6px",
                    borderBottom: "1px solid var(--divider)",
                  }}>
                    {["#", "Do'kon nomi", "Buyurtma / Qarz"].map((h) => (
                      <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--ayla-text-3)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        {h}
                      </div>
                    ))}
                  </div>
                  {shops.map((shop, i) => (
                    <ShopRow key={shop.shopId} shop={shop} rank={i + 1} />
                  ))}
                </div>
              </Section>
            )}

            {/* ── Haydovchilar ─────────────────────────────────────────────── */}
            {drivers.length > 0 && (
              <Section title="🚚 Haydovchilar samaradorligi">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {drivers.map((d) => (
                    <DriverCard key={d.driverId} driver={d} />
                  ))}
                </div>
              </Section>
            )}

            {!overview && !loading && (
              <div className="ayla-empty">
                <p className="ayla-empty__title">Ma'lumot yo'q</p>
                <p className="ayla-empty__subtitle">Hozircha buyurtmalar kiritilmagan</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}