import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Guest } from '@/types';

export const dynamic = 'force-dynamic';

// Sliding window rate limiter (max 30 search requests per minute per IP)
const searchRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = searchRateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    searchRateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return false;
  }
  if (entry.count >= 30) {
    return true;
  }
  entry.count++;
  return false;
}

function maskPhone(phone?: string | null): string {
  if (!phone) return '-';
  const clean = phone.trim();
  if (clean.length <= 4) return '****';
  return clean.slice(0, 4) + '****' + clean.slice(-3);
}

function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '-';
  const [local, domain] = email.split('@');
  const maskedLocal = local.length <= 2 ? `${local[0]}*` : `${local[0]}***${local.slice(-1)}`;
  return `${maskedLocal}@${domain}`;
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Terlalu banyak permintaan pencarian. Harap tunggu beberapa detik.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Masukkan minimal 2 karakter kata kunci pencarian.' },
        { status: 400 }
      );
    }

    // Cari tamu berdasarkan kriteria: nama, nrp, phone, email, token
    let rawGuests: Guest[] = await db.searchGuests(q);

    if (!rawGuests || rawGuests.length === 0) {
      const byNrp = await db.getGuestByNRP(q);
      if (byNrp) {
        rawGuests = [byNrp];
      } else {
        const byToken = await db.getGuestByToken(q);
        if (byToken) {
          rawGuests = [byToken];
        } else {
          rawGuests = [];
        }
      }
    }

    // Batasi hasil maksimal 10 untuk mencegah enumerasi massal
    const limited = rawGuests.slice(0, 10);

    // Sanitasi data publik untuk keamanan privasi prajurit & pejabat
    const sanitized = limited.map((g) => ({
      id: g.id,
      nama: g.nama,
      pangkat: g.pangkat,
      nrp: g.nrp,
      matra: g.matra,
      jabatan: g.jabatan,
      satker: g.satker || g.satuan || '-',
      satuan: g.satuan || g.satker || '-',
      seat_number: g.seat_number || g.seat_assignment || '-',
      status_kehadiran: g.status_kehadiran || 'REGISTRASI',
      registration_id: g.registration_id || (g as any).no_registrasi || `REG-${g.id}`,
      qr_token: (g as any).qr_code_token || g.qr_token,
      waktu_kehadiran: g.waktu_kehadiran_pertama,
      // Masked contact info
      no_hp_masked: maskPhone(g.phone || g.no_hp),
      email_masked: maskEmail(g.email)
    }));

    return NextResponse.json(
      { success: true, guests: sanitized },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (err: any) {
    console.error('[API /api/ticket/search]', err);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses pencarian tiket.' },
      { status: 500 }
    );
  }
}
