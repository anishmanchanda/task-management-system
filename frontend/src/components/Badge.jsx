import { labelFor, PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/task.js';

export function StatusBadge({ status }) {
  return <span className={`badge status-${status}`}>{labelFor(STATUS_OPTIONS, status)}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge priority-${priority}`}>{labelFor(PRIORITY_OPTIONS, priority)} priority</span>;
}
