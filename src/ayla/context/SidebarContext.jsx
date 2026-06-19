// src/context/SidebarContext.jsx
import React from "react";

const SidebarContext = React.createContext({
  openDrawer: () => {},
});

export function SidebarProvider({ value, children }) {
  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

/** Sahifa ichida hamburger tugma chizish uchun: const { openDrawer } = useSidebar(); */
export function useSidebar() {
  return React.useContext(SidebarContext);
}