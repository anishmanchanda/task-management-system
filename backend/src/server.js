import { createApp } from './app.js';
import { resetTasks } from './services/task.service.js';
import seed from './seed.json' with { type: 'json' };

// Load backend/.env if present (built into Node >= 20.12, no dotenv needed).
try {
  process.loadEnvFile();
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
}

const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

if (process.env.SEED_DATA !== 'false') resetTasks(seed);

createApp({ corsOrigin: CORS_ORIGIN }).listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}  (docs: /api/docs)`);
});
