import { NextRequest, NextResponse } from 'next/server';
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

    const roles = db.getRoles();
    const permissions = db.getPermissions();

    return NextResponse.json({
      success: true,
      roles,
      permissions
    });
  } catch (err: any) {
    console.error('[API Roles] GET error:', err);
    return NextResponse.json({ error: 'Gagal memuat peran dan hak akses.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau telah berakhir.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { role_id, permissions } = body;

    if (!role_id || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'ID peran dan daftar hak akses wajib disertakan.' }, { status: 400 });
    }

    const updated = db.updateRolePermissions(role_id, permissions);
    if (!updated) {
      return NextResponse.json({ error: 'Peran tidak ditemukan.' }, { status: 404 });
    }

    db.recordAuditLog(
      session.userId,
      session.username,
      'ROLE_UPDATE_PERMISSIONS',
      `Memperbarui hak akses untuk peran: ${updated.name} (Total izin: ${permissions.length})`
    );

    return NextResponse.json({
      success: true,
      message: `Hak akses untuk "${updated.name}" berhasil diperbarui.`,
      role: updated
    });
  } catch (err: any) {
    console.error('[API Roles] PUT error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui hak akses peran.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Sesi tidak valid atau telah berakhir.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, description, permissions } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama grup peran wajib diisi.' }, { status: 400 });
    }

    const newRole = db.createRole({
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      permissions: Array.isArray(permissions) ? permissions : []
    });

    db.recordAuditLog(
      session.userId,
      session.username,
      'ROLE_CREATE',
      `Menambahkan peran baru: ${newRole.name}`
    );

    return NextResponse.json({
      success: true,
      message: `Peran baru "${newRole.name}" berhasil dibuat.`,
      role: newRole
    });
  } catch (err: any) {
    console.error('[API Roles] POST error:', err);
    return NextResponse.json({ error: 'Gagal membuat peran baru.' }, { status: 500 });
  }
}

