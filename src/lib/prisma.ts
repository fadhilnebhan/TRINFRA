import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// On Vercel serverless, the repository filesystem is read-only.
// We copy the bundled SQLite database to /tmp so both reads and writes work.
if (process.env.VERCEL) {
  const tmpDbPath = path.join('/tmp', 'dev.db');
  const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  try {
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
      fs.copyFileSync(bundledDbPath, tmpDbPath);
    }
  } catch (err) {
    console.warn('Vercel SQLite /tmp copy warning:', err);
  }

  if (fs.existsSync(tmpDbPath)) {
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  } else if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `file:${bundledDbPath}`;
  }
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

