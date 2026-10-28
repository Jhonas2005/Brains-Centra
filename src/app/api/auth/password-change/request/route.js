import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail } from '@/lib/mailer';
import { passwordChangeCodeEmail } from '@/lib/emailTemplates';
import {
  generateCode,
  hashCode,
  sealPassword,
  expiresAt,
  CODE_LENGTH,
} from '@/lib/passwordChange';
import { CODE_TTL_MINUTES } from '@/lib/adminVerification';

async function getUserFromRequest(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { error: 'Not authenticated.' };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: 'Invalid or expired session.' };
  return { user: data.user };
}

/**
 * Step 1 of the password change: stash the new password (encrypted) and email
 * an 8-digit code. Nothing is applied until /confirm succeeds, so an attacker
 * with a stolen session still cannot change the password on their own.
 */
export async function POST(req) {
  try {
    const { user, error } = await getUserFromRequest(req);
    if (error) return NextResponse.json({ message: error }, { status: 401 });

    if (!user.email) {
      return NextResponse.json({ message: 'This account has no email address.' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const password = String(body.password ?? '');

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Supabase (bcrypt) silently truncates beyond 72 bytes; reject instead.
    if (Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json({ message: 'Password must be 72 characters or fewer.' }, { status: 400 });
    }

    if (password.toLowerCase() === String(user.email).toLowerCase()) {
      return NextResponse.json({ message: 'Password cannot be your email address.' }, { status: 400 });
    }

    const code = generateCode();

    const { error: upsertError } = await supabaseAdmin
      .from('password_change_verification')
      .upsert(
        {
          user_id: user.id,
          code_hash: hashCode(user.id, code),
          pending_secret: sealPassword(password),
          expires_at: expiresAt(),
          attempts: 0,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) throw upsertError;

    const mail = passwordChangeCodeEmail({
      email: user.email,
      code,
      expiresIn: `${CODE_TTL_MINUTES} minutes`,
    });

    await sendMail({ to: user.email, ...mail });

    return NextResponse.json({
      success: true,
      email: user.email,
      codeLength: CODE_LENGTH,
      expiresInMinutes: CODE_TTL_MINUTES,
    });
  } catch (err) {
    console.error('Password change request error:', err);
    return NextResponse.json(
      { message: 'Could not send the verification code. Please try again.' },
      { status: 500 }
    );
  }
}
