// src/pages/PricingPage.jsx
import React from "react";
import priceService from "../services/priceService";
import { formatSom, unitLabel, extractErrorMessage } from "../services/productService";
import PriceFormModal from "../components/PriceFormModal";
import ActionSheet from "../components/ActionSheet";
import Toast, { useToast } from "../components/Toast";
import SidebarMenuButton from "../components/SidebarMenuButton";
import "../styles/ios-theme.css";

function SearchIcon() {
  return (
    <svg className="ayla-search__icon" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg className="ayla-empty__icon" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 12l2-7h14l2 7M3 12v7a1 1 0 001 1h16a1 1 0 001-1v-7M3 12h18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PricingPage() {
  const { toast, showToast } = useToast();

  const [groups, setGroups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const [query, setQuery] = React.useState("");

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState("create");
  const [activeProduct, setActiveProduct] = React.useState(null);
  const [activePrice, setActivePrice] = React.useState(null);

  const [confirmDelete, setConfirmDelete] = React.useState(null); // { priceId, productId, text }
  const [deleting, setDeleting] = React.useState(false);

  const loadPrices = React.useCallback(() => {
    setLoading(true);
    setLoadError("");
    priceService
      .getAllGrouped()
      .then((data) => setGroups(data || []))
      .catch((err) => setLoadError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.productName.toLowerCase().includes(q));
  }, [groups, query]);

  function openAddPrice(group) {
    setActiveProduct({ id: group.productId, name: group.productName });
    setActivePrice(null);
    setFormMode("create");
    setFormOpen(true);
  }

  function openEditPrice(group, price) {
    setActiveProduct({ id: group.productId, name: group.productName });
    setActivePrice(price);
    setFormMode("edit");
    setFormOpen(true);
  }

  function handleFormSuccess(price, mode) {
    setFormOpen(false);
    setGroups((prev) =>
      prev.map((g) => {
        if (g.productId !== activeProduct.id) return g;
        if (mode === "edit") {
          return { ...g, prices: g.prices.map((p) => (p.id === price.id ? price : p)) };
        }
        return { ...g, prices: [...g.prices, price] };
      })
    );
    showToast("success", mode === "edit" ? "Narx yangilandi" : "Narx qo'shildi");
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await priceService.deletePrice(confirmDelete.priceId);
      setGroups((prev) =>
        prev.map((g) =>
          g.productId !== confirmDelete.productId
            ? g
            : { ...g, prices: g.prices.filter((p) => p.id !== confirmDelete.priceId) }
        )
      );
      showToast("success", "Narx o'chirildi");
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
              <h1 className="ayla-topbar__title">Narxlar</h1>
              <p className="ayla-topbar__subtitle">
                {loading ? "Yuklanmoqda…" : `${groups.length} ta mahsulot`}
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
            <button onClick={loadPrices}>Qayta urinish</button>
          </div>
        )}

        {loading && (
          <div className="ayla-list">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="ayla-skeleton" style={{ height: 96 }} />
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
                : "Avval Mahsulotlar bo'limida mahsulot qo'shing"}
            </p>
          </div>
        )}

        {!loading && !loadError && filtered.length > 0 && (
          <div className="ayla-list">
            {filtered.map((group) => (
              <div key={group.productId} className="ayla-card" style={{ cursor: "default", alignItems: "flex-start" }}>
                <div className="ayla-card__avatar">
                  {group.imageUrl ? (
                    <img src={group.imageUrl} alt={group.productName} />
                  ) : (
                    group.productName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="ayla-card__body">
                  <p className="ayla-card__name">{group.productName}</p>
                  <div className="ayla-card__meta" style={{ marginBottom: 10 }}>
                    <span className="ayla-badge">{unitLabel(group.unit)}</span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {group.prices.map((price) => (
                      <div key={price.id} className="ayla-price-chip">
                        <button
                          type="button"
                          className="ayla-price-chip__label"
                          onClick={() => openEditPrice(group, price)}
                        >
                          {price.label ? `${price.label}: ` : ""}
                          {formatSom(price.amount)}
                        </button>
                        <button
                          type="button"
                          className="ayla-price-chip__remove"
                          onClick={() =>
                            setConfirmDelete({
                              priceId: price.id,
                              productId: group.productId,
                              text: price.label
                                ? `"${price.label}" (${formatSom(price.amount)})`
                                : formatSom(price.amount),
                            })
                          }
                          aria-label="Narxni o'chirish"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="ayla-chip ayla-chip--add"
                      onClick={() => openAddPrice(group)}
                    >
                      + Narx qo'shish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PriceFormModal
        isOpen={formOpen}
        mode={formMode}
        product={activeProduct}
        initialData={activePrice}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <ActionSheet
        isOpen={!!confirmDelete}
        title={confirmDelete ? `${confirmDelete.text} o'chirilsinmi?` : ""}
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