// Unified development server - runs both Express and Vite on one port
import { createServer as createViteServer } from 'vite';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from './utils/prisma';
import studentRoutes from './routes/student.routes';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import submissionRoutes from './routes/submission.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // Single unified port

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'JITS Coding Platform API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/submissions', submissionRoutes);

// Error handling middleware - MUST be after all routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌❌❌ UNHANDLED ERROR ❌❌❌');
  console.error('Error:', err);
  console.error('Error message:', err?.message);
  console.error('Error stack:', err?.stack);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

async function startDevServer() {
  try {
    // Create Vite dev server
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(__dirname, '../client'),
      configFile: path.resolve(__dirname, '../../vite.config.ts'),
      clearScreen: false,
      logLevel: 'info',
    });

    // Use vite's connect instance as middleware (handle all non-API routes)
    // IMPORTANT: Check for /api routes FIRST, then pass to Vite for frontend
    app.use((req, res, next) => {
      // If it's an API route, let Express handle it (already registered above)
      if (req.path.startsWith('/api')) {
        return next();
      }
      // Otherwise, let Vite handle it (React app)
      vite.middlewares(req, res, next);
    });

    // Handle API 404s (only if API route wasn't matched)
    app.use('/api/*', (req, res) => {
      res.status(404).json({ error: 'API route not found' });
    });

    app.listen(PORT, () => {
      console.log(`🚀🚀🚀 UNIFIED SERVER RUNNING ON PORT ${PORT} 🚀🚀🚀`);
      console.log(`📊 Environment: development`);
      console.log(`✨ Frontend and backend running together on ONE port: ${PORT}`);
      console.log(`✅ Access your app at: http://localhost:${PORT}`);
      console.log(`✅ API available at: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start dev server:', err);
    process.exit(1);
  }
}

startDevServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

