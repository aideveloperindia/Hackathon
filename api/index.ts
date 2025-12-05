// Vercel serverless function wrapper for Express backend
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Export prisma for routes to use
export { prisma } from '../src/server/index';

// Import routes (they will import prisma from src/server/index)
import studentRoutes from '../src/server/routes/student.routes';
import adminRoutes from '../src/server/routes/admin.routes';
import authRoutes from '../src/server/routes/auth.routes';
import eventRoutes from '../src/server/routes/event.routes';
import submissionRoutes from '../src/server/routes/submission.routes';

const app = express();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3001',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL ? `https://${process.env.VERCEL}` : undefined,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin or from allowed origins
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed.replace('https://', '').replace('http://', '')))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in production
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'JITS Coding Platform API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/submissions', submissionRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export for Vercel serverless
export default app;
