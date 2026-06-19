// src/components/SidebarMenuButton.jsx
import React from "react";
import { useSidebar } from "../context/SidebarContext";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Har bir sahifaning topbar qatoriga qo'yiladigan hamburger tugma.
 * CSS orqali faqat 860px dan tor ekranlarda ko'rinadi (.ayla-menu-btn).
 */
export default function SidebarMenuButton() {
  const { openDrawer } = useSidebar();
  return (
    <button
      type="button"
      className="ayla-menu-btn"
      onClick={openDrawer}
      aria-label="Menyuni ochish"
    >
      <MenuIcon />
    </button>
  );
}