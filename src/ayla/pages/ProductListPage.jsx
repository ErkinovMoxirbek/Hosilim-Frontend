// src/pages/ProductListPage.jsx
import React from "react";
import productService, { unitLabel, extractErrorMessage } from "../services/productService";
import ProductFormModal from "../components/ProductFormModal";
import ActionSheet from "../components/ActionSheet";
import Toast, { useToast } from "../components/Toast";
import SidebarMenuButton from "../components/SidebarMenuButton";
import "../styles/ios-theme.css";

function SearchIcon() {
  return (
    <svg className="ayla-search__icon" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line
        x1="16.5"
        y1="16.5"
        x2="21"
        y2="21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <circle cx="5" cy="12" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="19" cy="12" r="1.9" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg className="ayla-empty__icon" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7V5a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function ProductListPage() {
  const { toast, showToast } = useToast();

  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const [query, setQuery] = React.useState("");

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState("create");
  const [activeProduct, setActiveProduct] = React.useState(null);

  const [sheetProduct, setSheetProduct] = React.useState(null);
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadProducts = React.useCallback(() => {
    setLoading(true);
    setLoadError("");
    productService
      .getAllProducts()
      .then((data) => setProducts(data || []))
      .catch((err) => setLoadError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  function openCreateForm() {
    setFormMode("create");
    setActiveProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product) {
    setFormMode("edit");
    setActiveProduct(product);
    setFormOpen(true);
  }

  function handleFormSuccess(product, mode) {
    setFormOpen(false);
    if (mode === "edit") {
      setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
      showToast("success", `${product.name} yangilandi`);
    } else {
      setProducts((prev) => [...prev, product]);
      showToast("success", `${product.name} qo'shildi`);
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await productService.deleteProduct(confirmDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      showToast("success", `${confirmDelete.name} o'chirildi`);
    } catch (err) {
      showToast("error", extractErrorMessage(err));
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }

  return (
    <div className="ayla-app">
      <Toast toast={toast} />

      <header className="ayla-topbar">
        <div className="ayla-topbar__row">
          <div className="ayla-topbar__heading">
            <SidebarMenuButton />
            <div>
              <h1 className="ayla-topbar__title">Mahsulotlar</h1>
              <p className="ayla-topbar__subtitle">
                {loading ? "Yuklanmoqda…" : `${products.length} ta mahsulot`}
              </p>
            </div>
          </div>
        </div>

        <div className="ayla-search">
          <SearchIcon />
          <input
            type="text"
            placeholder="Mahsulot qidirish"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            inputMode="search"
          />
          {query && (
            <button
              type="button"
              className="ayla-search__clear"
              onClick={() => setQuery("")}
              aria-label="Tozalash"
            >
              ✕
            </button>
          )}
        </div>
      </header>

      <main className="ayla-content">
        {loadError && (
          <div className="ayla-error-banner">
            <span>{loadError}</span>
            <button onClick={loadProducts}>Qayta urinish</button>
          </div>
        )}

        {loading && (
          <div className="ayla-list">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="ayla-skeleton" />
            ))}
          </div>
        )}

        {!loading && !loadError && filtered.length === 0 && (
          <div className="ayla-empty">
            <EmptyIcon />
            <p className="ayla-empty__title">
              {query ? "Hech narsa topilmadi" : "Mahsulotlar yo'q"}
            </p>
            <p className="ayla-empty__subtitle">
              {query
                ? `"${query}" bo'yicha natija yo'q`
                : "Pastdagi + tugmasi orqali birinchi mahsulotni qo'shing"}
            </p>
          </div>
        )}

        {!loading && !loadError && filtered.length > 0 && (
          <div className="ayla-list">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="ayla-card"
                onClick={() => openEditForm(product)}
              >
                <div className="ayla-card__avatar">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    product.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="ayla-card__body">
                  <p className="ayla-card__name">{product.name}</p>
                  <div className="ayla-card__meta">
                    <span className="ayla-badge">{unitLabel(product.unit)}</span>
                    {product.description && <span>{product.description}</span>}
                  </div>
                </div>

                <div className="ayla-card__trailing">
                  <button
                    type="button"
                    className="ayla-more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSheetProduct(product);
                    }}
                    aria-label="Ko'proq amallar"
                  >
                    <MoreIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button type="button" className="ayla-fab" onClick={openCreateForm} aria-label="Mahsulot qo'shish">
        <PlusIcon />
      </button>

      <ProductFormModal
        isOpen={formOpen}
        mode={formMode}
        initialData={activeProduct}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <ActionSheet
        isOpen={!!sheetProduct}
        title={sheetProduct?.name}
        onCancel={() => setSheetProduct(null)}
        actions={
          sheetProduct
            ? [
                {
                  label: "Tahrirlash",
                  onClick: () => openEditForm(sheetProduct),
                },
                {
                  label: "O'chirish",
                  destructive: true,
                  onClick: () => setConfirmDelete(sheetProduct),
                },
              ]
            : []
        }
      />

      <ActionSheet
        isOpen={!!confirmDelete}
        title={
          confirmDelete
            ? `"${confirmDelete.name}" o'chirilsinmi?`
            : ""
        }
        onCancel={() => !deleting && setConfirmDelete(null)}
        actions={[
          {
            label: deleting ? "O'chirilmoqda…" : "Ha, o'chirish",
            destructive: true,
            onClick: handleConfirmDelete,
          },
        ]}
      />
    </div>
  );
}