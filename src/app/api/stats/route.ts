import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('tni_session')?.value || req.cookies.get('session_token')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const validRoles = ['admin', 'superadmin', 'SUPER_ADMIN', 'PANITIA_GATE', 'PANITIA_AKOMODASI'];
    if (!session || !validRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya panitia berwenang yang dapat melihat analitik sistem.' },
        { status: 401 }
      );
    }

    const stats = await db.getStatsAsync();
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat analitik sistem' }, { status: 500 });
  }
}
