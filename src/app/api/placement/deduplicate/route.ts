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

    let result;
    if (mysqlAdapter.isConfigured()) {
      result = await mysqlAdapter.deduplicateSeats();
      // Also synchronize with JSON memory
      db.deduplicateSeats();
    } else {
      result = db.deduplicateSeats();
    }

    db.recordAuditLog(
      session?.userId || 'admin',
      session?.username || 'admin',
      'DEDUPLICATE_SEATS',
      `Deduplikasi otomatis berhasil menyelesaikan ${result.resolvedCount} kursi bentrok/duplikat`,
      ip
    );

    return NextResponse.json({
      success: true,
      message: `Berhasil mendeduplikasi ${result.resolvedCount} alokasi kursi yang bentrok.`,
      ...result
    });
  } catch (err: any) {
    console.error('Deduplicate seats error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal menjalankan deduplikasi kursi' },
      { status: 500 }
    );
  }
}

