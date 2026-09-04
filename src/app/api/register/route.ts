import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit, escapeHtml, isValidNRP, isValidPhone } from '@/lib/security/sanitizer';
import { TNI_RANKS } from '@/lib/constants/ranks';
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
      const existing = db.findGuestByNRP(String(nrp).trim());
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
      const existingPhone = db.findGuestByPhone(String(no_hp).trim());
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

    // Check duplicate Email (if email is provided)
    if (email && String(email).trim()) {
      const existingEmail = db.findGuestByEmail(String(email).trim());
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

    // Sanitize user inputs safely
    const newGuest = db.createGuest({
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
      catatan_khusus: catatan_khusus ? escapeHtml(catatan_khusus) : undefined
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
      created_at: newGuest.created_at
    };

    console.log("DATA TERSIMPAN:", {
      id: newGuest.id,
      registrationId: newGuest.registration_id,
      ticketId: newGuest.ticket_id,
      nama: newGuest.nama,
      nrp: newGuest.nrp,
      token: newGuest.qr_token
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil. E-Ticket telah diterbitkan.',
      registrationId: newGuest.registration_id,
      ticketId: newGuest.ticket_id,
      token: newGuest.qr_token,
      qrCode: qrDataUrl,
      participant: participantData,
      guest: {
        ...newGuest,
        registration_id: newGuest.registration_id,
        ticket_id: newGuest.ticket_id
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

