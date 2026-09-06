import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getPrismaClient(): PrismaClient {
  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
  };

  if (!globalForPrisma.prisma) {
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

    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const val = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});

export default prisma;

