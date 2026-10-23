import { useState } from 'react';

export default function ConfirmDelete({ task, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setDeleting(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p>
        Delete <strong>{task.title}</strong>? This can’t be undone.
      </p>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={deleting} autoFocus>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete task'}
        </button>
      </div>
    </div>
  );
}
