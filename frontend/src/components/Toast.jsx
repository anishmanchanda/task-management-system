import { useEffect } from 'react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  // The live region stays mounted so screen readers announce each new message.
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.message}</span>
          <button type="button" className="icon-btn" onClick={onDismiss} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
