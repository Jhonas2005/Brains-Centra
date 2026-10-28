import crypto from 'node:crypto';

export const CODE_TTL_MINUTES = 15;
export const MAX_ATTEMPTS = 5;

/** 8 digits, zero-padded, cryptographically random. */
export function generateCode() {
  return String(crypto.randomInt(0, 100000000)).padStart(8, '0');
}

/**
 * Keyed hash. Keying with the service role key means the stored digest is
 * useless to anyone who only has the database row — a bare sha256 of an
 * 8-digit number is brute-forceable in seconds.
 */
function hmacKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to hash admin codes.');
  return key;
}

export function hashCode(userId, code) {
  return crypto.createHmac('sha256', hmacKey()).update(`${userId}:${code}`).digest('hex');
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function expiresAt() {
  return new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();
}

export function normalizeCode(value) {
  return String(value ?? '').replace(/\D/g, '');
}
