import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { normalizeEmail, isEmail, verifyUnsubscribe } from '@/lib/campaigns';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}

function page(title, message, ok) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Brains Infinite Innovations</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#090b14;font-family:Arial,Helvetica,sans-serif;padding:24px;">
  <div style="max-width:460px;width:100%;background:#13172e;border:1px solid ${ok ? '#10b98155' : '#ef444455'};border-radius:16px;padding:32px;text-align:center;">
    <div style="font-size:17px;font-weight:800;letter-spacing:4px;color:#ffffff;">BRAINS</div>
    <div style="margin-top:4px;font-size:9px;font-weight:700;letter-spacing:2.5px;color:#a21caf;">INFINITE INNOVATIONS</div>
    <h1 style="margin:24px 0 10px;font-size:20px;color:#ffffff;">${title}</h1>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#a5b4fc;">${message}</p>
  </div>
</body>
</html>`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = normalizeEmail(searchParams.get('e'));
  const token = searchParams.get('t');

  if (!isEmail(email) || !verifyUnsubscribe(email, token)) {
    return new NextResponse(
      page('Invalid link', 'This unsubscribe link is not valid. Contact hello@brains.asia and we will remove you manually.', false),
      { status: 400, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }

  try {
    await supabaseAdmin
      .from('email_suppressions')
      .upsert([{ email, reason: 'unsubscribe' }], { onConflict: 'email' });
  } catch (err) {
    console.error('Unsubscribe failed:', err);
    return new NextResponse(
      page('Something went wrong', 'We could not record your request. Please email hello@brains.asia and we will remove you manually.', false),
      { status: 500, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }

  return new NextResponse(
    page('You are unsubscribed', `${escapeHtml(email)} will no longer receive marketing emails from us. You will still receive account and billing messages.`, true),
    { headers: { 'content-type': 'text/html; charset=utf-8' } }
  );
}
