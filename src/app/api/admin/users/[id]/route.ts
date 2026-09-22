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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau telah berakhir.' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { nama, email, role_id, is_active, password } = body;

    const existing = db.getUserById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const updates: any = {};
    if (nama !== undefined) updates.nama = String(nama).trim();
    if (email !== undefined) updates.email = String(email).trim();
    if (role_id !== undefined) updates.role_id = role_id;
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    if (password) {
      if (String(password).length < 6) {
        return NextResponse.json({ error: 'Kata sandi minimal harus terdiri dari 6 karakter.' }, { status: 400 });
      }
      const salt = bcrypt.genSaltSync(10);
      updates.password_hash = bcrypt.hashSync(String(password), salt);
    }

    const updated = db.updateUser(id, updates);

    db.recordAuditLog(
      session.userId,
      session.username,
      'USER_UPDATE',
      `Memperbarui profil akun pengguna: ${existing.username} (${updates.password_hash ? 'Password direset, ' : ''}status aktif: ${updates.is_active !== undefined ? updates.is_active : existing.is_active})`
    );

    return NextResponse.json({
      success: true,
      message: 'Data pengguna berhasil diperbarui.',
      user: {
        id: updated?.id,
        nama: updated?.nama,
        username: updated?.username,
        email: updated?.email,
        role_id: updated?.role_id,
        role_name: updated?.role_name,
        is_active: updated?.is_active,
        updated_at: updated?.updated_at
      }
    });
  } catch (err: any) {
    console.error('[API Users ID] PUT error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memperbarui pengguna.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau telah berakhir.' }, { status: 401 });
    }

    const { id } = params;
    const existing = db.getUserById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    if (existing.username === 'superadmin') {
      return NextResponse.json({ error: 'Akun Super Admin utama tidak dapat dihapus.' }, { status: 403 });
    }

    db.deleteUser(id);

    db.recordAuditLog(
      session.userId,
      session.username,
      'USER_DELETE',
      `Menghapus pengguna: ${existing.nama} (${existing.username})`
    );

    return NextResponse.json({
      success: true,
      message: `Akun "${existing.username}" berhasil dihapus.`
    });
  } catch (err: any) {
    console.error('[API Users ID] DELETE error:', err);
    return NextResponse.json({ error: err.message || 'Gagal menghapus pengguna.' }, { status: 500 });
  }
}

