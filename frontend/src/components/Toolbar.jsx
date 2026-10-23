import { PRIORITY_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '../utils/task.js';

function Select({ label, value, onChange, options, allLabel }) {
  return (
    <label className="toolbar-field">
      <span className="toolbar-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {allLabel && <option value="">{allLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Toolbar({ filters, hasFilters, onChange, onReset }) {
  return (
    <section className="toolbar" aria-label="Search and filter tasks">
      <label className="toolbar-field toolbar-search">
        <span className="toolbar-label">Search</span>
        <input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search title or description"
        />
      </label>
      <Select label="Status" value={filters.status} onChange={(status) => onChange({ status })} options={STATUS_OPTIONS} allLabel="All statuses" />
      <Select label="Priority" value={filters.priority} onChange={(priority) => onChange({ priority })} options={PRIORITY_OPTIONS} allLabel="All priorities" />
      <Select label="Sort by" value={filters.sort} onChange={(sort) => onChange({ sort })} options={SORT_OPTIONS} />
      {hasFilters && (
        <button type="button" className="btn btn-ghost toolbar-reset" onClick={onReset}>
          Clear filters
        </button>
      )}
    </section>
  );
}
