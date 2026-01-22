import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './models/database.js';
import uploadRoutes from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
try {
  initializeDatabase();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Demand Planning Analytics API',
    version: '1.0.0',
    endpoints: {
      upload: '/api/upload',
      analytics: '/api/analytics',
      health: '/api/health',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║  Demand Planning Analytics API Server        ║
║  Version: 1.0.0                               ║
║  Port: ${PORT}                                   ║
║  Environment: ${process.env.NODE_ENV || 'development'}                     ║
╚═══════════════════════════════════════════════╝

📊 Dashboard: http://localhost:3000
🔌 API: http://localhost:${PORT}
💚 Health: http://localhost:${PORT}/api/health

Ready to accept requests!
  `);
});

export default app;
