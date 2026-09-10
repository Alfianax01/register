import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import { verifySessionToken } from '@/lib/security/auth';
import { AssignmentService } from '@/lib/services/assignment';
import { sendPostCheckInEmail } from '@/lib/email/mailer';

export const dynamic = 'force-dynamic';

// In-memory sliding window rate limiter (max 60 scan requests per minute per IP)
const scanRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = scanRateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    scanRateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return false;
  }
  if (entry.count >= 60) {
    return true;
  }
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    // Proteksi Rate Limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan scan. Harap tunggu beberapa detik.' },
        { status: 429 }
      );
    }

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
      guest = (await db.findGuestByTokenAsync(token)) || db.findGuestByToken(token);
    }
    if (!guest && nrp) {
      guest = (await db.findGuestByNRPAsync(nrp)) || db.findGuestByNRP(nrp);
    }

    if (!guest) {
      return NextResponse.json(
        { error: 'Tamu tidak terdaftar dalam basis data sistem!' },
        { status: 404 }
      );
    }

    const checkpoint = checkpoint_code || 'Gate 1: Pintu Masuk Utama (Absensi Awal)';
    const adminUser = session ? { id: session.userId, nama: session.nama } : { id: 'admin_gate', nama: 'Petugas Lapangan' };

    // Record checkin & update status to CHECK_IN
    const result = db.recordCheckin(guest.id, checkpoint, adminUser, ip);

    // Check-in is STRICTLY presence verification (Seat & Wisma were assigned at registration)
    let assignment = db.findAssignmentByGuestId(guest.id);
    if (!assignment && guest.seat_number) {
      assignment = {
        id: `assign_${guest.id}`,
        peserta_id: guest.id,
        seat_code: guest.seat_number,
        seat_area: guest.room || 'Ruang Sidang Utama',
        gedung: guest.building || 'Gedung Ahmad Yani',
        building: guest.building || 'Gedung Ahmad Yani',
        room: guest.room || 'Ruang Sidang Utama',
        seat_row: guest.seat_block || guest.seat_number.split('-')[0] || 'A',
        seat_num: guest.seat_number.split('-')[1] || '01',
        wisma_name: guest.wisma_name || 'Tidak Menginap',
        room_code: guest.room_number || '-',
        room_number: guest.room_number || '-',
        bed_number: guest.bed_number ? Number(guest.bed_number) : undefined,
        room_floor: guest.wisma_name === 'Tidak Menginap' ? 'Tidak Menginap' : 'Lantai 1',
        assigned_at: guest.created_at || new Date().toISOString()
      };
    }

    // Sync to MySQL if configured
    let myGuest = null;
    let alreadyCheckedIn = result.alreadyCheckedIn;
    let previousTimestamp = result.previousTimestamp;
    let previousGate = (guest.checkin_gate) || 'Gate 1';

    if (mysqlAdapter.isConfigured()) {
      try {
        const myResult = await mysqlAdapter.recordCheckin(
          guest.qr_token || guest.registration_id || guest.id,
          checkpoint,
          adminUser.nama
        );
        if (myResult.alreadyCheckedIn) {
          alreadyCheckedIn = true;
          if (myResult.previousTimestamp) previousTimestamp = myResult.previousTimestamp;
          if (myResult.previousGate) previousGate = myResult.previousGate;
        }
        if (myResult.guest) {
          myGuest = myResult.guest;
        }
        if (assignment) {
          await mysqlAdapter.saveAssignment(assignment);
        }
      } catch (mysqlErr) {
        console.error('[MySQL Checkin Error]:', mysqlErr);
      }
    }

    // Record audit log
    db.recordAuditLog(
      adminUser.id,
      session?.username || 'petugas_gate',
      'CHECKIN_SCAN',
      `Check-in tamu ${guest.nama} (${guest.pangkat} / NRP ${guest.nrp}) di ${checkpoint} - ${alreadyCheckedIn ? 'RE-SCAN' : 'FIRST SCAN'}`,
      ip
    );

    const nowWIB = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';

    const checkinDetails = {
      gate: checkpoint,
      waktu: nowWIB,
      petugas: adminUser.nama
    };

    // Kirim email notifikasi post check-in secara background asinkron
    if (assignment && (myGuest?.email || guest.email) && !alreadyCheckedIn) {
      sendPostCheckInEmail(myGuest || guest, assignment, checkinDetails).catch(emailErr => {
        console.warn('[Mailer] Post-checkin email dispatch failed:', emailErr);
      });
    }

    const finalGuest = myGuest || {
      ...guest,
      ...result.guest,
      status_kehadiran: 'CHECK-IN',
      checkin_gate: checkpoint,
      checkin_time: result.guest.checkin_time || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      alreadyCheckedIn,
      previousTimestamp,
      previousGate,
      guest: {
        ...finalGuest,
        status_kehadiran: 'CHECK-IN',
        assignment: assignment || finalGuest.assignment || null
      },
      assignment: assignment || finalGuest.assignment || null,
      checkin_details: checkinDetails,
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
