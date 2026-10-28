import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail } from '@/lib/mailer';
import { passwordChangedEmail } from '@/lib/emailTemplates';
import { hashCode, safeEqual, normalizeCode, openPassword, CODE_LENGTH } from '@/lib/passwordChange';
import { MAX_ATTEMPTS } from '@/lib/adminVerification';

async function getUserFromRequest(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { error: 'Not authenticated.' };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: 'Invalid or expired session.' };
  return { user: data.user };
}

/**
 * Step 2: exchange the emailed code for an actual password change.
 * The password is applied with the admin API here, never from the browser.
 */
export async function POST(req) {
  try {
    const { user, error } = await getUserFromRequest(req);
    if (error) return NextResponse.json({ message: error }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = normalizeCode(body.code);

    if (code.length !== CODE_LENGTH) {
      return NextResponse.json(
        { message: `Enter the ${CODE_LENGTH}-digit code from your email.` },
        { status: 400 }
      );
    }

    const { data: pending, error: lookupError } = await supabaseAdmin
      .from('password_change_verification')
      .select('code_hash, pending_secret, expires_at, attempts')
      .eq('user_id', user.id)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!pending) {
      return NextResponse.json(
        { message: 'No pending password change. Start again.' },
        { status: 404 }
      );
    }

    if (new Date(pending.expires_at).getTime() < Date.now()) {
      await supabaseAdmin.from('password_change_verification').delete().eq('user_id', user.id);
      return NextResponse.json(
        { message: 'That code has expired. Request a new one.' },
        { status: 410 }
      );
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { message: 'Too many incorrect attempts. Request a new code.' },
        { status: 429 }
      );
    }

    if (!safeEqual(hashCode(user.id, code), pending.code_hash)) {
      const attempts = pending.attempts + 1;
      await supabaseAdmin
        .from('password_change_verification')
        .update({ attempts })
        .eq('user_id', user.id);

      const left = MAX_ATTEMPTS - attempts;
      return NextResponse.json(
        {
          message:
            left > 0
              ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`
              : 'Too many incorrect attempts. Request a new code.',
        },
        { status: 400 }
      );
    }

    let password;
    try {
      password = openPassword(pending.pending_secret);
    } catch {
      await supabaseAdmin.from('password_change_verification').delete().eq('user_id', user.id);
      return NextResponse.json(
        { message: 'That request is no longer valid. Start again.' },
        { status: 410 }
      );
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });

    if (updateError) throw updateError;

    // The change is committed; drop the pending secret before doing anything else.
    await supabaseAdmin.from('password_change_verification').delete().eq('user_id', user.id);

    if (user.email) {
      try {
        const mail = passwordChangedEmail({
          email: user.email,
          changedAt: new Date().toUTCString(),
        });
        await sendMail({ to: user.email, ...mail });
      } catch (mailErr) {
        console.error('Password-changed notice failed:', mailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Password change confirm error:', err);
    return NextResponse.json(
      { message: 'Could not update your password. Please try again.' },
      { status: 500 }
    );
  }
}
