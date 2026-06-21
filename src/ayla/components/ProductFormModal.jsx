// src/components/ProductFormModal.jsx
import React from "react";
import productService, { PRODUCT_UNITS, extractErrorMessage } from "../services/productService";

const EMPTY_FORM = {
  name: "",
  description: "",
  unit: "LITR",
  imageUrl: "",
};

/**
 * props:
 *  - isOpen: boolean
 *  - mode: 'create' | 'edit'
 *  - initialData?: ProductResponse (edit rejimida)
 *  - onClose: () => void
 *  - onSuccess: (product) => void
 */
export default function ProductFormModal({
  isOpen,
  mode,
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
        name: initialData.name || "",
        description: initialData.description || "",
        unit: initialData.unit || "LITR",
        imageUrl: initialData.imageUrl || "",
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

  function validate() {
    const next = {};
    if (!form.name.trim()) {
      next.name = "Mahsulot nomini kiriting";
    }
    if (!form.unit) {
      next.unit = "O'lchov birligini tanlang";
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
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        unit: form.unit,
        imageUrl: form.imageUrl.trim() || null,
      };

      const result =
        mode === "edit"
          ? await productService.updateProduct(initialData.id, payload)
          : await productService.createProduct(payload);

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
            {mode === "edit" ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
          </span>
          <button
            type="submit"
            form="product-form"
            className="ayla-modal__save"
            disabled={submitting}
          >
            {submitting ? "Saqlanmoqda…" : "Saqlash"}
          </button>
        </div>

        <div className="ayla-modal__body">
          {serverError && (
            <div className="ayla-error-banner" style={{ marginBottom: 18 }}>
              <span>{serverError}</span>
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit}>
            <div className="ayla-field">
              <label htmlFor="product-name">Nomi</label>
              <input
                id="product-name"
                className="ayla-input"
                placeholder="Masalan: Qatiq 1L"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                autoFocus
              />
              {errors.name && (
                <div className="ayla-field__error">{errors.name}</div>
              )}
            </div>

            <div className="ayla-field">
              <label htmlFor="product-desc">Izoh (ixtiyoriy)</label>
              <textarea
                id="product-desc"
                className="ayla-textarea"
                placeholder="Mahsulot haqida qisqacha izoh"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>

            <div className="ayla-field">
              <label>O'lchov birligi</label>
              <div className="ayla-segmented" role="radiogroup">
                {PRODUCT_UNITS.map((u) => (
                  <button
                    type="button"
                    key={u.value}
                    role="radio"
                    aria-checked={form.unit === u.value}
                    className={
                      "ayla-segmented__option" +
                      (form.unit === u.value ? " is-active" : "")
                    }
                    onClick={() => setField("unit", u.value)}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
              {errors.unit && (
                <div className="ayla-field__error">{errors.unit}</div>
              )}
            </div>

            <div className="ayla-field" style={{ marginBottom: 4 }}>
              <label htmlFor="product-image">Rasm havolasi (ixtiyoriy)</label>
              <input
                id="product-image"
                className="ayla-input"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setField("imageUrl", e.target.value)}
                inputMode="url"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}