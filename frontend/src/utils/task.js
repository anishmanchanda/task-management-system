export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'priority:desc', label: 'Priority: high to low' },
  { value: 'priority:asc', label: 'Priority: low to high' },
  { value: 'dueDate:asc', label: 'Due date: soonest' },
  { value: 'dueDate:desc', label: 'Due date: latest' },
];

export const labelFor = (options, value) => options.find((o) => o.value === value)?.label ?? value;

export const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

// Due dates are calendar dates ("YYYY-MM-DD"), so build them in local time;
// new Date("2026-10-05") would parse as UTC midnight and can show the previous day.
export function formatDueDate(ymd) {
  if (!ymd) return 'No due date';
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function todayYmd() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

export const isOverdue = (task) => Boolean(task.dueDate) && task.status !== 'completed' && task.dueDate < todayYmd();

// Mirrors the backend rules so users get instant feedback; the server still validates.
export function validateTask(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = 'Title is required';
  else if (values.title.trim().length > 100) errors.title = 'Title must be at most 100 characters';
  if (!values.description.trim()) errors.description = 'Description is required';
  else if (values.description.trim().length > 1000) errors.description = 'Description must be at most 1000 characters';
  return errors;
}
