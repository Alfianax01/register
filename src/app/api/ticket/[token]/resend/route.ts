import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import { generateTicketPdf } from '@/lib/pdf/ticketPdf';
import { sendTicketEmail } from '@/lib/email/mailer';
import { verifySessionToken } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
    }

    // Check optional admin authorization
    const sessionCookie = req.cookies.get('tni_session')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;

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
          email: p.email,
          no_hp: p.no_hp,
          kategori_tamu: p.kategori_tamu,
          matra: p.matra,
          seat_number: p.seat_number,
          qr_token: p.qr_token,
          registration_id: `REG-${p.nrp || p.id.slice(-6).toUpperCase()}`
        };
      }
    }

    if (!guest) {
      guest = await db.findGuestByTokenAsync(token);
    }

    if (!guest) {
      return NextResponse.json({ error: 'Data peserta tidak ditemukan' }, { status: 404 });
    }

    if (!guest.email) {
      return NextResponse.json({ error: 'Peserta tidak memiliki alamat email yang terdaftar' }, { status: 400 });
    }

    // Generate PDF buffer
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateTicketPdf({
        nama: guest.nama,
        gelar_depan: guest.gelar_depan,
        gelar_belakang: guest.gelar_belakang,
        pangkat: guest.pangkat,
        nrp: guest.nrp,
        jabatan: guest.jabatan,
        instansi: guest.negara_instansi || guest.instansi || guest.satker || 'Mabes TNI',
        kategori_tamu: guest.kategori_tamu || 'TNI',
        matra: guest.matra,
        seat_number: guest.seat_number,
        registration_id: guest.registration_id,
        qr_token: guest.qr_token
      });
    } catch (pdfErr) {
      console.warn('[Resend] Warning generating PDF:', pdfErr);
    }

    // Send email with PDF
    const emailResult = await sendTicketEmail({
      to: guest.email,
      nama: [guest.gelar_depan, guest.nama, guest.gelar_belakang].filter(Boolean).join(' '),
      pangkat: guest.pangkat,
      nrp: guest.nrp,
      jabatan: guest.jabatan,
      instansi: guest.negara_instansi || guest.instansi || guest.satker || 'Mabes TNI',
      seat_number: guest.seat_number,
      registration_id: guest.registration_id,
      qr_token: guest.qr_token,
      pdfBuffer
    });

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.error || 'Gagal mengirimkan email. Periksa konfigurasi SMTP server.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `E-Ticket PDF berhasil dikirim ulang ke alamat email: ${guest.email}`,
      messageId: emailResult.messageId
    });

  } catch (err: any) {
    console.error('[Resend Email Error]:', err);
    return NextResponse.json({
      error: 'Terjadi kesalahan sistem saat mengirim ulang email: ' + (err?.message || '')
    }, { status: 500 });
  }
}

