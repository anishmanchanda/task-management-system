import { useEffect, useRef } from 'react';

// Native <dialog> gives focus trapping, Escape-to-close and a backdrop for free.
export default function Modal({ title, onClose, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // mousedown, not click: dragging a text selection out of the dialog must not close it.
      onMouseDown={(e) => e.target === ref.current && onClose()}
    >
      <div className="modal-inner">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
