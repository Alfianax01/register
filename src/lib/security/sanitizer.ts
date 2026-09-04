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

