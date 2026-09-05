import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { AdminUser, AdminRole } from '@/types';
import { SESSION_SECRET, SESSION_COOKIE_NAME, verifySessionEdge, SessionPayload } from './session';

export { SESSION_SECRET, SESSION_COOKIE_NAME, verifySessionEdge };
export type { SessionPayload };

/**
 * Generate HMAC signed session token
 */
export function createSessionToken(user: AdminUser, durationHours: number = 8): string {
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    nama: user.nama,
    role: user.role,
    expiresAt: Date.now() + durationHours * 3600 * 1000
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify HMAC signed session token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [payloadBase64, signature] = token.split('.');

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'));
    if (Date.now() > payload.expiresAt) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Compare password
 */
export function comparePassword(plaintext: string, hash: string): boolean {
  return bcrypt.compareSync(plaintext, hash);
}

/**
 * Hash password
 */
export function hashPassword(plaintext: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plaintext, salt);
}

