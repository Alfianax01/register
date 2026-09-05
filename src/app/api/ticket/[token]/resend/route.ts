import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import { generateTicketPdf } from '@/lib/pdf/ticketPdf';
import { sendTicketEmail } from '@/lib/email/mailer';
import { verifySessionToken } from '@/lib/security/auth';
import { Guest } from '@/types';

export const dynamic = 'force-dynamic';

// In-memory rate limiting map: max 5 requests per 60 seconds per token/IP
const resendRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, maxRequests = 5, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const entry = resendRateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    resendRateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    // Rate limiting check
    if (!checkRateLimit(`resend_${token}`) || !checkRateLimit(`resend_ip_${ip}`, 10)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan kirim ulang email. Mohon tunggu 1 menit sebelum mencoba kembali.' },
        { status: 429 }
      );
    }

    // Check optional admin authorization
    const sessionCookie = req.cookies.get('tni_session')?.value;
    const session = sessionCookie ? verifySessionToken(sessionCookie) : null;

    // Fetch existing guest record strictly using the token from the request
    let guest: Guest | null = null;

    if (mysqlAdapter.isConfigured()) {
      const p = await mysqlAdapter.getPesertaByToken(token);
      if (p) {
        guest = {
          id: p.id,
          nama: p.nama_lengkap,
          pangkat: p.pangkat,
          pangkat_level: 5,
          nrp: p.nrp || '',
          jabatan: p.jabatan,
          satker: p.instansi,
          satuan: p.instansi,
          negara_instansi: p.instansi,
          email: p.email,
          no_hp: p.no_hp,
          matra: (p.matra as any) || 'AD',
          butuh_akomodasi: 0,
          seat_number: p.seat_number || undefined,
          status_kehadiran: p.status_hadir === 'HADIR' ? 'HADIR' : 'BELUM_HADIR',
          qr_token: p.qr_token, // STRICTLY PRESERVED FROM DB, NEVER REGENERATED
          token: p.qr_token,
          token_hash: '',
          registration_id: `REG-${p.nrp || p.id.slice(-6).toUpperCase()}`,
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || new Date().toISOString()
        };
      }
    }

    if (!guest) {
      guest = (await db.findGuestByTokenAsync(token)) || null;
    }

    // Verify token strictly belongs to an existing guest in database
    if (!guest || (guest.qr_token !== token && guest.token !== token)) {
      return NextResponse.json(
        { error: 'E-Ticket tidak ditemukan atau token tidak valid dalam sistem' },
        { status: 404 }
      );
    }

    // Optional email override (e.g. admin correcting a typo)
    let overrideEmail = '';
    try {
      const body = await req.json();
      if (body?.email) overrideEmail = String(body.email).trim();
    } catch (_) {
      // Body is optional
    }

    const targetEmail = overrideEmail || guest.email;
    if (!targetEmail) {
      return NextResponse.json(
        { error: 'Peserta tidak memiliki alamat email yang terdaftar' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      return NextResponse.json(
        { error: 'Format alamat email tujuan tidak valid' },
        { status: 400 }
      );
    }

    if (overrideEmail && overrideEmail !== guest.email) {
      guest.email = overrideEmail;
      db.updateGuest(guest.id, { email: overrideEmail });
      if (mysqlAdapter.isConfigured()) {
        mysqlAdapter.updatePeserta(guest.id, { email: overrideEmail }).catch(console.error);
      }
    }

    // Generate QR Code PNG Buffer for Email CID embedding (USES EXISTING TOKEN STRICTLY)
    const qrCodeBuffer = await QRCode.toBuffer(guest.qr_token, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 280,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    });

    // Determine Base URL for Ticket link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const ticketUrl = `${baseUrl.replace(/\/$/, '')}/ticket/${guest.qr_token}`;

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
        instansi: guest.negara_instansi || guest.satker || 'Mabes TNI',
        kategori_tamu: guest.matra === 'NON_TNI' ? 'Undangan Sipil' : 'Prajurit TNI',
        matra: guest.matra,
        seat_number: guest.seat_number,
        registration_id: guest.registration_id,
        qr_token: guest.qr_token // STRICTLY EXISTING TOKEN
      });
    } catch (pdfErr) {
      console.warn('[Resend] Warning generating PDF:', pdfErr);
    }

    // Send email with inline CID QR code and PDF attachment
    const emailResult = await sendTicketEmail(guest, ticketUrl, qrCodeBuffer, pdfBuffer);

    if (!emailResult.success) {
      db.updateGuest(guest.id, { emailSent: false });
      return NextResponse.json({
        success: false,
        error: emailResult.error || 'Gagal mengirimkan email. Periksa konfigurasi SMTP server.'
      }, { status: 500 });
    }

    // Mark emailSent: true on successful dispatch
    db.updateGuest(guest.id, { emailSent: true });

    // Record audit log if admin session is present
    if (session) {
      db.recordAuditLog(
        session.userId,
        session.username,
        'RESEND_TICKET_EMAIL',
        `Pengiriman ulang E-Ticket ke ${targetEmail} untuk ${guest.nama} (Token: ${guest.qr_token})`,
        ip
      );
    }

    return NextResponse.json({
      success: true,
      message: `E-Ticket PDF berhasil dikirim ulang ke alamat email: ${targetEmail}`,
      messageId: emailResult.messageId,
      token: guest.qr_token
    });

  } catch (err: any) {
    console.error('[Resend Email Error]:', err);
    return NextResponse.json({
      error: 'Terjadi kesalahan sistem saat mengirim ulang email: ' + (err?.message || '')
    }, { status: 500 });
  }
}
