import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/security/auth';
import { SESSION_COOKIE_NAME } from '@/lib/security/session';

export const dynamic = 'force-dynamic';

function getSession(req: NextRequest) {
  const token =
    req.cookies.get(SESSION_COOKIE_NAME)?.value ||
    req.cookies.get('session_token')?.value;
  return token ? verifySessionToken(token) : null;
}

export async function GET(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau telah berakhir.' }, { status: 401 });
    }

    const users = db.getUsers().map(u => ({
      id: u.id,
      nama: u.nama,
      username: u.username,
      email: u.email,
      role_id: u.role_id,
      role_name: u.role_name,
      is_active: u.is_active,
      created_at: u.created_at,
      updated_at: u.updated_at
    }));

    const roles = db.getRoles();

    return NextResponse.json({
      success: true,
      users,
      roles
    });
  } catch (err: any) {
    console.error('[API Users] GET error:', err);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau telah berakhir.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { nama, username, email, password, role_id, is_active } = body;

    if (!nama || !username || !password || !role_id) {
      return NextResponse.json({ error: 'Nama lengkap, username, kata sandi, dan peran (role) wajib diisi.' }, { status: 400 });
    }

    if (String(password).length < 6) {
      return NextResponse.json({ error: 'Kata sandi minimal harus terdiri dari 6 karakter.' }, { status: 400 });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const existing = db.getUserByUsername(cleanUsername);
    if (existing) {
      return NextResponse.json({ error: `Username "${cleanUsername}" sudah digunakan oleh pengguna lain.` }, { status: 409 });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(String(password), salt);

    const newUser = db.createUser({
      nama: String(nama).trim(),
      username: cleanUsername,
      email: email ? String(email).trim() : '',
      password_hash,
      role_id,
      is_active: is_active !== undefined ? Boolean(is_active) : true
    });

    db.recordAuditLog(
      session.userId,
      session.username,
      'USER_CREATE',
      `Menambahkan pengguna baru: ${newUser.nama} (${newUser.username}) dengan peran ${newUser.role_name}`
    );

    return NextResponse.json({
      success: true,
      message: 'Pengguna baru berhasil ditambahkan.',
      user: {
        id: newUser.id,
        nama: newUser.nama,
        username: newUser.username,
        email: newUser.email,
        role_id: newUser.role_id,
        role_name: newUser.role_name,
        is_active: newUser.is_active,
        created_at: newUser.created_at
      }
    });
  } catch (err: any) {
    console.error('[API Users] POST error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menambahkan pengguna baru.' }, { status: 500 });
  }
}

