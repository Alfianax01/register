import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import { applyGuestFilters } from '@/lib/export/guestFilters';
import { generateGuestsPdfBuffer } from '@/lib/export/pdfExport';
import { verifySessionToken } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('tni_session')?.value || req.cookies.get('session_token')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;
    const validRoles = ['admin', 'superadmin', 'SUPER_ADMIN'];
    if (!session || !validRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya panitia berwenang yang dapat mengunduh data ekspor.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);

    // Ambil parameter filter
    const filters = {
      search: searchParams.get('search') || searchParams.get('q') || undefined,
      matra: searchParams.get('matra') || undefined,
      pangkat: searchParams.get('pangkat') || undefined,
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortDir: (searchParams.get('sortDir') as 'asc' | 'desc') || undefined
    };

    let guests: any[] = [];

    if (mysqlAdapter.isConfigured()) {
      try {
        const pesertaList = await mysqlAdapter.getAllPeserta();
        if (pesertaList && pesertaList.length > 0) {
          guests = pesertaList.map((p: any) => ({
            id: p.id,
            nama: p.nama_lengkap,
            pangkat: p.pangkat,
            pangkat_level: 5,
            nrp: p.nrp || '-',
            jabatan: p.jabatan,
            satker: p.instansi,
            satuan: p.instansi,
            negara_instansi: p.instansi,
            matra: p.matra,
            seat_assignment: p.seat_number,
            seat_number: p.seat_number,
            status_kehadiran: p.status_hadir === 'HADIR' ? 'CHECK_IN' : (p.status_hadir === 'BELUM_HADIR' ? 'REGISTRASI' : p.status_hadir),
            no_hp: p.no_hp,
            email: p.email,
            created_at: p.created_at,
            waktu_kehadiran_pertama: undefined
          }));
        }
      } catch (err) {
        console.warn('[Export PDF] MySQL fallback to hybrid DB:', err);
      }
    }

    if (guests.length === 0) {
      guests = await db.getGuestsAsync();
    }

    // Terapkan filter bersama
    const filteredGuests = applyGuestFilters(guests, filters);

    if (filteredGuests.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang sesuai filter untuk diekspor.' },
        { status: 400 }
      );
    }

    // Buat buffer file PDF Resmi dengan PDFKit Landscape
    const pdfBuffer = await generateGuestsPdfBuffer(filteredGuests, {
      title: 'DAFTAR INDUK PESERTA & AKREDITASI RAPIM TNI 2026',
      subtitle: 'TENTARA NASIONAL INDONESIA'
    });

    const tanggal = new Date().toISOString().slice(0, 10);
    const filename = `Rekap_Peserta_RAPIM_TNI_${tanggal}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });
  } catch (err: any) {
    console.error('[Export PDF] Gagal membuat rekap PDF:', err);
    return NextResponse.json(
      { error: 'Gagal mengekspor PDF: ' + (err?.message || '') },
      { status: 500 }
    );
  }
}
