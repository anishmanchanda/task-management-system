import { HttpError } from '../utils/httpError.js';

export function notFoundHandler(req) {
  throw new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`);
}

// Every error ends up here, so all failures share one response shape:
// { error: { message, details? } }
export function errorHandler(err, _req, res, _next) {
  // express.json() raises these for malformed or oversized bodies.
  if (err.type === 'entity.parse.failed') err = new HttpError(400, 'Malformed JSON in request body');
  if (err.type === 'entity.too.large') err = new HttpError(413, 'Request body too large');

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
