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
const PORT = process.env.PORT || 5001;

// Export prisma for routes (using singleton from utils/prisma.ts)
export { prisma };

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3001',
    ...(process.env.VERCEL_FRONTEND_URL ? [process.env.VERCEL_FRONTEND_URL] : [])
  ],
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

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../../dist/client');
  app.use(express.static(clientBuildPath));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes (only in development, production handled above)
if (process.env.NODE_ENV !== 'production') {
  // Handle API routes that don't exist
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });
  
  // Handle non-API routes in development
  app.get('*', (req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      message: 'This is the backend API server. Please access the frontend at http://localhost:3001',
      apiHealth: 'http://localhost:5001/api/health'
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

