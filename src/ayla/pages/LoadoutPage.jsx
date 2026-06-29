// src/pages/LoadoutPage.jsx
import React from "react";
import sessionService, {
  extractSessionError,
  unitShort,
  fmtDateTime,
} from "../services/sessionService";
import productService from "../services/productService";
import Toast, { useToast } from "../components/Toast";
import ActionSheet from "../components/ActionSheet";
import SidebarMenuButton from "../components/SidebarMenuButton";
import "../styles/ios-theme.css";

// ─── Ikonkalar ────────────────────────────────────────────────────────────────
function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Asosiy sahifa ────────────────────────────────────────────────────────────
export default function LoadoutPage() {
  const { toast, showToast } = useToast();

  // Haydovchi tanlash
  const [drivers, setDrivers] = React.useState([]);
  const [driverId, setDriverId] = React.useState("");

  // Reys holati
  const [session, setSession] = React.useState(null);
  const [loads, setLoads] = React.useState([]);
  const [history, setHistory] = React.useState([]); 
  const [sessionLoading, setSessionLoading] = React.useState(false);

  // Yuk qo'shish modal
  const [addOpen, setAddOpen] = React.useState(false);
  const [products, setProducts] = React.useState([]);
  const [selProduct, setSelProduct] = React.useState(null);
  const [addQty, setAddQty] = React.useState("");
  const [addBusy, setAddBusy] = React.useState(false);

  // Yakunlash tasdig'i
  const [confirmComplete, setConfirmComplete] = React.useState(false);
  const [completeBusy, setCompleteBusy] = React.useState(false);

  // ─── Haydovchilarni yuklash ─────────────────────────────────────────────
  React.useEffect(() => {
    sessionService
      .getAllDrivers()
      .then((d) => setDrivers(d || []))
      .catch(() => {});
  }, []);

  // ─── Haydovchi tanlanganda faol reysni tekshirish ──────────────────────
  React.useEffect(() => {
    if (!driverId) { 
      setSession(null); 
      setLoads([]); 
      setHistory([]); 
      return; 
    }
    checkSession();
  }, [driverId]); // eslint-disable-line

  async function checkSession() {
    setSessionLoading(true);
    try {
      const s = await sessionService.getActiveSession(driverId);
      setSession(s);
      if (s) {
        // Parallel ravishda hamma qoldiqni ham, tarixni ham yuklaymiz
        const [l, h] = await Promise.all([
          sessionService.getSessionLoads(s.id),
          sessionService.getSessionLoadHistory(s.id)
        ]);
        setLoads(l || []);
        setHistory(h || []);
      } else {
        setLoads([]);
        setHistory([]);
      }
    } catch (err) {
      showToast("error", extractSessionError(err));
    } finally {
      setSessionLoading(false);
    }
  }

  // ─── Reys boshlash ──────────────────────────────────────────────────────
  async function handleStart() {
    setSessionLoading(true);
    try {
      const s = await sessionService.startSession(driverId);
      setSession(s);
      setLoads([]);
      setHistory([]);
      showToast("success", "Reys boshlandi");
    } catch (err) {
      showToast("error", extractSessionError(err));
    } finally {
      setSessionLoading(false);
    }
  }

  // ─── Yuk qo'shish modal ochilganda mahsulotlarni yuklash ───────────────
  async function openAddLoad() {
    setAddOpen(true);
    setSelProduct(null);
    setAddQty("");
    if (products.length === 0) {
      try {
        const p = await productService.getAllProducts();
        setProducts(p || []);
      } catch {}
    }
  }

  // ─── Yuk qo'shish ─────────────────────────────────────────────────────
  async function handleAddLoad() {
    if (!selProduct || !addQty || Number(addQty) <= 0) return;
    setAddBusy(true);
    try {
      await sessionService.loadProducts(session.id, [
        { productId: selProduct.id, quantity: Number(addQty) },
      ]);
      
      // Muvaffaqiyatli yuklangach, qoldiqni ham, tarixni ham yangilaymiz
      const [l, h] = await Promise.all([
        sessionService.getSessionLoads(session.id),
        sessionService.getSessionLoadHistory(session.id)
      ]);
      
      setLoads(l || []);
      setHistory(h || []);
      setAddOpen(false);
      showToast("success", `${selProduct.name} yuklandi`);
    } catch (err) {
      showToast("error", extractSessionError(err));
    } finally {
      setAddBusy(false);
    }
  }

  // ─── Reys yakunlash ─────────────────────────────────────────────────────
  async function handleComplete() {
    setCompleteBusy(true);
    try {
      await sessionService.completeSession(session.id);
      setSession(null);
      setLoads([]);
      setHistory([]);
      setConfirmComplete(false);
      showToast("success", "Reys yakunlandi");
    } catch (err) {
      showToast("error", extractSessionError(err));
      setConfirmComplete(false);
    } finally {
      setCompleteBusy(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  const selectedDriver = drivers.find((d) => d.id === driverId);

  return (
    <div className="ayla-app">
      <Toast toast={toast} />

      {/* Topbar */}
      <header className="ayla-topbar">
        <div className="ayla-topbar__row">
          <div className="ayla-topbar__heading">
            <SidebarMenuButton />
            <div>
              <h1 className="ayla-topbar__title">Yuk Tashish</h1>
              <p className="ayla-topbar__subtitle">
                {session ? "Reys faol" : "Faol reys yo'q"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="ayla-content" style={{ maxWidth: 560 }}>

        {/* Haydovchi tanlash */}
        <div className="ayla-card" style={{ cursor: "default", marginBottom: 4, flexDirection: "column", alignItems: "stretch", gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ayla-text-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Haydovchi
          </label>
          <select
            className="ayla-input"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            style={{ marginTop: 4, paddingRight: 12 }}
          >
            <option value="">Haydovchini tanlang…</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}{d.vehicleNumber ? ` — ${d.vehicleNumber}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Holatlar */}
        {!driverId && (
          <div className="ayla-empty" style={{ paddingTop: 60 }}>
            <div className="ayla-empty__icon" style={{ margin: "0 auto 14px", opacity: 0.4 }}>
              <TruckIcon />
            </div>
            <p className="ayla-empty__title">Haydovchi tanlanmagan</p>
            <p className="ayla-empty__subtitle">Yuqoridan haydovchini tanlang</p>
          </div>
        )}

        {driverId && sessionLoading && (
          <div className="ayla-list">
            {[0, 1].map((i) => <div key={i} className="ayla-skeleton" style={{ height: 72 }} />)}
          </div>
        )}

        {driverId && !sessionLoading && !session && (
          <div className="ayla-empty" style={{ paddingTop: 50 }}>
            <div className="ayla-empty__icon" style={{ margin: "0 auto 14px", opacity: 0.45 }}>
              <TruckIcon />
            </div>
            <p className="ayla-empty__title">Faol reys yo'q</p>
            <p className="ayla-empty__subtitle">
              {selectedDriver?.fullName} hozirda faol reysda emas
            </p>
            <button
              className="ayla-btn ayla-btn--primary"
              style={{ marginTop: 24, maxWidth: 260, marginLeft: "auto", marginRight: "auto" }}
              onClick={handleStart}
            >
              Reysni boshlash
            </button>
          </div>
        )}

        {driverId && !sessionLoading && session && (
          <>
            {/* Status banner */}
            <div style={{
              borderRadius: "var(--r-lg)",
              background: "linear-gradient(150deg, var(--ayla-accent), var(--ayla-accent-dark))",
              padding: "18px 20px",
              color: "#fff",
              boxShadow: "var(--shadow-fab)",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, marginBottom: 2 }}>Reys faol</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {loads.length} xil mahsulot yuklangan
              </div>
            </div>

            {/* Amallar */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <button
                className="ayla-btn ayla-btn--ghost"
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onClick={openAddLoad}
              >
                <PlusIcon /> Yuk qo'shish
              </button>
              <button
                className="ayla-btn"
                style={{ flex: 1, background: "var(--ayla-danger-soft)", color: "var(--ayla-danger)", fontWeight: 700 }}
                onClick={() => setConfirmComplete(true)}
              >
                Reysni yakunlash
              </button>
            </div>

            {/* BAZA: Qolgan mahsulotlar (Jami) */}
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ayla-text-2)", marginBottom: 10 }}>
              Mashinadagi qoldiq
            </p>

            {loads.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--ayla-text-3)", padding: "8px 0" }}>
                Hali mahsulot yuklanmagan
              </p>
            ) : (
              <div className="ayla-list" style={{ marginBottom: 24 }}>
                {loads.map((load) => {
                  const loadedQty = load.loadedQuantity === Math.trunc(load.loadedQuantity)
                    ? Math.trunc(load.loadedQuantity) : load.loadedQuantity;
                  const availableQty = load.availableQuantity === Math.trunc(load.availableQuantity)
                    ? Math.trunc(load.availableQuantity) : load.availableQuantity;

                  return (
                    <div key={load.id} className="ayla-card" style={{ cursor: "default", alignItems: "center" }}>
                      <div className="ayla-card__avatar">
                        {load.product.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ayla-card__body">
                        <p className="ayla-card__name">{load.product.name}</p>
                        <div className="ayla-card__meta">
                          <span className="ayla-badge">{unitShort(load.product.unit)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ayla-accent)", whiteSpace: "nowrap" }}>
                          {availableQty} {unitShort(load.product.unit)} qoldi
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ayla-text-3)", whiteSpace: "nowrap" }}>
                          Jami: {loadedQty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* QO'SHILDI: Yuklash tarixi (Qachon nima qo'shildi) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ayla-text-2)" }}>
                Yuklash tarixi
              </p>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ayla-text-3)" }}>
                Eng oxirgisi tepada
              </span>
            </div>

            {history.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--ayla-text-3)", padding: "8px 0" }}>
                Tarix yo'q
              </p>
            ) : (
              <>
                <div className="ayla-list">
                  {history.map((item) => {
                     const addedQty = item.addedQuantity === Math.trunc(item.addedQuantity)
                      ? Math.trunc(item.addedQuantity) : item.addedQuantity;

                     return (
                       <div key={item.id} className="ayla-card" style={{ padding: "12px 14px", cursor: "default" }}>
                         <div style={{ flex: 1 }}>
                           <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ayla-text-1)" }}>
                             {item.product.name}
                           </p>
                           <p style={{ fontSize: 12, color: "var(--ayla-text-3)", marginTop: 4 }}>
                             {fmtDateTime(item.addedAt)}
                           </p>
                         </div>
                         <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ayla-accent)" }}>
                           +{addedQty} {unitShort(item.product.unit)}
                         </div>
                       </div>
                     );
                  })}
                </div>

                {/* YANGA QO'SHILDI: Arxiv tugmasi */}
                <button
                  className="ayla-btn ayla-btn--ghost"
                  style={{
                    marginTop: 12,
                    width: "100%",
                    color: "var(--ayla-accent)",
                    fontWeight: 600,
                    fontSize: 14,
                    border: "1px dashed var(--ayla-accent)",
                    minHeight: 44
                  }}
                  onClick={() => {
                    // Loyihangizdagi router konfiguratsiyasiga qarab yo'naltiring. (Agar react-router-dom bo'lsa useNavigate ishlating)
                    window.location.href = "/ayla/load-history";
                  }}
                >
                  Barcha tarixlarni ko'rish (Arxiv) &rarr;
                </button>
              </>
            )}
          </>
        )}
      </main>

      {/* Yuk qo'shish modali */}
      {addOpen && (
        <div className="ayla-overlay" onClick={() => !addBusy && setAddOpen(false)}>
          <div className="ayla-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ayla-modal__header">
              <button className="ayla-modal__close" onClick={() => !addBusy && setAddOpen(false)}>
                Bekor qilish
              </button>
              <span className="ayla-modal__title">Yuk qo'shish</span>
              <button
                className="ayla-modal__save"
                onClick={handleAddLoad}
                disabled={addBusy || !selProduct || !addQty || Number(addQty) <= 0}
              >
                {addBusy ? "…" : "Qo'shish"}
              </button>
            </div>
            <div className="ayla-modal__body">
              <div className="ayla-field">
                <label>Mahsulot tanlang</label>
                {products.length === 0 ? (
                  <div className="ayla-skeleton" style={{ height: 48 }} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {products.map((p) => {
                      const sel = selProduct?.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelProduct(p)}
                          style={{
                            padding: "12px 14px",
                            borderRadius: "var(--r-md)",
                            border: sel ? "1.5px solid var(--ayla-accent)" : "1px solid var(--glass-outline)",
                            background: sel ? "var(--ayla-accent-soft)" : "rgba(255,255,255,0.7)",
                            cursor: "pointer",
                            fontWeight: sel ? 700 : 500,
                            color: sel ? "var(--ayla-accent-dark)" : "var(--ayla-text-1)",
                            fontSize: 14,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{p.name}</span>
                          <span style={{ fontSize: 12, opacity: 0.65 }}>{unitShort(p.unit)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selProduct && (
                <div className="ayla-field">
                  <label>Miqdor ({unitShort(selProduct.unit)})</label>
                  <input
                    className="ayla-input"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    autoFocus
                    inputMode="decimal"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reys yakunlash tasdig'i */}
      <ActionSheet
        isOpen={confirmComplete}
        title="Reys yakunlansinmi? Barcha yuklar va buyurtmalar saqlanadi."
        onCancel={() => !completeBusy && setConfirmComplete(false)}
        actions={[
          {
            label: completeBusy ? "Yakunlanmoqda…" : "Ha, yakunlash",
            destructive: true,
            onClick: handleComplete,
          },
        ]}
      />
    </div>
  );
}