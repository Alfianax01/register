import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const logs = await db.getCheckinLogsAsync(limit);
    return NextResponse.json({ success: true, logs });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat log absensi' }, { status: 500 });
  }
}
