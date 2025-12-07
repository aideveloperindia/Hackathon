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
// IMPORTANT: Backend MUST run on 5002, frontend on 5001
// Vite proxies /api requests from 5001 to 5002
const PORT = process.env.PORT === '5001' ? 5002 : (process.env.PORT || 5002);

// Export prisma for routes (using singleton from utils/prisma.ts)
export { prisma };

// Middleware
app.use(cors({
  origin: true, // Allow all origins in unified setup
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check hit');
  res.json({ status: 'ok', message: 'JITS Coding Platform API is running', port: PORT });
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
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ API available at http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
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

