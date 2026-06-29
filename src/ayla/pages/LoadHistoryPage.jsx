// src/pages/LoadHistoryPage.jsx
import React, { useState, useEffect } from "react";
import sessionService, { fmtDateTime, unitShort } from "../services/sessionService";
import "../styles/ios-theme.css";

export default function LoadHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtrlar va Sahifalash statelari
  const [selectedDate, setSelectedDate] = useState(""); // Format: YYYY-MM-DD
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchGlobalHistory = async () => {
    setLoading(true);
    try {
      // Har safar 15 tadan ma'lumot yuklanadi (API ga moslab qilingan)
      const data = await sessionService.getGlobalLoadHistory(selectedDate, page, 15);
      
      setHistory(data?.content || []);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || 0);
    } catch (error) {
      console.error("Global tarixni olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sahifa yoki sana o'zgarganda qayta chaqirish
  useEffect(() => {
    fetchGlobalHistory();
  }, [selectedDate, page]); // eslint-disable-line

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setPage(0); // Yangi sana tanlansa, paginatsiyani boshiga qaytaramiz
  };

  return (
    <div className="ayla-app">
      {/* Topbar */}
      <header className="ayla-topbar">
        <div className="ayla-topbar__row">
          <div className="ayla-topbar__heading">
            {/* Oldingi sahifaga qaytish tugmasi */}
            <button
              className="ayla-btn--ghost"
              style={{
                border: "none",
                background: "transparent",
                color: "var(--ayla-accent)",
                fontSize: 24,
                padding: "0 10px 0 0",
                cursor: "pointer"
              }}
              onClick={() => window.history.back()}
            >
              &larr;
            </button>
            <div>
              <h1 className="ayla-topbar__title">Yuklashlar Arxivi</h1>
              <p className="ayla-topbar__subtitle">Barcha haydovchilar tarixi</p>
            </div>
          </div>
        </div>
      </header>

      <main className="ayla-content" style={{ maxWidth: 560 }}>
        
        {/* Sana bo'yicha iOS-style filtr paneli */}
        <div className="ayla-card" style={{ marginBottom: 16, flexDirection: "column", alignItems: "stretch", gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ayla-text-2)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Sana bo'yicha qidirish
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="date"
              className="ayla-input"
              style={{ flex: 1, minHeight: 40 }}
              value={selectedDate}
              onChange={handleDateChange}
            />
            {selectedDate && (
              <button
                className="ayla-btn"
                style={{ padding: "0 16px", minHeight: 40, fontSize: 13, background: "var(--ayla-danger-soft)", color: "var(--ayla-danger)" }}
                onClick={() => {
                  setSelectedDate("");
                  setPage(0);
                }}
              >
                Tozalash
              </button>
            )}
          </div>
        </div>

        {/* Ro'yxat yoki Yuklanish holati */}
        {loading ? (
          <div className="ayla-list">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="ayla-skeleton" style={{ height: 84, borderRadius: "var(--r-md)" }} />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="ayla-empty" style={{ paddingTop: 40 }}>
            <p className="ayla-empty__title">Ma'lumot topilmadi</p>
            <p className="ayla-empty__subtitle">Tanlangan kunda yuklashlar mavjud emas yoki arxiv bo'sh.</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ayla-text-2)", marginBottom: 12, textAlign: "right" }}>
              Jami yozuvlar: <span style={{ color: "var(--ayla-text-1)" }}>{totalElements}</span> ta
            </div>

            <div className="ayla-list">
              {history.map((item) => {
                const qty = item.addedQuantity === Math.trunc(item.addedQuantity)
                  ? Math.trunc(item.addedQuantity) : item.addedQuantity;

                return (
                  <div key={item.id} className="ayla-card" style={{ cursor: "default", flexDirection: "column", alignItems: "stretch", gap: 8, padding: "14px 16px" }}>
                    
                    {/* Yuqori qism: Haydovchi va Mashina raqami */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-outline)", paddingBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ayla-text-2)" }}>
                        {item.driverName} 
                        {item.vehicleNumber && item.vehicleNumber !== "—" && (
                          <span style={{ fontWeight: 400, color: "var(--ayla-text-3)", marginLeft: 6 }}>
                            ({item.vehicleNumber})
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ayla-text-3)", fontWeight: 500 }}>
                        {fmtDateTime(item.addedAt)}
                      </div>
                    </div>

                    {/* Pastki qism: Maxsulot nomi va Ortilgan miqdor */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ayla-text-1)" }}>
                        {item.product?.name || "Noma'lum maxsulot"}
                      </span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ayla-accent)" }}>
                        +{qty} {unitShort(item.product?.unit)}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Paginatsiya boshqaruvi */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: "10px 0" }}>
                <button
                  className="ayla-btn ayla-btn--ghost"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  style={{ padding: "8px 16px", minHeight: 40, fontSize: 14 }}
                >
                  &larr; Oldingi
                </button>
                
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ayla-text-2)" }}>
                  {page + 1} / {totalPages}
                </span>

                <button
                  className="ayla-btn ayla-btn--ghost"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  style={{ padding: "8px 16px", minHeight: 40, fontSize: 14 }}
                >
                  Keyingi &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}