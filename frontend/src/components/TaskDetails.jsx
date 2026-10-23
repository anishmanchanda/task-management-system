import { useEffect, useState } from 'react';
import { taskApi } from '../api/tasks.js';
import { PriorityBadge, StatusBadge } from './Badge.jsx';
import { formatDateTime, formatDueDate, isOverdue } from '../utils/task.js';

// Loads the task fresh from GET /api/tasks/:id so the view never shows stale data.
export default function TaskDetails({ taskId, onEdit, onDelete }) {
  const [state, setState] = useState({ task: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    taskApi
      .get(taskId, controller.signal)
      .then((task) => setState({ task, loading: false, error: null }))
      .catch((error) => error.name !== 'AbortError' && setState({ task: null, loading: false, error }));
    return () => controller.abort();
  }, [taskId]);

  if (state.loading) return <p className="muted">Loading task…</p>;
  if (state.error) return <p className="form-error" role="alert">{state.error.message}</p>;

  const { task } = state;
  const overdue = isOverdue(task);
  return (
    <div className="task-details">
      <h3 className="details-title">{task.title}</h3>
      <div className="badges">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {overdue && <span className="badge overdue">Overdue</span>}
      </div>
      <p className="details-description">{task.description}</p>
      <dl className="details-meta">
        <dt>Due date</dt>
        <dd className={overdue ? 'text-danger' : undefined}>{formatDueDate(task.dueDate)}</dd>
        <dt>Created</dt>
        <dd>{formatDateTime(task.createdAt)}</dd>
        <dt>Last updated</dt>
        <dd>{formatDateTime(task.updatedAt)}</dd>
      </dl>
      <div className="form-actions">
        <button type="button" className="btn btn-danger-outline" onClick={() => onDelete(task)}>
          Delete
        </button>
        <button type="button" className="btn btn-primary" onClick={() => onEdit(task)}>
          Edit task
        </button>
      </div>
    </div>
  );
}
