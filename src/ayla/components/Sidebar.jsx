// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/ayla/map", label: "Do'konlar", hint: "Filiallar va xarita", icon: "🏪" },
  { path: "/ayla/products", label: "Mahsulotlar", hint: "Katalog boshqaruvi", icon: "📦" },
  { path: "/ayla/pricing", label: "Narxlar", hint: "Tovar narxi boshqaruvi", icon: "💳" },
  { path: "/ayla/loadout", label: "Yuk Tashish", hint: "Sklad va logistika", icon: "🚚" },
  { path: "/ayla/history", label: "Savdo tarixi", hint: "O'tgan reyslar", icon: "🕒" },
  { path: "/ayla/stats", label: "Statistika", hint: "Savdo statistikasi", icon: "📊" },
];

/**
 * props:
 *  - onNavigate?: () => void  (drawerda link bosilganda yopish uchun)
 */
export default function Sidebar({ onNavigate }) {
  return (
    <nav className="ayla-sidebar__nav">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={({ isActive }) =>
            "ayla-sidebar__link" + (isActive ? " is-active" : "")
          }
        >
          <span className="ayla-sidebar__icon">{item.icon}</span>
          <span className="ayla-sidebar__text">
            <span className="ayla-sidebar__label">{item.label}</span>
            <span className="ayla-sidebar__hint">{item.hint}</span>
          </span>
        </NavLink>
      ))}
    </nav>
  );
}