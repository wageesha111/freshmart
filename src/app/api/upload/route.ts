import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { supabaseAdmin, isSupabaseConfigured, MISSING_SERVICE_KEY_ERROR } from '@/lib/supabase';
import { forbiddenAdmin, isAdmin } from '@/lib/session';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'product-images';

/** Detect the image type from the file's first bytes (don't trust the name or browser MIME type). */
function detectImageType(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: '.jpg', mime: 'image/jpeg' };
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { ext: '.png', mime: 'image/png' };
  if (buf.length >= 6 && (buf.subarray(0, 6).toString('ascii') === 'GIF87a' || buf.subarray(0, 6).toString('ascii') === 'GIF89a'))
    return { ext: '.gif', mime: 'image/gif' };
  if (buf.length >= 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP')
    return { ext: '.webp', mime: 'image/webp' };
  return null;
}

// POST /api/upload -> upload a product image (admin only)
export async function POST(request: Request) {
  if (!isAdmin(request)) return forbiddenAdmin();

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'Image must be 5 MB or smaller' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = detectImageType(buffer);
    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Only JPG, PNG, WEBP or GIF images are allowed' },
        { status: 415 }
      );
    }

    const fileName = `${Date.now()}_${randomUUID().slice(0, 8)}${type.ext}`;

    // Production: store in Supabase Storage (the server filesystem is read-only on hosts like Vercel)
    if (supabaseAdmin) {
      let { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(fileName, buffer, { contentType: type.mime, upsert: false });

      if (error && /bucket not found/i.test(error.message)) {
        await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
        ({ error } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(fileName, buffer, { contentType: type.mime, upsert: false }));
      }
      if (error) throw error;

      const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
      return NextResponse.json({ success: true, url: data.publicUrl, fileName });
    }

    if (isSupabaseConfigured) {
      return NextResponse.json({ success: false, error: MISSING_SERVICE_KEY_ERROR }, { status: 500 });
    }

    // Local demo mode: save to public/uploads (works with `npm run dev` only)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ success: true, url: `/uploads/${fileName}`, fileName });
  } catch (error: any) {
    console.error('API /api/upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 });
  }
}
