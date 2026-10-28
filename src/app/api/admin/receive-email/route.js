import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/** Providers post either JSON or multipart/form-data, with varying field names. */
async function readInbound(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const j = await request.json();
    return {
      to: j.to || j.To || j.recipient || j.envelope?.to?.[0] || '',
      from: j.from || j.From || j.sender || '',
      subject: j.subject || j.Subject || 'No Subject',
      text: j.text || j.plain || j.TextBody || j['body-plain'] || '',
      messageId: j['message-id'] || j.MessageID || j.messageId || null,
    };
  }

  const fd = await request.formData();
  return {
    to: String(fd.get('to') || fd.get('To') || fd.get('recipient') || fd.get('envelope-to') || ''),
    from: String(fd.get('from') || fd.get('From') || fd.get('sender') || ''),
    subject: String(fd.get('subject') || fd.get('Subject') || 'No Subject'),
    text: String(fd.get('text') || fd.get('body-plain') || fd.get('stripped-text') || ''),
    messageId: fd.get('Message-Id') || fd.get('message-id') || null,
  };
}

function parseAddress(raw) {
  const match = String(raw || '').match(/<([^>]+)>/);
  const email = (match ? match[1] : String(raw || '')).trim().toLowerCase();
  const name = String(raw || '').split('<')[0].trim().replace(/^"|"$/g, '');
  return { email, name };
}

/**
 * Inbound webhook.
 *
 * Admin replies go out with Reply-To: reply+<inquiryId>@inbound.brains.asia,
 * so a customer hitting Reply routes straight back into the same thread.
 * If the token is missing (forwarded mail, a different reply client), we fall
 * back to matching the sender address against the most recent open inquiry.
 */
export async function POST(request) {
  try {
    const payload = await readInbound(request);
    const { email: customerEmail, name: customerName } = parseAddress(payload.from);
    const subject = String(payload.subject || 'No Subject');

    if (!customerEmail) {
      return NextResponse.json({ success: false, error: 'No sender address' }, { status: 400 });
    }

    // Providers retry; don't double-store the same message.
    if (payload.messageId) {
      const { data: existing } = await supabaseAdmin
        .from('inquiry_messages')
        .select('id')
        .eq('message_id', String(payload.messageId))
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ success: true, duplicate: true });
      }
    }

    const tokenMatch = String(payload.to || '').match(/reply\+([^@\s>]+)@/i);
    let inquiry = null;

    if (tokenMatch) {
      const { data } = await supabaseAdmin
        .from('inquiries')
        .select('*')
        .eq('id', tokenMatch[1])
        .maybeSingle();
      inquiry = data;
    }

    if (!inquiry) {
      const { data } = await supabaseAdmin
        .from('inquiries')
        .select('*')
        .eq('email', customerEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      inquiry = data;
    }

    // Genuinely new conversation: record it as a fresh request.
    if (!inquiry) {
      const { data: created, error: createError } = await supabaseAdmin
        .from('inquiries')
        .insert([{
          type: 'Email Reply',
          subject: subject.replace(/^(re|fwd):\s*/i, ''),
          name: customerName || 'Customer',
          email: customerEmail,
          company: 'From Inbox',
          details: payload.text,
          status: 'Pending',
        }])
        .select()
        .single();

      if (createError) throw createError;

      await supabaseAdmin.from('inquiry_messages').insert([{
        inquiry_id: String(created.id),
        direction: 'inbound',
        subject,
        body: payload.text || '(empty message)',
        from_email: customerEmail,
        to_email: String(payload.to || ''),
        message_id: payload.messageId ? String(payload.messageId) : null,
      }]);

      return NextResponse.json({ success: true, inquiryId: created.id, matched: false });
    }

    const { error: insertError } = await supabaseAdmin
      .from('inquiry_messages')
      .insert([{
        inquiry_id: String(inquiry.id),
        direction: 'inbound',
        subject,
        body: payload.text || '(empty message)',
        from_email: customerEmail,
        to_email: String(payload.to || ''),
        message_id: payload.messageId ? String(payload.messageId) : null,
      }]);

    if (insertError) throw insertError;

    // A customer replied, so this needs the admin's attention again.
    const { error: statusError } = await supabaseAdmin
      .from('inquiries')
      .update({ status: 'Pending' })
      .eq('id', inquiry.id);

    if (statusError) throw statusError;

    return NextResponse.json({ success: true, inquiryId: inquiry.id, matched: true });
  } catch (error) {
    console.error('Inbound Email Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
