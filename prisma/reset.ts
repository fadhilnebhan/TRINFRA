import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('🔄 Resetting TRINFRA demo database (PostgreSQL)...');

// 1. Clean private document storage (preserving .gitkeep)
const storagePath = path.join(process.cwd(), 'storage', 'documents');
if (fs.existsSync(storagePath)) {
  const files = fs.readdirSync(storagePath);
  let cleaned = 0;
  for (const file of files) {
    if (file === '.gitkeep') continue;
    try {
      fs.unlinkSync(path.join(storagePath, file));
      cleaned++;
    } catch {
      // skip locked files
    }
  }
  if (cleaned > 0) {
    console.log(`🗑️ Cleaned ${cleaned} file(s) from storage/documents/`);
  }
} else {
  fs.mkdirSync(storagePath, { recursive: true });
  console.log('📁 Created storage/documents/ directory');
}

// Ensure .gitkeep exists
const gitkeepPath = path.join(storagePath, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '');
}

// 2. Push schema to PostgreSQL if needed
console.log('📦 Syncing Prisma schema with PostgreSQL database...');
try {
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
} catch (err) {
  console.warn('⚠️ Prisma db push notice:', err);
}

// 3. Generate Prisma client
try {
  console.log('⚙️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch {
  console.warn('⚠️ Prisma generate skipped or already up to date.');
}

// 4. Seed fresh demo data
console.log('🌱 Seeding fresh demo data...');
execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });

console.log('');
console.log('═══════════════════════════════════════════');
console.log('🎉 TRINFRA demo database reset complete!');
console.log('');
console.log('  Start the dev server:  npm run dev');
console.log('  Admin login:           admin@trinfra.demo');
console.log('  Admin password:        TRINFRA-DEMO-2026');
console.log('═══════════════════════════════════════════');
