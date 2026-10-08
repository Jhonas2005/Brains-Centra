import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// IT MUST BE 'export async function POST' (all caps)
export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, message, attachment } = body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        // This will now use the credentials from your .env.local file
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, 
      },
    });

    const mailOptions = {
      from: '"Brains Central Command" <hello@brains.asia>',
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-w-2xl; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #4f46e5;">Brains Infinite Innovations</h2>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    };

    if (attachment) {
      mailOptions.attachments = [
        {
          filename: attachment.filename,
          content: attachment.base64Content,
          encoding: 'base64',
        },
      ];
    }

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email Sending Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}