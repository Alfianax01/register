import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, createSessionToken } from '@/lib/security/auth';
import { checkRateLimit } from '@/lib/security/sanitizer';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    // Rate limit: max 5 login attempts per minute (OWASP 9.1)
    const rateCheck = checkRateLimit(`login_${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login yang gagal. Silakan coba kembali 1 menit lagi.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const admin = db.findAdminByUsername(username);
    if (!admin) {
      return NextResponse.json({ error: 'Kombinasi akun atau kata sandi dinas tidak valid' }, { status: 401 });
    }

    const isMatch = comparePassword(password, admin.password_hash);
    if (!isMatch) {
      db.recordAuditLog(admin.id, username, 'LOGIN_FAILED', 'Percobaan kata sandi salah', ip);
      return NextResponse.json({ error: 'Kombinasi akun atau kata sandi dinas tidak valid' }, { status: 401 });
    }

    // Create session token
    const token = createSessionToken(admin, 8);

    db.recordAuditLog(admin.id, username, 'LOGIN_SUCCESS', `Login berhasil sebagai ${admin.role}`, ip);

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

    // Set HTTPOnly cookie (OWASP 9.1)
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
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan sistem saat login' }, { status: 500 });
  }
}

