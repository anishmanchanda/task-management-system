// The only module that talks to the backend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path = '', { body, ...options } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/tasks${path}`, {
      ...options,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Could not reach the server. Is the backend running?', 0);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error?.message ?? `Request failed (${res.status})`, res.status, data?.error?.details ?? []);
  }
  return data;
}

export const taskApi = {
  list(params, signal) {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    return request(`?${query}`, { signal });
  },
  get: (id, signal) => request(`/${id}`, { signal }).then((res) => res.data),
  create: (task) => request('', { method: 'POST', body: task }).then((res) => res.data),
  update: (id, task) => request(`/${id}`, { method: 'PUT', body: task }).then((res) => res.data),
  remove: (id) => request(`/${id}`, { method: 'DELETE' }),
};
