import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Maximum allowed image size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function getImagesDirectory(): string {
  // On Vercel serverless, root repository fs is read-only; /tmp is writable
  const dir = process.env.VERCEL
    ? path.join('/tmp', 'storage', 'images')
    : path.join(process.cwd(), 'public', 'uploads', 'images');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function POST(request: Request) {
  // 1. Authenticated admin authorization check
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // 2. Validate file size (max 5 MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image must be smaller than 5 MB.' },
        { status: 400 }
      );
    }

    // 3. Validate MIME type
    const mimeType = (file.type || '').toLowerCase();
    const originalName = file.name || 'image.jpg';
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_MIME_TYPES.has(mimeType) || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: 'Please select a JPG, PNG, or WEBP image.' },
        { status: 400 }
      );
    }

    // 4. Sanitize filename and create unique timestamped name
    const rawBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedBase = rawBaseName.substring(0, 40) || 'upload';
    const filename = `${Date.now()}_${sanitizedBase}${ext}`;

    const uploadDir = getImagesDirectory();
    const filePath = path.join(uploadDir, filename);

    // 5. Write binary buffer to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Also write to local public directory if running locally
    if (!process.env.VERCEL) {
      const altDir = path.join(process.cwd(), 'public', 'uploads', 'images');
      if (!fs.existsSync(altDir)) {
        fs.mkdirSync(altDir, { recursive: true });
      }
      fs.writeFileSync(path.join(altDir, filename), buffer);
    }

    // 6. Return public image URL
    // Images are served via /api/images/[filename] which reads from storage
    const imageUrl = `/api/images/${filename}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename,
      size: file.size,
      mimeType,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload and store image' },
      { status: 500 }
    );
  }
}
