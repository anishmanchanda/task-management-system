import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { resetTasks } from '../src/services/task.service.js';

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}/api/tasks`;
});
after(() => server.close());
beforeEach(() => resetTasks());

async function call(method, path = '', body) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

const valid = { title: 'Write tests', description: 'Cover the API', priority: 'high', dueDate: '2026-10-05' };

test('full CRUD lifecycle with correct status codes', async () => {
  const created = await call('POST', '', valid);
  assert.equal(created.status, 201);
  const { id, status, createdAt } = created.body.data;
  assert.equal(status, 'pending'); // default applied

  assert.equal((await call('GET', `/${id}`)).body.data.title, 'Write tests');

  const updated = await call('PUT', `/${id}`, { title: 'Write more tests', description: 'x', status: 'completed' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.priority, 'high'); // omitted field kept
  assert.equal(updated.body.data.createdAt, createdAt);

  assert.equal((await call('DELETE', `/${id}`)).status, 200);
  assert.equal((await call('GET', `/${id}`)).status, 404);
  assert.equal((await call('PUT', `/${id}`, valid)).status, 404);
  assert.equal((await call('DELETE', `/${id}`)).status, 404);
});

test('rejects invalid payloads with field-level details', async () => {
  const res = await call('POST', '', { title: '  ', status: 'done', dueDate: '2026-02-30' });
  assert.equal(res.status, 400);
  const fields = res.body.error.details.map((d) => d.field).sort();
  assert.deepEqual(fields, ['description', 'dueDate', 'status', 'title']);

  assert.equal((await call('POST', '', '{bad json')).status, 400);
  assert.equal((await call('POST', '', [valid])).status, 400);
});

test('search, filter, sort and paginate', async () => {
  resetTasks([
    { title: 'Alpha', description: 'first', priority: 'low', dueDate: '2026-12-01' },
    { title: 'Beta', description: 'needle here', priority: 'high', status: 'completed' },
    { title: 'Gamma needle', description: 'third', priority: 'medium', dueDate: '2026-11-01' },
  ]);

  const search = await call('GET', '?search=NEEDLE');
  assert.deepEqual(search.body.data.map((t) => t.title).sort(), ['Beta', 'Gamma needle']);

  const filtered = await call('GET', '?status=completed&priority=high');
  assert.deepEqual(filtered.body.data.map((t) => t.title), ['Beta']);

  const byPriority = await call('GET', '?sortBy=priority&order=desc');
  assert.deepEqual(byPriority.body.data.map((t) => t.priority), ['high', 'medium', 'low']);

  // No-due-date tasks go last in both directions.
  const byDueAsc = await call('GET', '?sortBy=dueDate&order=asc');
  assert.deepEqual(byDueAsc.body.data.map((t) => t.title), ['Gamma needle', 'Alpha', 'Beta']);
  const byDueDesc = await call('GET', '?sortBy=dueDate&order=desc');
  assert.deepEqual(byDueDesc.body.data.map((t) => t.title), ['Alpha', 'Gamma needle', 'Beta']);

  const page2 = await call('GET', '?limit=2&page=2');
  assert.equal(page2.body.data.length, 1);
  assert.deepEqual(page2.body.meta, { total: 3, page: 2, limit: 2, totalPages: 2 });

  assert.equal((await call('GET', '?limit=0')).status, 400);
  assert.equal((await call('GET', '?sortBy=title')).status, 400);
});
