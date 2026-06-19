// src/components/ActionSheet.jsx
import React from "react";

/**
 * iOS-uslubidagi pastdan chiqadigan amallar menyusi.
 *
 * props:
 *  - isOpen: boolean
 *  - title?: string
 *  - actions: [{ label, onClick, destructive?: boolean, icon?: ReactNode }]
 *  - onCancel: () => void
 */
export default function ActionSheet({ isOpen, title, actions, onCancel }) {
  if (!isOpen) return null;

  return (
    <div
      className="ayla-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="ayla-sheet"
        onClick={(e) => e.stopPropagation()}
        role="menu"
      >
        <div className="ayla-sheet__handle" />
        {title && <p className="ayla-sheet__title">{title}</p>}

        {actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            role="menuitem"
            className={
              "ayla-sheet__action" +
              (action.destructive ? " ayla-sheet__action--destructive" : "")
            }
            onClick={() => {
              onCancel();
              // Sheet yopilish animatsiyasi bilan to'qnashmasligi uchun
              // amalni keyingi tikt-da bajaramiz.
              setTimeout(() => action.onClick(), 0);
            }}
          >
            {action.icon}
            {action.label}
          </button>
        ))}

        <button
          type="button"
          className="ayla-sheet__action ayla-sheet__action--cancel"
          onClick={onCancel}
        >
          Bekor qilish
        </button>
      </div>
    </div>
  );
}