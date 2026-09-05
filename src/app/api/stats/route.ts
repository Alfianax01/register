import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await db.getStatsAsync();
    return NextResponse.json({ success: true, stats });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat analitik sistem' }, { status: 500 });
  }
}

