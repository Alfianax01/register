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
      guest = await mysqlAdapter.getGuestByToken(token);
    }

    // Fallback to unified db
    if (!guest) {
      guest = await db.findGuestByTokenAsync(token);
    }

    if (!guest) {
      return NextResponse.json({ error: 'Data peserta tidak ditemukan' }, { status: 404 });
    }

    const assignment = guest.assignment || db.findAssignmentByGuestId(guest.id);
    const isCheckIn = guest.status_kehadiran === 'CHECK_IN' || (guest.status_kehadiran as any) === 'HADIR';
    const seatCode = assignment?.seat_code || guest.seat_assignment || guest.seat_number;

    // Generate PDF buffer
    const pdfBuffer = await generateTicketPdf({
      nama: guest.nama,
      gelar_depan: guest.gelar_depan,
      gelar_belakang: guest.gelar_belakang,
      pangkat: guest.pangkat,
      nrp: guest.nrp,
      jabatan: guest.jabatan,
      instansi: guest.negara_instansi || guest.instansi || guest.satker || 'Mabes TNI',
      kategori_tamu: guest.kategori_tamu || (guest.matra === 'NON_TNI' ? 'Undangan K/L' : 'Prajurit TNI'),
      matra: guest.matra,
      status: isCheckIn ? 'CHECK-IN' : 'TEREGISTRASI',
      seat_number: seatCode,
      seat_group: seatCode ? `Sidang Paripurna (Kursi ${seatCode})` : 'Sidang Paripurna Gedung Ahmad Yani',
      gedung: assignment?.gedung || 'Ahmad Yani',
      seat_row: assignment?.seat_row,
      seat_num: assignment?.seat_num,
      wisma_name: assignment?.wisma_name,
      room_code: assignment?.room_code,
      registration_id: guest.registration_id,
      qr_token: guest.qr_token,
      created_at: guest.created_at
    });

    const filename = `ETicket_RAPIM_TNI_2026_${(guest.nrp || guest.nama).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
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

