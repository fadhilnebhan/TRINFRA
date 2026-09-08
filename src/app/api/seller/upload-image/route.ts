import { NextResponse } from 'next/server';
import { getAuthenticatedSeller } from '@/lib/auth';
import {
  MAX_IMAGE_SIZE,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  validateImageMagicBytes,
  storeResidentialImage,
} from '@/lib/storage';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const seller = await getAuthenticatedSeller();
  if (!seller) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file provided' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image size must be less than 5 MB' },
        { status: 400 }
      );
    }

    const mimeType = (file.type || '').toLowerCase();
    const originalName = file.name || 'property.jpg';
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_MIME_TYPES.has(mimeType) || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Only JPG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic bytes
    if (!validateImageMagicBytes(buffer, mimeType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file content: signature does not match image format' },
        { status: 400 }
      );
    }

    // Store persistently
    const stored = await storeResidentialImage(buffer, originalName, mimeType);

    return NextResponse.json({
      success: true,
      image: stored,
    });
  } catch (error: any) {
    console.error('Error in /api/seller/upload-image:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to upload property image';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
