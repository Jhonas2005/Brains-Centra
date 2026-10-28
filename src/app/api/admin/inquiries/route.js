import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail } from '@/lib/mailer';
import { adminReplyEmail } from '@/lib/emailTemplates';

const REPLY_DOMAIN = process.env.INBOUND_REPLY_DOMAIN || 'inbound.brains.asia';

/**
 * Per-inquiry Reply-To address. When the customer hits Reply, the mail lands
 * on this alias and the inbound webhook routes it back to the same thread.
 */
function replyAddress(inquiryId) {
  return `reply+${inquiryId}@${REPLY_DOMAIN}`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single thread
    if (id) {
      const { data, error } = await supabaseAdmin
        .from('inquiry_messages')
        .select('*')
        .eq('inquiry_id', String(id))
        .order('created_at', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ messages: data || [] });
    }

    // All inquiries + thread stats
    const { data, error } = await supabaseAdmin
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Used to tell an existing customer apart from a brand-new prospect.
    const [{ data: messages }, { data: profiles }] = await Promise.all([
      supabaseAdmin
        .from('inquiry_messages')
        .select('inquiry_id, created_at, direction'),
      supabaseAdmin
        .from('profiles')
        .select('email, first_name, last_name, company, role'),
    ]);

    const accounts = new Map();
    for (const profile of profiles || []) {
      const key = String(profile.email || '').trim().toLowerCase();
      if (key) accounts.set(key, profile);
    }

    const stats = new Map();
    for (const msg of messages || []) {
      const key = String(msg.inquiry_id);
      const entry = stats.get(key) || { count: 0, lastAt: null, lastDirection: null };
      entry.count += 1;
      if (!entry.lastAt || new Date(msg.created_at) > new Date(entry.lastAt)) {
        entry.lastAt = msg.created_at;
        entry.lastDirection = msg.direction;
      }
      stats.set(key, entry);
    }

    const inquiries = (data || []).map((inq) => {
      const stat = stats.get(String(inq.id));
      const account = accounts.get(String(inq.email || '').trim().toLowerCase()) || null;

      return {
        ...inq,
        message_count: stat?.count || 0,
        last_message_at: stat?.lastAt || null,
        // Last word was the customer's -> the admin still owes a reply.
        awaiting_reply: stat?.lastDirection === 'inbound',
        // Existing customer (has an account) vs potential customer (no account).
        is_customer: account?.role === 'customer',
        account_name: account
          ? [account.first_name, account.last_name].filter(Boolean).join(' ')
          : null,
      };
    });

    return NextResponse.json({ inquiries });
  } catch (error) {
    console.error('Fetch Inquiries Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, id, newStatus } = body;

    if (action === 'updateStatus') {
      const { error } = await supabaseAdmin
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      // No FK to cascade from, so clear the thread explicitly.
      const { error: msgError } = await supabaseAdmin
        .from('inquiry_messages')
        .delete()
        .eq('inquiry_id', String(id));
      if (msgError) throw msgError;

      const { error } = await supabaseAdmin
        .from('inquiries')
        .delete()
        .eq('id', id);
      if (error) throw error;

      return NextResponse.json({ success: true });
    }

    // Reply from the dashboard: send the email AND record it in the thread.
    if (action === 'reply') {
      const { inquiryId, subject, message, attachment, sentBy } = body;

      if (!inquiryId || !message?.trim()) {
        return NextResponse.json({ error: 'inquiryId and message are required' }, { status: 400 });
      }

      const { data: inquiry, error: lookupError } = await supabaseAdmin
        .from('inquiries')
        .select('*')
        .eq('id', inquiryId)
        .single();

      if (lookupError || !inquiry) {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
      }

      if (!inquiry.email) {
        return NextResponse.json({ error: 'This inquiry has no email address' }, { status: 400 });
      }

      const finalSubject = subject?.trim() || `Re: ${inquiry.subject}`;

      const attachments = attachment?.base64Content
        ? [{ filename: attachment.filename, content: attachment.base64Content, encoding: 'base64' }]
        : undefined;

      await sendMail({
        to: inquiry.email,
        ...adminReplyEmail({
          customerName: inquiry.name,
          subject: finalSubject,
          body: message,
        }),
        replyTo: replyAddress(inquiry.id),
        attachments,
      });

      // The email is already out the door at this point. A bookkeeping failure
      // must not surface as "failed to send" or the admin will resend it.
      let warning;
      try {
        const { error: insertError } = await supabaseAdmin
          .from('inquiry_messages')
          .insert([{
            inquiry_id: String(inquiry.id),
            direction: 'outbound',
            subject: finalSubject,
            body: message,
            from_email: process.env.SMTP_FROM || 'hello@brains.asia',
            to_email: inquiry.email,
            sent_by: sentBy || 'admin',
          }]);

        if (insertError) throw insertError;

        const { error: statusError } = await supabaseAdmin
          .from('inquiries')
          .update({ status: 'Contacted' })
          .eq('id', inquiryId);

        if (statusError) throw statusError;
      } catch (recordError) {
        console.error('Reply sent but not recorded in the thread:', recordError);
        warning = 'Email sent, but the thread history could not be saved. Did you run supabase-inquiry-threads.sql?';
      }

      return NextResponse.json({ success: true, status: 'Contacted', warning });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Mutate Inquiry Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
