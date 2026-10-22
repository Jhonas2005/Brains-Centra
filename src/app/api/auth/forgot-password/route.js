import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail } from '@/lib/mailer';

// Always answer the same way so the endpoint can't be used to discover
// which email addresses have accounts.
const GENERIC_MESSAGE =
  'If that email is registered, a reset code and link are on their way.';

function buildEmail({ email, code, link }) {
  const html = `
<div style="background:#090b14;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#13172e;border:1px solid #312e81;border-radius:16px;padding:32px;color:#e0e7ff;">
    <h2 style="margin:0 0 10px;color:#ffffff;font-size:20px;">Reset your password</h2>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#a5b4fc;">
      We received a request to reset the password for
      <strong style="color:#ffffff;">${email}</strong>.
    </p>

    <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#818cf8;font-weight:bold;">
      Your verification code
    </p>
    <div style="background:#090b14;border:1px solid #4c1d95;border-radius:12px;padding:18px;text-align:center;">
      <span style="font-family:Consolas,monospace;font-size:30px;font-weight:bold;letter-spacing:10px;color:#e879f9;">${code}</span>
    </div>

    <p style="margin:26px 0 12px;font-size:14px;color:#a5b4fc;">
      Or skip the code and use the secure link below:
    </p>
    <a href="${link}" style="display:block;text-align:center;background:#c026d3;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px;border-radius:12px;font-size:14px;">
      Reset My Password
    </a>

    <p style="margin:26px 0 0;font-size:12px;line-height:1.7;color:#6366f1;">
      This code and link expire in 1 hour and can each be used only once.
      If you did not request this, you can safely ignore this email — your password will not change.
    </p>
  </div>
</div>`;

  const text = [
    'Reset your Brains Central Command password',
    '',
    `Verification code: ${code}`,
    '',
    `Or open this link: ${link}`,
    '',
    'This code and link expire in 1 hour and can each be used only once.',
    'If you did not request this, ignore this email — your password will not change.',
  ].join('\n');

  return { html, text };
}

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co')) {
      return NextResponse.json(
        { message: 'Server configuration error: Supabase is not configured.' },
        { status: 500 }
      );
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    // generateLink produces BOTH a clickable recovery link and a 6-digit
    // code for the same one-time token. Supabase does not send anything
    // itself here — we deliver it through our own SMTP so the email is branded.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim().toLowerCase(),
      options: { redirectTo: `${origin}/update-password` },
    });

    if (error || !data?.properties?.email_otp) {
      // Unknown user, rate limit, etc. Never reveal which one it was.
      console.error('generateLink failed:', error?.message || 'missing properties');
      return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
    }

    const { action_link: link, email_otp: code } = data.properties;

    const { html, text } = buildEmail({ email, code, link });

    await sendMail({
      to: email,
      subject: `${code} is your Brains Central Command reset code`,
      html,
      text,
    });

    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json(
      { message: 'We could not send the reset email right now. Please try again shortly.' },
      { status: 500 }
    );
  }
}
