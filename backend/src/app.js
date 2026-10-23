import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import openapi from './docs/openapi.json' with { type: 'json' };
import taskRoutes from './routes/task.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp({ corsOrigin = '*' } = {}) {
  const app = express();

  app.use(cors({ origin: corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim()) }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/tasks', taskRoutes);
  app.get('/api/openapi.json', (_req, res) => res.json(openapi));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
