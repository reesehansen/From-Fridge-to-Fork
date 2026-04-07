/**
 * Main Express application
 */

import express from 'express';
import recipeRoutes from './routes/recipes';
import { config } from './utils/config';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (simple)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Routes
app.use('/api/recipes', recipeRoutes);

// Health check at root
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = config.port;
app.listen(port, () => {
  console.log(`🍳 Recipe Assistant API running on http://localhost:${port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
