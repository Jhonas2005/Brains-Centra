import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdmin } from '@/lib/requireAdmin';

// Vercel caps serverless request bodies at 4.5 MB; stay under it.
const MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(request) {
  const { error, status } = await getAdmin(request);
  if (error) return NextResponse.json({ message: error }, { status });

  try {
    const form = await request.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No image was uploaded.' }, { status: 400 });
    }

    const extension = ALLOWED[file.type];
    if (!extension) {
      return NextResponse.json(
        { message: 'Use a JPG, PNG, WebP, or GIF image.' },
        { status: 415 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: 'Images must be 4 MB or smaller.' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `campaigns/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('email-assets')
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabaseAdmin.storage.from('email-assets').getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    console.error('Campaign image upload error:', err);
    return NextResponse.json(
      {
        message:
          err.message ||
          'Upload failed. Make sure the email-assets bucket exists (run supabase-email-campaigns.sql).',
      },
      { status: 500 }
    );
  }
}
