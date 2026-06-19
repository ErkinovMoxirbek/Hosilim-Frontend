// src/components/Toast.jsx
import React from "react";

/**
 * props:
 *  - toast: { type: 'success' | 'error', message: string } | null
 */
export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="ayla-toast-stack">
      <div className={`ayla-toast ayla-toast--${toast.type}`}>
        <span className="ayla-toast__dot" />
        {toast.message}
      </div>
    </div>
  );
}

/**
 * Toast holatini boshqarish uchun kichik hook.
 * Foydalanish: const { toast, showToast } = useToast();
 */
export function useToast(duration = 2600) {
  const [toast, setToast] = React.useState(null);
  const timerRef = React.useRef(null);

  const showToast = React.useCallback(
    (type, message) => {
      setToast({ type, message });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToast(null), duration);
    },
    [duration]
  );

  React.useEffect(() => () => clearTimeout(timerRef.current), []);

  return { toast, showToast };
}