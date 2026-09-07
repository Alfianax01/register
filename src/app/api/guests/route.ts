import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q')?.toLowerCase() || '';
    const matra = searchParams.get('matra') || '';
    const status = searchParams.get('status') || '';
    const group = searchParams.get('group') || '';

    let guests = search ? await db.searchGuestsAsync(search) : await db.getGuestsAsync();

    if (search && guests.length === 0) {
      // Direct exact match check as fallback
      const byNrp = await db.findGuestByNRPAsync(search);
      if (byNrp) guests = [byNrp];
      else {
        const byToken = await db.findGuestByTokenAsync(search);
        if (byToken) guests = [byToken];
      }
    }

    if (matra) {
      guests = guests.filter(g => g.matra === matra);
    }

    if (status) {
      guests = guests.filter(g => g.status_kehadiran === status);
    }

    if (group) {
      guests = guests.filter(g => g.seat_group_id === group);
    }

    const sanitizedGuests = guests.map(g => {
      const assignment = g.assignment || db.findAssignmentByGuestId(g.id);
      const seatBlock = g.seat_block || (g.seat_number ? g.seat_number.split('-')[0] : 'A');
      const building = g.building || assignment?.gedung || assignment?.building || 'Gedung Ahmad Yani';
      const room = g.room || assignment?.seat_area || assignment?.room || (seatBlock === 'A' ? 'Area VVIP' : 'Ruang Sidang Utama');
      const isTidakMenginap = g.butuh_akomodasi === 0 || g.wisma_name === 'Tidak Menginap';
      const wisma_name = isTidakMenginap ? 'Tidak Menginap' : (g.wisma_name || assignment?.wisma_name || 'Wisma Kartika');
      const room_number = isTidakMenginap ? '-' : (g.room_number || assignment?.room_code || '101A');
      const bed_number = isTidakMenginap ? 0 : (g.bed_number || assignment?.bed_number || 1);

      return {
        ...g,
        seat_block: seatBlock,
        building,
        room,
        wisma_name,
        room_number,
        bed_number,
        assignment: assignment || g.assignment
      };
    });

    return NextResponse.json({ success: true, guests: sanitizedGuests }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memuat daftar tamu' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('tni_session')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    const body = await req.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Data update tidak lengkap' }, { status: 400 });
    }

    const updated = db.updateGuest(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Tamu tidak ditemukan' }, { status: 404 });
    }

    db.recordAuditLog(
      session?.userId || 'admin',
      session?.username || 'admin',
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
    const sessionCookie = req.cookies.get('tni_session')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
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
      session?.userId || 'admin',
      session?.username || 'admin',
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
