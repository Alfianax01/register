import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const groups = db.getSeatGroups();
    const seats = db.getSeats();
    return NextResponse.json({ success: true, groups, seats });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat denah kursi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('tni_session')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    const body = await req.json();
    const { seat_number, guest_id } = body;

    if (!seat_number) {
      return NextResponse.json({ error: 'Nomor kursi harus ditentukan' }, { status: 400 });
    }

    const res = db.assignSeat(seat_number, guest_id || null);
    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 400 });
    }

    db.recordAuditLog(
      session?.userId || 'admin',
      session?.username || 'admin',
      'ASSIGN_SEAT',
      `Penetapan kursi ${seat_number} untuk guest_id: ${guest_id || 'KOSONG'}`,
      ip
    );

    return NextResponse.json({ success: true, message: res.message });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menyimpan penempatan kursi' }, { status: 500 });
  }
}

