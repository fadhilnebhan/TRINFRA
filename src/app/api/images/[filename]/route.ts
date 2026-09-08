import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getMimeType(ext: string): string {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = path.basename(params.filename); // Sanitize traversal

    // Check possible locations:
    // 1. Vercel serverless /tmp/storage/images
    // 2. Local public/uploads/images
    // 3. Local storage/images
    const candidatePaths = [
      path.join('/tmp', 'storage', 'images', filename),
      path.join(process.cwd(), 'public', 'uploads', 'images', filename),
      path.join(process.cwd(), 'storage', 'images', filename),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    // If not found in ephemeral storage (e.g. Vercel instance recycled),
    // fallback gracefully to a canonical public image so public cards never break.
    if (!foundPath) {
      const fallbackPublicPath = path.join(process.cwd(), 'public', 'images', 'houses_tropical.jpeg');
      if (fs.existsSync(fallbackPublicPath)) {
        foundPath = fallbackPublicPath;
      } else {
        return new NextResponse('Image not found', { status: 404 });
      }
    }

    const fileBuffer = fs.readFileSync(foundPath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = getMimeType(ext);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Serve image error:', error);
    return new NextResponse('Error reading image', { status: 500 });
  }
}
