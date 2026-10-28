import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashCode, safeEqual, normalizeCode, MAX_ATTEMPTS } from '@/lib/adminVerification';

async function getUserFromRequest(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return { error: 'Not authenticated.' };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return { error: 'Invalid or expired session.' };
  return { user: data.user };
}

/**
 * GET -> does this admin still owe us a one-time code?
 * A missing row means the account predates this feature, so it is treated
 * as already verified rather than locking existing admins out.
 */
export async function GET(req) {
  try {
    const { user, error } = await getUserFromRequest(req);
    if (error) return NextResponse.json({ message: error }, { status: 401 });

    const { data: pending } = await supabaseAdmin
      .from('admin_verification')
      .select('verified_at')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      requiresVerification: !!pending && !pending.verified_at,
      verified: !pending || !!pending.verified_at,
    });
  } catch (err) {
    console.error('Admin status error:', err);
    return NextResponse.json({ message: 'Could not check verification status.' }, { status: 500 });
  }
}

/** POST -> exchange the emailed code for a verified admin session. */
export async function POST(req) {
  try {
    const { user, error } = await getUserFromRequest(req);
    if (error) return NextResponse.json({ message: error }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = normalizeCode(body.code);

    if (code.length < 6 || code.length > 10) {
      return NextResponse.json({ message: 'Enter the code from your email.' }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ message: 'This account is not an administrator.' }, { status: 403 });
    }

    const { data: pending, error: lookupError } = await supabaseAdmin
      .from('admin_verification')
      .select('code_hash, expires_at, attempts, verified_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (lookupError) throw lookupError;

    if (!pending) {
      return NextResponse.json({ verified: true, message: 'Already verified.' }, { status: 200 });
    }

    if (pending.verified_at) {
      return NextResponse.json({ verified: true, message: 'Already verified.' }, { status: 200 });
    }

    if (new Date(pending.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { message: 'That code has expired. Ask an administrator to re-send your access code.' },
        { status: 410 }
      );
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { message: 'Too many incorrect attempts. Ask an administrator to re-send your access code.' },
        { status: 429 }
      );
    }

    const matches = safeEqual(hashCode(user.id, code), pending.code_hash);

    if (!matches) {
      const attempts = pending.attempts + 1;
      await supabaseAdmin
        .from('admin_verification')
        .update({ attempts })
        .eq('user_id', user.id);

      const left = MAX_ATTEMPTS - attempts;
      return NextResponse.json(
        {
          message:
            left > 0
              ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`
              : 'Too many incorrect attempts. Ask an administrator to re-send your access code.',
        },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('admin_verification')
      .update({ verified_at: new Date().toISOString(), attempts: 0 })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ verified: true, message: 'Access code accepted.' }, { status: 200 });
  } catch (err) {
    console.error('Verify admin code error:', err);
    return NextResponse.json({ message: 'Could not verify the code.' }, { status: 500 });
  }
}
