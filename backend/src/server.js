import { createApp } from './app.js';
import { resetTasks } from './services/task.service.js';
import seed from './seed.json' with { type: 'json' };

const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

if (process.env.SEED_DATA !== 'false') resetTasks(seed);

createApp({ corsOrigin: CORS_ORIGIN }).listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}  (docs: /api/docs)`);
});
