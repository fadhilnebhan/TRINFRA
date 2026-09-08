import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
export const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export interface StoredImageMetadata {
  storageKey: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Validate image buffer magic bytes against declared MIME type
 */
export function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  const hex = buffer.subarray(0, 12).toString('hex').toLowerCase();

  // JPEG starts with ffd8ff
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return hex.startsWith('ffd8ff');
  }

  // PNG starts with 89504e47 (‰PNG)
  if (mimeType === 'image/png') {
    return hex.startsWith('89504e47');
  }

  // WEBP starts with 52494646 (RIFF) and at byte 8 has 57454250 (WEBP)
  if (mimeType === 'image/webp') {
    return hex.startsWith('52494646') && hex.substring(16, 24) === '57454250';
  }

  return false;
}

/**
 * Get filesystem storage directory for residential uploads
 */
export function getResidentialStorageDir(): string {
  const dir = process.env.VERCEL
    ? path.join('/tmp', 'storage', 'residential')
    : path.join(process.cwd(), 'public', 'uploads', 'residential');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Store user-uploaded residential image persistently
 */
export async function storeResidentialImage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<StoredImageMetadata> {
  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const randomId = crypto.randomBytes(8).toString('hex');
  const storageKey = `res_${Date.now()}_${randomId}${ext}`;

  // Check if Supabase Storage API key is provided
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  const supabaseProjectRef = 'hbongewkewhjovhfpxqb';

  if (supabaseKey) {
    try {
      const uploadUrl = `https://${supabaseProjectRef}.supabase.co/storage/v1/object/residential-images/${storageKey}`;
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          'Content-Type': mimeType,
        },
        body: new Uint8Array(buffer),
      });

      if (uploadRes.ok) {
        const publicUrl = `https://${supabaseProjectRef}.supabase.co/storage/v1/object/public/residential-images/${storageKey}`;
        return {
          storageKey,
          url: publicUrl,
          filename: originalFilename,
          mimeType,
          size: buffer.length,
        };
      } else {
        const errText = await uploadRes.text();
        console.warn('Supabase storage upload returned error, falling back to local:', errText);
      }
    } catch (supabaseErr) {
      console.warn('Supabase storage upload failed, falling back to local:', supabaseErr);
    }
  }

  // Filesystem storage fallback
  const storageDir = getResidentialStorageDir();
  const filePath = path.join(storageDir, storageKey);
  fs.writeFileSync(filePath, buffer);

  // Also write to public/uploads/residential if running locally
  if (!process.env.VERCEL) {
    const publicDir = path.join(process.cwd(), 'public', 'uploads', 'residential');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, storageKey), buffer);
  }

  // Served via /api/residential/images/[filename]
  const publicUrl = `/api/residential/images/${storageKey}`;

  return {
    storageKey,
    url: publicUrl,
    filename: originalFilename,
    mimeType,
    size: buffer.length,
  };
}
