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
 * Get filesystem storage directory for residential uploads (Local development only)
 */
export function getResidentialStorageDir(): string {
  const dir = path.join(process.cwd(), 'public', 'uploads', 'residential');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Store user-uploaded residential image persistently
 * In production/Vercel: Strictly uploads to Supabase Storage 'residential-images' bucket.
 * Silently falling back to ephemeral /tmp storage is strictly prohibited in production.
 */
export async function storeResidentialImage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<StoredImageMetadata> {
  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const randomId = crypto.randomBytes(8).toString('hex');
  const storageKey = `res_${Date.now()}_${randomId}${ext}`;
  const isProductionVercel = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

  // Check if Supabase Storage credentials are provided
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY;

  const supabaseUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://hbongewkewhjovhfpxqb.supabase.co'
  ).replace(/\/$/, '');

  const bucketName = 'residential-images';

  if (supabaseKey) {
    try {
      const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${storageKey}`;
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
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${storageKey}`;
        return {
          storageKey,
          url: publicUrl,
          filename: path.basename(originalFilename),
          mimeType,
          size: buffer.length,
        };
      } else {
        const errText = await uploadRes.text();
        const errMsg = `Supabase Storage upload returned HTTP ${uploadRes.status}: ${errText}`;
        console.error(errMsg);
        if (isProductionVercel) {
          throw new Error(errMsg);
        }
      }
    } catch (supabaseErr: any) {
      console.error('Supabase storage upload error:', supabaseErr);
      if (isProductionVercel) {
        throw new Error(
          supabaseErr instanceof Error
            ? supabaseErr.message
            : 'Supabase Storage upload failed'
        );
      }
    }
  } else if (isProductionVercel) {
    // In Vercel production: DO NOT silently fall back to /tmp. Return clear server-side error.
    throw new Error(
      "Supabase Storage credentials missing: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured in Vercel environment. Ephemeral /tmp fallback is disabled in production."
    );
  }

  // Local development filesystem storage fallback ONLY
  const storageDir = getResidentialStorageDir();
  const filePath = path.join(storageDir, storageKey);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/uploads/residential/${storageKey}`;

  return {
    storageKey,
    url: publicUrl,
    filename: path.basename(originalFilename),
    mimeType,
    size: buffer.length,
  };
}
