import TaskCard from './TaskCard.jsx';

function StatePanel({ title, children, role }) {
  return (
    <div className="state-panel" role={role}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default function TaskList({ tasks, loading, error, hasFilters, onRetry, onCreate, onClearFilters, ...handlers }) {
  if (error) {
    return (
      <StatePanel title="Couldn’t load tasks" role="alert">
        <p className="muted">{error.message}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      </StatePanel>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="task-grid" aria-busy="true" aria-label="Loading tasks">
        {[1, 2, 3].map((n) => (
          <div key={n} className="task-card skeleton" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return hasFilters ? (
      <StatePanel title="No matching tasks">
        <p className="muted">Try a different search or clear the filters.</p>
        <button type="button" className="btn" onClick={onClearFilters}>
          Clear filters
        </button>
      </StatePanel>
    ) : (
      <StatePanel title="No tasks yet">
        <p className="muted">Create your first task to get started.</p>
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          New task
        </button>
      </StatePanel>
    );
  }

  // While refetching, keep showing the current page (dimmed) instead of flashing a skeleton.
  return (
    <ul className={`task-grid${loading ? ' is-refreshing' : ''}`} aria-busy={loading}>
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} {...handlers} />
        </li>
      ))}
    </ul>
  );
}
