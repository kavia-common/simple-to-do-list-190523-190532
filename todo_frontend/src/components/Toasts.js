import React, { useEffect } from "react";

/**
 * Toast model:
 * { id, type: "error"|"success"|"info", title, message, timeoutMs? }
 */

// PUBLIC_INTERFACE
export default function Toasts({ toasts, onDismiss }) {
  // Auto-dismiss toasts (default 4s; errors slightly longer)
  useEffect(() => {
    const timers = [];
    for (const t of toasts) {
      const timeoutMs =
        typeof t.timeoutMs === "number" ? t.timeoutMs : t.type === "error" ? 6500 : 4000;

      timers.push(
        setTimeout(() => {
          onDismiss(t.id);
        }, timeoutMs)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss]);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toasts" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || "info"}`} role="status">
          <div className="toast-row">
            <div>
              <p className="toast-title">{t.title || "Notice"}</p>
              {t.message ? <p className="toast-message">{t.message}</p> : null}
            </div>
            <button
              className="icon-btn"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
