import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import { generateTicketPdf } from '@/lib/pdf/ticketPdf';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
    }

    // Check MySQL first if available
    let guest: any = null;
    if (mysqlAdapter.isConfigured()) {
      const p = await mysqlAdapter.getPesertaByToken(token);
      if (p) {
        guest = {
          id: p.id,
          nama: p.nama_lengkap,
          pangkat: p.pangkat,
          nrp: p.nrp,
          jabatan: p.jabatan,
          instansi: p.instansi,
          kategori_tamu: p.kategori_tamu,
          matra: p.matra,
          seat_number: p.seat_number,
          qr_token: p.qr_token,
          registration_id: `REG-${p.nrp || p.id.slice(-6).toUpperCase()}`,
          created_at: p.created_at
        };
      }
    }

    // Fallback to unified db
    if (!guest) {
      guest = await db.findGuestByTokenAsync(token);
    }

    if (!guest) {
      return NextResponse.json({ error: 'Data peserta tidak ditemukan' }, { status: 404 });
    }

    // Generate PDF buffer
    const pdfBuffer = await generateTicketPdf({
      nama: guest.nama,
      gelar_depan: guest.gelar_depan,
      gelar_belakang: guest.gelar_belakang,
      pangkat: guest.pangkat,
      nrp: guest.nrp,
      jabatan: guest.jabatan,
      instansi: guest.negara_instansi || guest.instansi || guest.satker || 'Mabes TNI',
      kategori_tamu: guest.kategori_tamu || (guest.matra === 'NON_TNI' ? 'Undangan Sipil' : 'Prajurit TNI'),
      matra: guest.matra,
      seat_number: guest.seat_number,
      seat_group: guest.seat_number ? `Sidang Paripurna (Kursi ${guest.seat_number})` : 'Sidang Paripurna Gedung Ahmad Yani',
      registration_id: guest.registration_id,
      qr_token: guest.qr_token,
      created_at: guest.created_at
    });

    const filename = `ETicket_RAPIM_TNI_2026_${(guest.nrp || guest.nama).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    console.error('[PDF] Gagal membuat file PDF E-Ticket:', err);
    return NextResponse.json(
      { error: 'Gagal membuat dokumen PDF: ' + (err?.message || 'Internal error') },
      { status: 500 }
    );
  }
}

