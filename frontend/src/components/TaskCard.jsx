import { PriorityBadge, StatusBadge } from './Badge.jsx';
import { formatDate, formatDueDate, isOverdue } from '../utils/task.js';

export default function TaskCard({ task, onView, onEdit, onDelete }) {
  const overdue = isOverdue(task);
  return (
    <article className={`task-card priority-edge-${task.priority}`}>
      <h3 className="task-title">
        <button type="button" className="link-btn" onClick={() => onView(task)}>
          {task.title}
        </button>
      </h3>
      <div className="badges">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="task-description">{task.description}</p>
      <dl className="task-meta">
        <div>
          <dt>Created</dt>
          <dd>{formatDate(task.createdAt)}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd className={overdue ? 'text-danger' : undefined}>
            {formatDueDate(task.dueDate)}
            {overdue && ' · Overdue'}
          </dd>
        </div>
      </dl>
      <div className="task-actions">
        <button type="button" className="btn btn-sm" onClick={() => onView(task)}>
          View
        </button>
        <button type="button" className="btn btn-sm" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="btn btn-sm btn-danger-outline" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </article>
  );
}
