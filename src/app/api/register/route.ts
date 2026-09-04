import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit, escapeHtml, isValidNRP, isValidPhone } from '@/lib/security/sanitizer';
import { TNI_RANKS } from '@/lib/constants/ranks';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    
    // Rate limit: max 5 submissions per minute per IP (OWASP 9.2)
    const rateCheck = checkRateLimit(`reg_${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan pendaftaran. Silakan tunggu 1 menit.' },
        { status: 429 }
      );
    }

    const body = await req.json();
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
    } = body;

    // Validate CAPTCHA
    if (captcha_expected && String(captcha_answer).trim() !== String(captcha_expected).trim()) {
      return NextResponse.json(
        { error: 'Jawaban verifikasi keamanan (CAPTCHA) tidak sesuai.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!nama || !matra || !pangkat || !jabatan || !satker || !no_hp) {
      return NextResponse.json(
        { error: 'Mohon lengkapi seluruh isian wajib pada formulir.' },
        { status: 400 }
      );
    }

    // Validate NRP for military members
    if (matra !== 'NON_TNI' && !isValidNRP(nrp)) {
      return NextResponse.json(
        { error: 'Format NRP tidak valid. Gunakan 5-18 karakter angka/huruf resmi prajurit.' },
        { status: 400 }
      );
    }

    // Check duplicate NRP
    if (nrp) {
      const existing = db.findGuestByNRP(nrp);
      if (existing) {
        return NextResponse.json(
          {
            error: `NRP / Identitas ${nrp} sudah terdaftar atas nama ${existing.nama}. Anda dapat langsung melihat e-ticket Anda.`,
            existingToken: existing.qr_token
          },
          { status: 409 }
        );
      }
    }

    // Find rank level
    const rankObj = TNI_RANKS.find(r => r.name === pangkat);
    const pangkat_level = rankObj ? rankObj.level : (matra === 'NON_TNI' ? 8 : 10);

    // Sanitize user inputs (OWASP 9.2 XSS Prevention)
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

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil. E-Ticket telah diterbitkan.',
      token: newGuest.qr_token,
      guest: {
        id: newGuest.id,
        nama: newGuest.nama,
        pangkat: newGuest.pangkat,
        matra: newGuest.matra,
        qr_token: newGuest.qr_token
      }
    });

  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses registrasi.' },
      { status: 500 }
    );
  }
}

