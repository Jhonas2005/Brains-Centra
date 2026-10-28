import nodemailer from 'nodemailer';

let transporter;

export function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Reuse connections during campaign blasts: opening a fresh TLS
      // connection per recipient makes a 500-email send crawl.
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  }
  return transporter;
}

export const MAIL_FROM =
  process.env.SMTP_FROM || '"Brains Central Command" <hello@brains.asia>';

export async function sendMail({ to, subject, html, text, replyTo, attachments }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials are not configured (SMTP_USER / SMTP_PASS).');
  }

  return getTransporter().sendMail({
    from: MAIL_FROM,
    to,
    replyTo: replyTo || 'replies@inbound.brains.asia',
    subject,
    html,
    text,
    ...(attachments?.length ? { attachments } : {}),
  });
}
