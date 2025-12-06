import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client
// Works in both development (Node.js) and serverless (Vercel) environments
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Always set in global to prevent multiple instances (important for serverless)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

