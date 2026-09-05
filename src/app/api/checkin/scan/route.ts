import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import { verifySessionToken } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    // Verify admin session from cookie or header (OWASP 9.3)
    const sessionCookie = req.cookies.get('tni_session')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;

    const body = await req.json();
    const { token, nrp, checkpoint_code } = body;

    if (!token && !nrp) {
      return NextResponse.json(
        { error: 'Mohon scan QR Code atau masukkan nomor NRP/Identitas' },
        { status: 400 }
      );
    }

    // Find guest
    let guest = null;
    if (token) {
      guest = db.findGuestByToken(token);
    }
    if (!guest && nrp) {
      guest = db.findGuestByNRP(nrp);
    }

    if (!guest) {
      return NextResponse.json(
        { error: 'Tamu tidak terdaftar dalam basis data sistem!' },
        { status: 404 }
      );
    }

    const checkpoint = checkpoint_code || 'GATE_UTAMA';
    const adminUser = session ? { id: session.userId, nama: session.nama } : { id: 'admin_gate', nama: 'Petugas Lapangan' };

    const result = db.recordCheckin(guest.id, checkpoint, adminUser, ip);

    // Sync to MySQL
    if (mysqlAdapter.isConfigured()) {
      try {
        await mysqlAdapter.recordCheckin(guest.id, adminUser.nama, checkpoint);
      } catch (mysqlErr) {
        console.error('[MySQL Checkin Error]:', mysqlErr);
      }
    }

    // Record audit log
    db.recordAuditLog(
      adminUser.id,
      session?.username || 'petugas_gate',
      'CHECKIN_SCAN',
      `Check-in tamu ${guest.nama} (${guest.pangkat} / NRP ${guest.nrp}) di ${checkpoint} - ${result.alreadyCheckedIn ? 'RE-SCAN' : 'FIRST SCAN'}`,
      ip
    );

    // Fetch seating & room details
    const seats = db.getSeats();
    const seat = seats.find(s => s.seat_number === result.guest.seat_number);

    const rooms = db.getAccommodations();
    const room = rooms.find(r => r.id === result.guest.room_id);

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: result.alreadyCheckedIn,
      previousTimestamp: result.previousTimestamp,
      guest: {
        ...result.guest,
        seat_details: seat ? {
          group_code: seat.group_code,
          seat_number: seat.seat_number,
          row_num: seat.row_num,
          col_num: seat.col_num
        } : null,
        room_details: room ? {
          wisma_name: room.wisma_name,
          floor: room.floor,
          room_number: room.room_number,
          slot: result.guest.room_slot || 'A'
        } : null
      },
      log: result.log
    });

  } catch (err: any) {
    console.error('Checkin scan error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan sistem saat memproses check-in.' },
      { status: 500 }
    );
  }
}

