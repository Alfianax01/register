import crypto from 'crypto';

/**
 * Generate cryptographically secure unguessable UUID v4 token
 * Sesuai Bab 9.3: Token QR harus random & unguessable, BUKAN NRP mentah atau auto-increment
 */
export function generateSecureToken(): string {
  return crypto.randomUUID();
}

/**
 * Generate SHA-256 hash of the token
 * Sesuai Bab 9.3: Simpan token di-hash di database mirip API key
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * Verify token against stored SHA-256 hash using constant-time comparison
 */
export function verifyTokenHash(token: string, storedHash: string): boolean {
  const computedHash = hashToken(token);
  if (computedHash.length !== storedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash));
}

