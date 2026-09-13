/**
 * Escape HTML special characters to prevent XSS attacks (OWASP 9.2)
 */
export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate military NRP or official employee ID
 * Allows 5-18 digits / alphanumeric for TNI officers, enlisted, and civilian defense personnel
 */
export function isValidNRP(nrp: any): boolean {
  if (nrp === null || nrp === undefined) return false;
  const clean = String(nrp).trim().replace(/[\s\-\.]/g, '');
  return /^[0-9A-Za-z]{5,20}$/.test(clean);
}

/**
 * Validate Indonesian phone number format (starts with 08 or +62)
 */
export function isValidPhone(phone: any): boolean {
  if (phone === null || phone === undefined) return false;
  const clean = String(phone).trim().replace(/[\s\-\(\)\+]/g, '');
  return /^(62|08)[0-9]{8,14}$/.test(clean);
}

/**
 * In-memory sliding window rate limiter
 * Prevents flood/DoS and brute force attempts (OWASP 9.1 & 9.2)
 */
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip) || { timestamps: [] };

  // Filter timestamps within the current window
  const validTimestamps = record.timestamps.filter(ts => now - ts < windowMs);
  
  if (validTimestamps.length >= limit) {
    return { allowed: false, remaining: 0 };
  }

  validTimestamps.push(now);
  rateLimitStore.set(ip, { timestamps: validTimestamps });

  return { allowed: true, remaining: limit - validTimestamps.length };
}

/**
 * Dedicated Failed Login Lockout Tracker
 * Tracks failed login attempts by IP or Username over a specified window (default 15 minutes).
 */
const failedLoginStore = new Map<string, number[]>();

export function checkLoginLockout(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): { locked: boolean; remainingLockoutMinutes: number } {
  const now = Date.now();
  const timestamps = (failedLoginStore.get(identifier) || []).filter(ts => now - ts < windowMs);
  failedLoginStore.set(identifier, timestamps);

  if (timestamps.length >= maxAttempts) {
    const oldest = timestamps[0];
    const remainingMs = (oldest + windowMs) - now;
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
    return { locked: true, remainingLockoutMinutes: remainingMinutes };
  }

  return { locked: false, remainingLockoutMinutes: 0 };
}

export function recordFailedLogin(identifier: string, windowMs: number = 15 * 60 * 1000): number {
  const now = Date.now();
  const timestamps = (failedLoginStore.get(identifier) || []).filter(ts => now - ts < windowMs);
  timestamps.push(now);
  failedLoginStore.set(identifier, timestamps);
  return timestamps.length;
}

export function resetFailedLogin(identifier: string): void {
  failedLoginStore.delete(identifier);
}
