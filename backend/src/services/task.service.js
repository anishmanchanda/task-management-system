import { randomUUID } from 'node:crypto';

// In-memory store. Resets on every server restart, by design.
let tasks = [];

const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

const comparators = {
  createdAt: (a, b) => a.createdAt.localeCompare(b.createdAt),
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  dueDate: (a, b) => a.dueDate.localeCompare(b.dueDate),
};

export function listTasks({ search, status, priority, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 }) {
  const term = search?.trim().toLowerCase();
  const filtered = tasks.filter(
    (t) =>
      (!term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)) &&
      (!status || t.status === status) &&
      (!priority || t.priority === priority),
  );

  const direction = order === 'asc' ? 1 : -1;
  const compare = comparators[sortBy];
  filtered.sort((a, b) => {
    // Tasks without a due date always sink to the bottom, whichever direction.
    if (sortBy === 'dueDate' && !a.dueDate !== !b.dueDate) return a.dueDate ? -1 : 1;
    if (sortBy === 'dueDate' && !a.dueDate) return b.createdAt.localeCompare(a.createdAt);
    return compare(a, b) * direction || b.createdAt.localeCompare(a.createdAt);
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  return {
    data: filtered.slice(start, start + limit),
    meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export function getTask(id) {
  return tasks.find((t) => t.id === id) ?? null;
}

export function createTask(input) {
  const now = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    status: input.status ?? 'pending',
    priority: input.priority ?? 'medium',
    dueDate: input.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  return task;
}

export function updateTask(id, input) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...input, id, updatedAt: new Date().toISOString() };
  return tasks[index];
}

export function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  return tasks.splice(index, 1)[0];
}

// Seeded tasks get createdAt one minute apart (last item newest), so date sorting is visible.
export function resetTasks(seed = []) {
  tasks = [];
  const now = Date.now();
  seed.forEach((input, i) => {
    const task = createTask(input);
    task.createdAt = task.updatedAt = new Date(now - (seed.length - i) * 60_000).toISOString();
  });
}
