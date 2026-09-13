import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/security/auth';
import { canonicalizeStatusKehadiran } from '@/lib/constants/status';
import { Guest } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('tni_session')?.value || req.cookies.get('session_token')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const validRoles = ['admin', 'superadmin', 'SUPER_ADMIN', 'PANITIA_GATE', 'PANITIA_AKOMODASI'];
    if (!session || !validRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda harus login sebagai panitia berwenang untuk mengakses direktori peserta.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.trim() || '';
    const matra = searchParams.get('matra') || '';
    const status = searchParams.get('status') || '';
    const group = searchParams.get('group') || '';

    let guests: Guest[] = [];

    if (!search) {
      guests = await db.getAllGuests();
    } else {
      guests = await db.searchGuests(search);
      if (!guests || guests.length === 0) {
        // Fallback exact match by NRP
        const byNrp = await db.getGuestByNRP(search);
        if (byNrp) {
          guests = [byNrp];
        } else {
          // Fallback exact match by Token
          const byToken = await db.getGuestByToken(search);
          if (byToken) {
            guests = [byToken];
          } else {
            guests = [];
          }
        }
      }
    }

    if (matra) {
      guests = guests.filter(g => g.matra === matra);
    }

    if (status) {
      const target = canonicalizeStatusKehadiran(status);
      guests = guests.filter(g => canonicalizeStatusKehadiran(g.status_kehadiran) === target);
    }

    if (group) {
      guests = guests.filter(g => g.seat_group_id === group);
    }

    // Fast mapping without N+1 database queries
    const sanitizedGuests = guests.map(g => {
      const seatBlock = g.seat_block || (g.seat_number ? g.seat_number.split('-')[0] : 'A');
      const building = g.building || 'Gedung Ahmad Yani';
      const room = g.room || g.room_name || (seatBlock === 'A' ? 'Area VVIP' : 'Ruang Sidang Utama');
      const isTidakMenginap = g.butuh_akomodasi === 0 || g.wisma_name === 'Tidak Menginap';
      const wisma_name = isTidakMenginap ? 'Tidak Menginap' : (g.wisma_name || 'Wisma Kartika');
      const room_number = isTidakMenginap ? '-' : (g.room_number || '-');
      const bed_number = isTidakMenginap ? 0 : (g.bed_number ? Number(g.bed_number) : 1);

      const assignment = g.assignment || (g.seat_number ? {
        id: `assign_${g.id}`,
        peserta_id: g.id,
        seat_code: g.seat_number,
        seat_area: room,
        gedung: building,
        building: building,
        room: room,
        seat_row: seatBlock,
        seat_num: g.seat_number.split('-')[1] || '01',
        wisma_name: wisma_name,
        room_code: room_number,
        room_number: room_number,
        bed_number: bed_number,
        room_floor: isTidakMenginap ? 'Tidak Menginap' : 'Lantai 1',
        assigned_at: g.created_at || new Date().toISOString()
      } : undefined);

      const canonicalStatus = canonicalizeStatusKehadiran(g.status_kehadiran);
      return {
        ...g,
        status_kehadiran: canonicalStatus,
        guest_status: canonicalStatus,
        seat_block: seatBlock,
        building,
        room,
        wisma_name,
        room_number,
        bed_number,
        assignment
      };
    });

    return NextResponse.json({ success: true, guests: sanitizedGuests }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err) {
    console.error('[API /api/guests]', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Gagal memuat daftar tamu',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('tni_session')?.value || req.cookies.get('session_token')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const validRoles = ['admin', 'superadmin', 'SUPER_ADMIN', 'PANITIA_GATE', 'PANITIA_AKOMODASI'];
    if (!session || !validRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Anda harus login sebagai panitia berwenang.' },
        { status: 401 }
      );
    }
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Data update tidak lengkap' }, { status: 400 });
    }

    if (updates.status_kehadiran) {
      updates.status_kehadiran = canonicalizeStatusKehadiran(updates.status_kehadiran);
    }

    const updated = db.updateGuest(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Tamu tidak ditemukan' }, { status: 404 });
    }

    db.recordAuditLog(
      session.userId,
      session.username,
      'UPDATE_GUEST',
      `Pembaruan profil tamu ${updated.nama} (${updated.nrp})`,
      ip
    );

    return NextResponse.json({ success: true, guest: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Gagal memperbarui data tamu' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('tni_session')?.value || req.cookies.get('session_token')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const validRoles = ['admin', 'superadmin', 'SUPER_ADMIN'];
    if (!session || !validRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya Super Admin / Admin yang dapat menghapus data peserta.' },
        { status: 401 }
      );
    }
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch (_) {
        // no json body
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'ID tamu wajib disertakan' }, { status: 400 });
    }

    const guest = (await db.findGuestByIdAsync(id)) || db.findGuestById(id);
    const guestName = guest ? `${guest.nama} (${guest.nrp || '-'})` : id;

    const deleted = db.deleteGuest(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Data tamu tidak ditemukan' }, { status: 404 });
    }

    db.recordAuditLog(
      session.userId,
      session.username,
      'DELETE_GUEST',
      `Penghapusan data peserta ${guestName}`,
      ip
    );

    return NextResponse.json({ success: true, message: `Peserta ${guestName} berhasil dihapus` });
  } catch (err: any) {
    console.error('Error deleting guest:', err);
    return NextResponse.json({ error: 'Gagal menghapus data tamu' }, { status: 500 });
  }
}
