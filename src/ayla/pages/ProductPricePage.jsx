import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productService, formatSom, unitLabel, extractErrorMessage } from "../services/productService";
import Toast, { useToast } from "../components/Toast";
import SidebarMenuButton from "../components/SidebarMenuButton";
import "../styles/ios-theme.css";

const QUICK_STEPS = [1000, 5000, 10000, 50000];

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProductPricePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");

  const [amount, setAmount] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState("");

  React.useEffect(() => {
    setLoading(true);
    setLoadError("");
    productService
      .getById(id)
      .then((data) => {
        setProduct(data);
        setAmount(
          data.currentPrice != null ? String(Math.round(data.currentPrice)) : ""
        );
      })
      .catch((err) => setLoadError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  function adjust(delta) {
    setAmount((prev) => {
      const current = Number(prev) || 0;
      const next = Math.max(0, current + delta);
      return String(next);
    });
  }

  function handleAmountChange(e) {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setAmount(raw);
  }

  async function handleSave() {
    const numeric = Number(amount);
    if (!amount || numeric <= 0) {
      setSaveError("Narxni kiriting");
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const updated = await productService.setPrice(id, numeric);
      setProduct(updated);
      showToast("success", "Narx saqlandi");
      setTimeout(() => navigate(-1), 650);
    } catch (err) {
      setSaveError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ayla-app">
      <Toast toast={toast} />

      <header className="ayla-topbar">
        <div className="ayla-topbar__row">
          <div className="ayla-topbar__heading">
            <SidebarMenuButton />
            <button type="button" className="ayla-back" onClick={() => navigate(-1)}>
              <ChevronLeftIcon />
              Orqaga
            </button>
          </div>
        </div>
        <h1 className="ayla-topbar__title" style={{ fontSize: 22, marginTop: 6 }}>
          Narx belgilash
        </h1>
      </header>

      <main className="ayla-content" style={{ maxWidth: 480 }}>
        {loading && <div className="ayla-skeleton" style={{ height: 220 }} />}

        {!loading && loadError && (
          <div className="ayla-error-banner">
            <span>{loadError}</span>
          </div>
        )}

        {!loading && !loadError && product && (
          <>
            <div className="ayla-price-hero">
              <p className="ayla-price-hero__label">{product.name}</p>

              <div className="ayla-price-input-row">
                <button
                  type="button"
                  className="ayla-stepper-btn"
                  onClick={() => adjust(-1000)}
                  aria-label="Kamaytirish"
                >
                  −
                </button>

                <input
                  className="ayla-price-input"
                  value={amount}
                  onChange={handleAmountChange}
                  inputMode="numeric"
                  placeholder="0"
                  aria-label="Narx"
                />

                <button
                  type="button"
                  className="ayla-stepper-btn"
                  onClick={() => adjust(1000)}
                  aria-label="Oshirish"
                >
                  +
                </button>
              </div>

              <p className="ayla-price-unit">so'm / {unitLabel(product.unit)}</p>

              <p className="ayla-price-hero__current">
                Joriy narx: {formatSom(product.currentPrice)}
              </p>

              <div className="ayla-quick-chips">
                {QUICK_STEPS.map((step) => (
                  <button
                    key={step}
                    type="button"
                    className="ayla-chip"
                    onClick={() => adjust(step)}
                  >
                    +{new Intl.NumberFormat("uz-UZ").format(step)}
                  </button>
                ))}
              </div>
            </div>

            {saveError && (
              <div className="ayla-error-banner">
                <span>{saveError}</span>
              </div>
            )}

            <button
              type="button"
              className="ayla-btn ayla-btn--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saqlanmoqda…" : "Narxni saqlash"}
            </button>
          </>
        )}
      </main>
    </div>
  );
}