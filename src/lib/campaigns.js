import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/** Hard ceiling per campaign so one click cannot burn the SMTP quota. */
export const MAX_RECIPIENTS = Number(process.env.CAMPAIGN_MAX_RECIPIENTS || 500);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function isEmail(value) {
  return EMAIL_RE.test(value);
}

function unsubscribeSignature(email) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return crypto.createHmac('sha256', key).update(`unsubscribe:${email}`).digest('base64url');
}

export function unsubscribeUrl(email) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://brains.asia';
  return `${base}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeSignature(email)}`;
}

export function verifyUnsubscribe(email, token) {
  const expected = Buffer.from(unsubscribeSignature(normalizeEmail(email)));
  const actual = Buffer.from(String(token ?? ''));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

/**
 * Builds the two mailing lists:
 *   customers -> profiles with role 'customer'
 *   prospects -> everyone who submitted an inquiry but has no account
 *
 * Both are de-duplicated (case-insensitive) and exclude anyone who opted out.
 * Admins are never included: staff should not receive their own blast.
 */
export async function resolveAudience() {
  const [{ data: profiles }, { data: inquiries }, { data: suppressed }] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, email, company, role')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('inquiries')
      .select('name, email, company, type, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('email_suppressions').select('email'),
  ]);

  const blocked = new Set((suppressed || []).map((row) => normalizeEmail(row.email)));
  const known = new Set();
  const customerEmails = new Set();
  const customers = [];

  for (const profile of profiles || []) {
    const email = normalizeEmail(profile.email);
    if (!isEmail(email)) continue;
    known.add(email);

    if (profile.role !== 'customer' || blocked.has(email) || customerEmails.has(email)) continue;
    customerEmails.add(email);

    customers.push({
      email,
      name: [profile.first_name, profile.last_name].filter(Boolean).join(' '),
      company: profile.company || '',
      kind: 'customer',
      source: 'Account',
    });
  }

  const prospects = [];
  for (const inquiry of inquiries || []) {
    const email = normalizeEmail(inquiry.email);
    if (!isEmail(email) || known.has(email) || blocked.has(email)) continue;

    known.add(email);
    prospects.push({
      email,
      name: inquiry.name || '',
      company: inquiry.company || '',
      kind: 'prospect',
      source: inquiry.type || 'Inquiry',
    });
  }

  return { customers, prospects };
}
