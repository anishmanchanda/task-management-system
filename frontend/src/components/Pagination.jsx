export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total === 0) return null;
  const { page, limit, total, totalPages } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="muted">
        Showing {from}–{to} of {total}
      </span>
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button type="button" className="btn btn-sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            Previous
          </button>
          <span aria-current="page">
            Page {page} of {totalPages}
          </span>
          <button type="button" className="btn btn-sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            Next
          </button>
        </div>
      )}
    </nav>
  );
}
