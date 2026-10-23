import { HttpError } from '../utils/httpError.js';

export const STATUSES = ['pending', 'in_progress', 'completed'];
export const PRIORITIES = ['low', 'medium', 'high'];
const SORT_FIELDS = ['createdAt', 'priority', 'dueDate'];

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  // Rejects calendar-invalid dates like 2026-02-30, which Date silently rolls over.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function requiredText(body, field, max, errors) {
  const value = body[field];
  if (typeof value !== 'string' || !value.trim()) {
    errors.push({ field, message: `${field} is required` });
  } else if (value.trim().length > max) {
    errors.push({ field, message: `${field} must be at most ${max} characters` });
  }
}

// Validates a task payload and replaces req.body with a whitelisted, trimmed copy.
// Used for both POST and PUT: title/description are required; omitted optional fields
// get defaults on create and keep their current values on update.
export function validateTaskBody(req, _res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }

  const errors = [];
  requiredText(body, 'title', 100, errors);
  requiredText(body, 'description', 1000, errors);
  if (body.status !== undefined && !STATUSES.includes(body.status)) {
    errors.push({ field: 'status', message: `status must be one of: ${STATUSES.join(', ')}` });
  }
  if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) {
    errors.push({ field: 'priority', message: `priority must be one of: ${PRIORITIES.join(', ')}` });
  }
  if (body.dueDate !== undefined && body.dueDate !== null && body.dueDate !== '' && !isValidDate(body.dueDate)) {
    errors.push({ field: 'dueDate', message: 'dueDate must be a valid date in YYYY-MM-DD format' });
  }
  if (errors.length) throw new HttpError(400, 'Validation failed', errors);

  const clean = { title: body.title.trim(), description: body.description.trim() };
  if (body.status !== undefined) clean.status = body.status;
  if (body.priority !== undefined) clean.priority = body.priority;
  if (body.dueDate !== undefined) clean.dueDate = body.dueDate || null;
  req.body = clean;
  next();
}

function positiveInt(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return /^\d+$/.test(value) ? Number(value) : NaN;
}

export function validateListQuery(req, res, next) {
  const { search, status, priority, sortBy, order } = req.query;
  const page = positiveInt(req.query.page, 1);
  const limit = positiveInt(req.query.limit, 10);

  const errors = [];
  if (search !== undefined && typeof search !== 'string') errors.push({ field: 'search', message: 'search must be a single string' });
  if (status && !STATUSES.includes(status)) errors.push({ field: 'status', message: `status must be one of: ${STATUSES.join(', ')}` });
  if (priority && !PRIORITIES.includes(priority)) errors.push({ field: 'priority', message: `priority must be one of: ${PRIORITIES.join(', ')}` });
  if (sortBy && !SORT_FIELDS.includes(sortBy)) errors.push({ field: 'sortBy', message: `sortBy must be one of: ${SORT_FIELDS.join(', ')}` });
  if (order && !['asc', 'desc'].includes(order)) errors.push({ field: 'order', message: 'order must be asc or desc' });
  if (!(page >= 1)) errors.push({ field: 'page', message: 'page must be a positive integer' });
  if (!(limit >= 1 && limit <= 100)) errors.push({ field: 'limit', message: 'limit must be an integer between 1 and 100' });
  if (errors.length) throw new HttpError(400, 'Invalid query parameters', errors);

  // Express 5 makes req.query a read-only getter, so pass parsed values separately.
  res.locals.query = {
    search,
    status: status || undefined,
    priority: priority || undefined,
    sortBy: sortBy || undefined,
    order: order || undefined,
    page,
    limit,
  };
  next();
}
