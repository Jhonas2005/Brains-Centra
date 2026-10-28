import crypto from 'node:crypto';
import { hashCode, safeEqual, normalizeCode, expiresAt } from '@/lib/adminVerification';

export { hashCode, safeEqual, normalizeCode, expiresAt };

export const CODE_LENGTH = 8;

/**
 * 8 digits, zero-padded, cryptographically random.
 * Matches the admin access code format so the UI copy stays consistent.
 */
export function generateCode() {
  return String(crypto.randomInt(0, 100000000)).padStart(CODE_LENGTH, '0');
}

/**
 * Derives a 32-byte AES key. A dedicated PASSWORD_CHANGE_SECRET is preferred;
 * the service role key is used as a fallback so existing deployments keep
 * working without a new env var.
 */
function encryptionKey() {
  const secret = process.env.PASSWORD_CHANGE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error('PASSWORD_CHANGE_SECRET or SUPABASE_SERVICE_ROLE_KEY is required to store pending passwords.');
  }
  return crypto.createHash('sha256').update(`${secret}:password-change`).digest();
}

/** Encrypts the new password so it can sit at rest until the code is confirmed. */
export function sealPassword(password) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
  };
}

export function openPassword(sealed) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    encryptionKey(),
    Buffer.from(sealed.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(sealed.tag, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(sealed.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
