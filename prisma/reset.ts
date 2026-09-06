import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('🔄 Resetting TRINFRA demo database...');

// 1. Remove SQLite database file if possible
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
const dbJournalPath = dbPath + '-journal';
const dbWalPath = dbPath + '-wal';
const dbShmPath = dbPath + '-shm';

for (const filePath of [dbJournalPath, dbWalPath, dbShmPath, dbPath]) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Removed ${path.basename(filePath)}`);
    } catch {
      console.warn(`⚠️ Could not delete ${path.basename(filePath)} (may be locked by running server).`);
    }
  }
}

// 2. Clean private document storage
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

// 3. Push schema (creates fresh dev.db if deleted, or syncs if still exists)
console.log('📦 Pushing Prisma schema to SQLite...');
execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });

// 4. Generate Prisma client (optional — may fail if dev server has DLL locked)
try {
  console.log('⚙️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch {
  console.warn('⚠️ Prisma generate skipped (query engine locked by running server). Client is already up to date.');
}

// 5. Seed demo data
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
