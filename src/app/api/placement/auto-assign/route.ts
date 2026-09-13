import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import { verifySessionToken } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('tni_session')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    let assignedCount = 0;
    if (mysqlAdapter.isConfigured()) {
      const myRes = await mysqlAdapter.autoAssignSeats();
      assignedCount = myRes.assignedCount;
    }
    const result = db.autoAssignSeats();
    if (!assignedCount) assignedCount = result.assignedCount;

    db.recordAuditLog(
      session?.userId || 'admin',
      session?.username || 'admin',
      'AUTO_ASSIGN_SEATS',
      `Penetapan kursi otomatis berbasis senioritas pangkat untuk ${result.assignedCount} prajurit/tamu`,
      ip
    );

    return NextResponse.json({
      success: true,
      message: `Berhasil menempatkan ${result.assignedCount} prajurit/tamu ke kursi sesuai jenjang kepangkatan & grup.`,
      assignedCount: result.assignedCount
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal menjalankan alokasi kursi otomatis' }, { status: 500 });
  }
}
