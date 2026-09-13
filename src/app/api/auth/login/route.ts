import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import { comparePassword, createSessionToken } from '@/lib/security/auth';
import { checkRateLimit, checkLoginLockout, recordFailedLogin, resetFailedLogin } from '@/lib/security/sanitizer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    // 1. IP-level Rate Limit: max 5 login requests per minute
    const rateCheck = checkRateLimit(`login_${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan login. Silakan coba kembali 1 menit lagi.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Nama akun dinas dan kata sandi wajib diisi' }, { status: 400 });
    }

    const cleanUsername = String(username).trim().toLowerCase();

    // 2. IP Lockout Check (Max 5 failed attempts within 15 minutes)
    const ipLockout = checkLoginLockout(`ip_${ip}`, 5, 15 * 60 * 1000);
    if (ipLockout.locked) {
      console.warn(`[SECURITY ALERT] IP ${ip} is locked out for ${ipLockout.remainingLockoutMinutes} minutes`);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login gagal dari perangkat ini. Akses dikunci sementara selama ${ipLockout.remainingLockoutMinutes} menit demi keamanan.` },
        { status: 429 }
      );
    }

    // 3. Username Lockout Check (Max 5 failed attempts within 15 minutes)
    const userLockout = checkLoginLockout(`user_${cleanUsername}`, 5, 15 * 60 * 1000);
    if (userLockout.locked) {
      console.warn(`[SECURITY ALERT] Username "${cleanUsername}" is locked out for ${userLockout.remainingLockoutMinutes} minutes`);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login gagal untuk akun "${cleanUsername}". Akun dikunci sementara selama ${userLockout.remainingLockoutMinutes} menit demi keamanan.` },
        { status: 429 }
      );
    }

    // 4. Fetch admin user
    const admin = (mysqlAdapter.isConfigured() ? await mysqlAdapter.getAdminByUsername(cleanUsername) : null) || db.findAdminByUsername(cleanUsername);

    // Uniform 401 response and failure tracking (OWASP: Prevents username enumeration & brute-force)
    if (!admin) {
      const attemptsIp = recordFailedLogin(`ip_${ip}`);
      const attemptsUser = recordFailedLogin(`user_${cleanUsername}`);
      db.recordAuditLog('unknown', cleanUsername, 'LOGIN_FAILED', `Akun tidak ditemukan (Percobaan gagal #${attemptsUser})`, ip);
      console.warn(`[SECURITY AUDIT] Failed login (user not found) for "${cleanUsername}" from IP ${ip} (Attempt: ${attemptsIp})`);
      return NextResponse.json({ error: 'Kombinasi akun atau kata sandi dinas tidak valid' }, { status: 401 });
    }

    // 5. Verify bcrypt password hash
    const isMatch = comparePassword(password, admin.password_hash);
    if (!isMatch) {
      const attemptsIp = recordFailedLogin(`ip_${ip}`);
      const attemptsUser = recordFailedLogin(`user_${cleanUsername}`);
      db.recordAuditLog(admin.id, cleanUsername, 'LOGIN_FAILED', `Kata sandi salah (Percobaan gagal #${attemptsUser})`, ip);
      console.warn(`[SECURITY AUDIT] Failed login (bad password) for "${cleanUsername}" from IP ${ip} (Attempt: ${attemptsIp})`);
      return NextResponse.json({ error: 'Kombinasi akun atau kata sandi dinas tidak valid' }, { status: 401 });
    }

    // 6. Successful login: reset lockout counters
    resetFailedLogin(`ip_${ip}`);
    resetFailedLogin(`user_${cleanUsername}`);

    // Create secure HMAC session token
    const token = createSessionToken(admin, 8);

    db.recordAuditLog(admin.id, cleanUsername, 'LOGIN_SUCCESS', `Login berhasil sebagai ${admin.role}`, ip);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: admin.id,
        username: admin.username,
        nama: admin.nama,
        role: admin.role
      }
    });

    // Set HTTPOnly Cookie
    response.cookies.set({
      name: 'tni_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 3600,
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('[API Login] System error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat login' }, { status: 500 });
  }
}
