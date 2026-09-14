import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let auditData;
    if (mysqlAdapter.isConfigured()) {
      auditData = await mysqlAdapter.auditSeats();
    } else {
      auditData = db.auditSeats();
    }

    return NextResponse.json({
      success: true,
      ...auditData
    });
  } catch (err: any) {
    console.error('Audit seats error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal menjalankan audit kursi' },
      { status: 500 }
    );
  }
}

