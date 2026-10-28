import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/mailer';
import { getAdmin } from '@/lib/requireAdmin';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]);
}

// Admin-only: this used to be an open endpoint, which let anyone send mail
// that appeared to come from hello@brains.asia.
export async function POST(request) {
  const { error, status } = await getAdmin(request);
  if (error) return NextResponse.json({ error }, { status });

  try {
    const body = await request.json();
    const { to, subject, message, attachment } = body;

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'to, subject and message are required' },
        { status: 400 }
      );
    }

    const attachments = attachment?.base64Content
      ? [{
          filename: attachment.filename,
          content: attachment.base64Content,
          encoding: 'base64',
        }]
      : undefined;

    await sendMail({
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 640px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Brains Infinite Innovations</h2>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        </div>
      `,
      attachments,
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email Sending Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
