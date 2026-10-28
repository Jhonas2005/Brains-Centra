import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail } from '@/lib/mailer';
import { passwordChangedEmail } from '@/lib/emailTemplates';

/**
 * Sends the "password changed" confirmation.
 *
 * The caller must supply the access token of the user whose password just
 * changed, and the email always goes to the address on that verified session.
 * This replaces the previous /api/admin/send-email call, which accepted an
 * arbitrary recipient from anyone and could be used as an open relay.
 */
export async function POST(req) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user?.email) {
      return NextResponse.json({ message: 'Invalid or expired session.' }, { status: 401 });
    }

    const mail = passwordChangedEmail({
      email: data.user.email,
      changedAt: new Date().toUTCString(),
    });

    await sendMail({ to: data.user.email, ...mail });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Password-changed email error:', err);
    return NextResponse.json({ message: 'Could not send confirmation email.' }, { status: 500 });
  }
}
