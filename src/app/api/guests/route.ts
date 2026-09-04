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

    let guests = db.getGuests();

    if (search) {
      const searchClean = search.replace(/[\s\-\(\)\+]/g, '');
      const searchPhone = searchClean.startsWith('62') ? '0' + searchClean.slice(2) : searchClean;

      guests = guests.filter(g => {
        const guestPhoneClean = (g.no_hp || '').replace(/[\s\-\(\)\+]/g, '');
        const guestPhoneNorm = guestPhoneClean.startsWith('62') ? '0' + guestPhoneClean.slice(2) : guestPhoneClean;

        return (
          g.nama.toLowerCase().includes(search) ||
          g.nrp.toLowerCase().includes(search) ||
          (g.no_hp && g.no_hp.toLowerCase().includes(search)) ||
          (guestPhoneNorm && searchPhone && guestPhoneNorm.includes(searchPhone)) ||
          (g.email && g.email.toLowerCase().includes(search)) ||
          (g.registration_id && g.registration_id.toLowerCase().includes(search)) ||
          (g.ticket_id && g.ticket_id.toLowerCase().includes(search)) ||
          (g.qr_token && g.qr_token.toLowerCase().includes(search)) ||
          g.satker.toLowerCase().includes(search) ||
          g.jabatan.toLowerCase().includes(search)
        );
      });
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

    return NextResponse.json({ success: true, guests });
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

