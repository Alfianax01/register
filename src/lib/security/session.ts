import { AdminRole, AdminUser } from '@/types';

export const SESSION_SECRET = process.env.SESSION_SECRET || 'tni-event-super-secret-key-2026-cilangkap';
export const SESSION_COOKIE_NAME = 'tni_session';

export interface SessionPayload {
  userId: string;
  username: string;
  nama: string;
  role: AdminRole;
  expiresAt: number;
}

function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

/**
 * Universal Web Crypto HMAC session verifier (Runs in Edge Middleware & Node.js)
 */
export async function verifySessionEdge(token?: string | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) return null;

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify', 'sign']
    );

    const sigBytes = base64UrlToUint8Array(signature);
    const dataBytes = enc.encode(payloadBase64);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      dataBytes as unknown as BufferSource
    );
    if (!isValid) return null;

    const jsonStr = decodeBase64Url(payloadBase64);
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (!payload || !payload.expiresAt || Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
