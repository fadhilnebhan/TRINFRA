// Safe Prisma generate script for local and Vercel serverless environments.
// Ensures DIRECT_URL falls back to DATABASE_URL if not explicitly set in Vercel environment.
const { execSync } = require('child_process');

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

try {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
} catch (error) {
  console.error('Prisma client generation failed:', error);
  process.exit(1);
}
