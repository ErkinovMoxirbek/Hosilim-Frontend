// src/components/PriceFormModal.jsx
import React from "react";
import priceService from "../services/priceService";
import { extractErrorMessage } from "../services/productService";

const EMPTY_FORM = { label: "", amount: "" };

/**
 * props:
 *  - isOpen: boolean
 *  - mode: 'create' | 'edit'
 *  - product: { id, name, unit } — qaysi mahsulotga narx qo'shilyapti
 *  - initialData?: ProductPriceResponse (edit rejimida)
 *  - onClose: () => void
 *  - onSuccess: (price, mode) => void
 */
export default function PriceFormModal({
  isOpen,
  mode,
  product,
  initialData,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      setForm({
        label: initialData.label || "",
        amount: initialData.amount != null ? String(Math.round(initialData.amount)) : "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setServerError("");
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleAmountChange(e) {
    const raw = e.target.value.replace(/[^\d]/g, "");
    setField("amount", raw);
  }

  function validate() {
    const next = {};
    const numeric = Number(form.amount);
    if (!form.amount || numeric <= 0) {
      next.amount = "Narxni kiriting";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");
    try {
      const payload = { label: form.label.trim(), amount: Number(form.amount) };

      const result =
        mode === "edit"
          ? await priceService.updatePrice(initialData.id, payload)
          : await priceService.addPrice(product.id, payload);

      onSuccess(result, mode);
    } catch (err) {
      setServerError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ayla-overlay" onClick={onClose}>
      <div
        className="ayla-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="ayla-modal__header">
          <button type="button" className="ayla-modal__close" onClick={onClose}>
            Bekor qilish
          </button>
          <span className="ayla-modal__title">
            {mode === "edit" ? "Narxni tahrirlash" : "Yangi narx"}
          </span>
          <button
            type="submit"
            form="price-form"
            className="ayla-modal__save"
            disabled={submitting}
          >
            {submitting ? "Saqlanmoqda…" : "Saqlash"}
          </button>
        </div>

        <div className="ayla-modal__body">
          {product && (
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--ayla-text-2)",
                margin: "0 0 16px",
              }}
            >
              {product.name}
            </p>
          )}

          {serverError && (
            <div className="ayla-error-banner" style={{ marginBottom: 18 }}>
              <span>{serverError}</span>
            </div>
          )}

          <form id="price-form" onSubmit={handleSubmit}>
            <div className="ayla-field">
              <label htmlFor="price-amount">Narx (so'm)</label>
              <input
                id="price-amount"
                className="ayla-input"
                placeholder="Masalan: 11000"
                value={form.amount}
                onChange={handleAmountChange}
                inputMode="numeric"
                autoFocus
              />
              {errors.amount && (
                <div className="ayla-field__error">{errors.amount}</div>
              )}
            </div>

            <div className="ayla-field" style={{ marginBottom: 4 }}>
              <label htmlFor="price-label">Nomi (ixtiyoriy)</label>
              <input
                id="price-label"
                className="ayla-input"
                placeholder="Masalan: Optom, Chakana"
                value={form.label}
                onChange={(e) => setField("label", e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}