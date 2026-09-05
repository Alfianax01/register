import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import { generateTicketPdf } from '@/lib/pdf/ticketPdf';
import { sendTicketEmail } from '@/lib/email/mailer';
import { checkRateLimit, escapeHtml, isValidNRP, isValidPhone } from '@/lib/security/sanitizer';
import { TNI_RANKS } from '@/lib/constants/ranks';
import { getInstansiCategory, getSeatColorAlias } from '@/lib/constants/matra-colors';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // Rate limit: max 30 submissions per minute per IP
    const rateCheck = checkRateLimit(`reg_${ip}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan pendaftaran. Silakan tunggu 1 menit.' },
        { status: 429 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch (parseErr) {
      return NextResponse.json(
        { error: 'Format data tidak valid (JSON parse error).' },
        { status: 400 }
      );
    }

    // Checklist #7: Backend Logging
    console.log("Request Registrasi:", body);

    const {
      nrp,
      nama,
      gelar_depan,
      gelar_belakang,
      matra,
      pangkat,
      jabatan,
      satker,
      satuan,
      negara_instansi,
      no_hp,
      email,
      butuh_akomodasi,
      tgl_checkin,
      tgl_checkout,
      catatan_khusus,
      captcha_answer,
      captcha_expected
    } = body || {};

    // Validate required fields
    if (!nama || !String(nama).trim()) {
      return NextResponse.json(
        { error: 'Nama lengkap wajib diisi.' },
        { status: 400 }
      );
    }

    if (!matra) {
      return NextResponse.json(
        { error: 'Matra kedinasan wajib dipilih.' },
        { status: 400 }
      );
    }

    if (!pangkat) {
      return NextResponse.json(
        { error: 'Pangkat / Golongan kedinasan wajib dipilih.' },
        { status: 400 }
      );
    }

    if (!jabatan || !String(jabatan).trim()) {
      return NextResponse.json(
        { error: 'Jabatan kedinasan wajib diisi.' },
        { status: 400 }
      );
    }

    if (!satker) {
      return NextResponse.json(
        { error: 'Satuan kerja (Satker) wajib dipilih.' },
        { status: 400 }
      );
    }

    if (!no_hp || !String(no_hp).trim()) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp / HP wajib diisi.' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!isValidPhone(no_hp)) {
      return NextResponse.json(
        { error: 'Format nomor HP tidak valid. Gunakan format nomor Indonesia (contoh: 0812xxxxxxxx atau 62812xxxxxxxx).' },
        { status: 400 }
      );
    }

    // Validate NRP for military members
    if (matra !== 'NON_TNI' && !isValidNRP(nrp)) {
      return NextResponse.json(
        { error: 'Format NRP tidak valid. Gunakan 5-20 karakter angka/huruf resmi prajurit.' },
        { status: 400 }
      );
    }

    // Check duplicate NRP
    if (nrp && String(nrp).trim()) {
      const existing = await db.findGuestByNRPAsync(String(nrp).trim());
      if (existing) {
        return NextResponse.json(
          {
            error: `NRP / Identitas ${nrp} sudah terdaftar atas nama ${existing.nama}. Anda dapat langsung melihat E-Ticket Anda.`,
            existingToken: existing.qr_token,
            guest: existing
          },
          { status: 409 }
        );
      }
    }

    // Check duplicate Phone Number
    if (no_hp && String(no_hp).trim()) {
      const existingPhone = await db.findGuestByPhoneAsync(String(no_hp).trim());
      if (existingPhone) {
        return NextResponse.json(
          {
            error: `Nomor HP ${no_hp} sudah terdaftar atas nama ${existingPhone.nama}.`,
            existingToken: existingPhone.qr_token,
            guest: existingPhone
          },
          { status: 409 }
        );
      }
    }

    // Validate and check duplicate Email (if email is provided)
    if (email && String(email).trim()) {
      const cleanEmail = String(email).trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json(
          { error: 'Format alamat email tidak valid (contoh: nama@domain.com).' },
          { status: 400 }
        );
      }

      const existingEmail = await db.findGuestByEmailAsync(cleanEmail);
      if (existingEmail) {
        return NextResponse.json(
          {
            error: `Email ${email} sudah terdaftar atas nama ${existingEmail.nama}.`,
            existingToken: existingEmail.qr_token,
            guest: existingEmail
          },
          { status: 409 }
        );
      }
    }

    // Validate CAPTCHA if expected
    if (captcha_expected && String(captcha_answer || '').trim() !== String(captcha_expected).trim()) {
      return NextResponse.json(
        { error: 'Jawaban verifikasi keamanan (CAPTCHA) tidak sesuai.' },
        { status: 400 }
      );
    }

    // Find rank level
    const rankObj = TNI_RANKS.find(r => r.name === pangkat);
    const pangkat_level = rankObj ? rankObj.level : (matra === 'NON_TNI' ? 8 : 10);

    // Calculate instansi category and seat color alias
    const kategori_instansi = getInstansiCategory(matra || satker);
    const warna_kursi = getSeatColorAlias(kategori_instansi);

    // Sanitize user inputs safely and persist atomically with retry & post-insert verification
    const newGuest = await db.createGuestAsync({
      nrp: escapeHtml(nrp || '-'),
      nama: escapeHtml(nama),
      gelar_depan: escapeHtml(gelar_depan || ''),
      gelar_belakang: escapeHtml(gelar_belakang || ''),
      matra: matra,
      pangkat: escapeHtml(pangkat),
      pangkat_level,
      jabatan: escapeHtml(jabatan),
      satker: escapeHtml(satker),
      satuan: escapeHtml(satuan || satker),
      negara_instansi: escapeHtml(negara_instansi || 'Indonesia / Mabes TNI'),
      no_hp: escapeHtml(no_hp),
      email: escapeHtml(email || ''),
      butuh_akomodasi: butuh_akomodasi ? 1 : 0,
      tgl_checkin: tgl_checkin ? escapeHtml(tgl_checkin) : undefined,
      tgl_checkout: tgl_checkout ? escapeHtml(tgl_checkout) : undefined,
      catatan_khusus: catatan_khusus ? escapeHtml(catatan_khusus) : undefined,
      kategori_instansi,
      warna_kursi,
      seatColorAlias: warna_kursi
    });

    // Generate high resolution QR Code image for immediate client rendering
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(newGuest.qr_token, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 400,
        color: {
          dark: '#07160F',
          light: '#FFFFFF'
        }
      });
    } catch (qrErr) {
      console.warn('QR Code generation warning:', qrErr);
    }

    // Generate PDF E-Ticket Buffer
    const pdfPath = `/api/ticket/${newGuest.qr_token}/pdf`;
    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateTicketPdf({
        nama: newGuest.nama,
        gelar_depan: newGuest.gelar_depan,
        gelar_belakang: newGuest.gelar_belakang,
        pangkat: newGuest.pangkat,
        nrp: newGuest.nrp,
        jabatan: newGuest.jabatan,
        instansi: newGuest.negara_instansi || newGuest.satker,
        kategori_tamu: newGuest.matra === 'NON_TNI' ? 'Undangan Sipil' : 'Prajurit TNI',
        matra: newGuest.matra,
        seat_number: newGuest.seat_number,
        registration_id: newGuest.registration_id,
        qr_token: newGuest.qr_token,
        created_at: newGuest.created_at
      });
      console.log(`[PDF] Berhasil generate PDF E-Ticket untuk ${newGuest.nama}`);
    } catch (pdfErr) {
      console.error('[PDF] Error generating PDF E-Ticket:', pdfErr);
    }

    // Save to MySQL Database
    if (mysqlAdapter.isConfigured()) {
      try {
        await mysqlAdapter.savePeserta({
          id: newGuest.id,
          nama_lengkap: [newGuest.gelar_depan, newGuest.nama, newGuest.gelar_belakang].filter(Boolean).join(' ') || newGuest.nama,
          pangkat: newGuest.pangkat,
          jabatan: newGuest.jabatan,
          instansi: newGuest.negara_instansi || newGuest.satker,
          email: newGuest.email,
          no_hp: newGuest.no_hp,
          kategori_tamu: newGuest.matra === 'NON_TNI' ? 'SIPIL' : 'TNI',
          nrp: newGuest.nrp || null,
          matra: newGuest.matra,
          qr_token: newGuest.qr_token,
          seat_number: newGuest.seat_number || null,
          status_hadir: 'BELUM_HADIR',
          pdf_path: pdfPath
        });
        console.log(`[MySQL] Data peserta tersimpan permanen di database: ${newGuest.id}`);
      } catch (mysqlErr) {
        console.error('[MySQL Error] Gagal menyimpan peserta ke MySQL:', mysqlErr);
      }
    }

    // Generate QR Code PNG Buffer for Email CID embedding (USES newGuest.qr_token FROM DB ONLY, NEVER REGENERATED)
    let qrCodeBuffer: Buffer = Buffer.alloc(0);
    try {
      qrCodeBuffer = await QRCode.toBuffer(newGuest.qr_token, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 280,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      });
    } catch (qrBufErr) {
      console.warn('QR Code buffer generation warning:', qrBufErr);
    }

    // Determine Base URL for Ticket link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const ticketUrl = `${baseUrl.replace(/\/$/, '')}/ticket/${newGuest.qr_token}`;

    // Dispatch Email with E-Ticket & QR Code CID (separate try/catch, non-blocking)
    let emailStatus: 'sent' | 'failed' = 'failed';
    if (newGuest.email) {
      try {
        console.log(`Sending ticket email to ${newGuest.email}...`);
        const mailResult = await sendTicketEmail(newGuest, ticketUrl, qrCodeBuffer, pdfBuffer);
        if (mailResult.success) {
          console.log(`Email sent successfully`);
          emailStatus = 'sent';
          db.updateGuest(newGuest.id, { emailSent: true });
        } else {
          console.error(`Email failed: ${mailResult.error || 'Unknown error'}`);
          emailStatus = 'failed';
          db.updateGuest(newGuest.id, { emailSent: false });
        }
      } catch (mailErr: any) {
        console.error(`Email failed: ${mailErr?.message || mailErr}`);
        emailStatus = 'failed';
        db.updateGuest(newGuest.id, { emailSent: false });
      }
    }

    const participantData = {
      id: newGuest.id,
      registrationId: newGuest.registration_id,
      ticketId: newGuest.ticket_id,
      nama: newGuest.nama,
      gelar_depan: newGuest.gelar_depan,
      gelar_belakang: newGuest.gelar_belakang,
      pangkat: newGuest.pangkat,
      matra: newGuest.matra,
      jabatan: newGuest.jabatan,
      instansi: newGuest.negara_instansi || newGuest.satker,
      satker: newGuest.satker,
      satuan: newGuest.satuan,
      nrp: newGuest.nrp,
      email: newGuest.email,
      no_hp: newGuest.no_hp,
      status: newGuest.status_kehadiran,
      qr_token: newGuest.qr_token,
      emailSent: emailStatus === 'sent',
      pdf_path: pdfPath,
      created_at: newGuest.created_at
    };

    console.log("DATA TERSIMPAN:", {
      id: newGuest.id,
      registrationId: newGuest.registration_id,
      ticketId: newGuest.ticket_id,
      nama: newGuest.nama,
      nrp: newGuest.nrp,
      token: newGuest.qr_token,
      emailStatus,
      pdfPath
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil. E-Ticket & PDF telah diterbitkan.',
      registrationId: newGuest.registration_id,
      ticketId: newGuest.ticket_id,
      token: newGuest.qr_token,
      emailStatus,
      qrCode: qrDataUrl,
      pdfUrl: pdfPath,
      participant: participantData,
      guest: {
        ...newGuest,
        emailSent: emailStatus === 'sent',
        registration_id: newGuest.registration_id,
        ticket_id: newGuest.ticket_id,
        pdf_path: pdfPath
      }
    });

  } catch (err: any) {
    console.error("DATA ERROR:", err);
    const errorMessage = err?.message || 'Terjadi kesalahan sistem saat memproses registrasi.';
    return NextResponse.json(
      { 
        error: errorMessage,
        message: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? err?.stack : undefined
      },
      { status: 500 }
    );
  }
}

