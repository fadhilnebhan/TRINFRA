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
    default:
      return 'application/octet-stream';
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = path.basename(params.filename); // Prevent path traversal

    const candidatePaths = [
      path.join('/tmp', 'storage', 'residential', filename),
      path.join(process.cwd(), 'public', 'uploads', 'residential', filename),
      path.join(process.cwd(), 'storage', 'residential', filename),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    // If file is not present locally, fallback to reliable canonical demo image
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
    console.error('Serve residential image error:', error);
    return new NextResponse('Error reading image', { status: 500 });
  }
}
