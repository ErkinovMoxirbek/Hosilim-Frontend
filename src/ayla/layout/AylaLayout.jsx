// src/layout/AylaLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { SidebarProvider } from "../context/SidebarContext";
import "../styles/ios-theme.css";

function BrandMark() {
  return (
    <div className="ayla-sidebar__brand">
      <span className="ayla-sidebar__brand-mark">A</span>
      <span className="ayla-sidebar__brand-text">Ayla Distribution</span>
    </div>
  );
}

export default function AylaLayout() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Context qiymati har renderda qayta yaratilmasligi uchun memo qilinadi
  const sidebarValue = React.useMemo(
    () => ({ openDrawer: () => setDrawerOpen(true) }),
    []
  );

  return (
    <SidebarProvider value={sidebarValue}>
      <div className="ayla-shell">
        {/* --- Desktop: doimiy ko'rinadigan sidebar --- */}
        <aside className="ayla-sidebar ayla-sidebar--desktop">
          <BrandMark />
          <Sidebar />
        </aside>

        {/* --- Mobil: chapdan chiqadigan drawer ---
            Diqqat: bu yerda alohida "mobil topbar" YO'Q.
            Ochish tugmasi har bir sahifaning o'z topbar'i ichida
            <SidebarMenuButton /> orqali chiqadi — shu bilan
            ikkita panel ustma-ust chiqib ketmaydi. */}
        {drawerOpen && (
          <div
            className="ayla-sidebar-overlay"
            onClick={() => setDrawerOpen(false)}
            role="presentation"
          >
            <aside
              className="ayla-sidebar ayla-sidebar--drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ayla-sidebar__brand">
                <span className="ayla-sidebar__brand-mark">A</span>
                <span className="ayla-sidebar__brand-text">Ayla Distribution</span>
                <button
                  type="button"
                  className="ayla-sidebar__close"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Yopish"
                >
                  ✕
                </button>
              </div>
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            </aside>
          </div>
        )}

        <main className="ayla-main">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}