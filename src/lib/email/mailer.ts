import nodemailer from 'nodemailer';
import { Guest, Assignment, EmailDeliveryStatus } from '@/types';
import { db } from '@/lib/db';
import { generateTicketEmailHtml } from './templates/ticketEmail';
import { generatePostCheckInEmailHtml } from './templates/postCheckInEmail';

/**
 * Detect SMTP hard bounces (permanent 5xx rejections).
 * Examples: 550 User unknown, Recipient address rejected, 5.1.1 mailbox not found.
 */
export function isHardBounce(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || '');
  const response = String(err.response || '');
  const message = String(err.message || '');
  const fullText = `${code} ${response} ${message}`.toLowerCase();

  // SMTP 5xx permanent failure status codes
  const hardBounceCodes = ['550', '551', '552', '553', '554', '5.1.1', '5.1.2', '5.1.3', '5.2.1'];
  for (const c of hardBounceCodes) {
    if (fullText.includes(c)) return true;
  }

  // Common bounce rejection strings
  const hardBounceKeywords = [
    'user unknown',
    'recipient address rejected',
    'no such user',
    'mailbox unavailable',
    'mailbox not found',
    'address rejected',
    'does not exist',
    'bad destination mailbox',
    'user not found',
    'invalid recipient',
    'undeliverable'
  ];
  for (const kw of hardBounceKeywords) {
    if (fullText.includes(kw)) return true;
  }

  return false;
}

/**
 * Strict RFC-compliant email format check.
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim();
  if (clean.includes('..')) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(clean);
}

export function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log('[Mailer Config Check]', {
    EMAIL_ENABLED: process.env.EMAIL_ENABLED !== 'false',
    SMTP_HOST: host ? `${host}:${port}` : '(NOT_CONFIGURED)',
    SMTP_SECURE: secure,
    SMTP_USER: user ? `${user.slice(0, 4)}***@${user.split('@')[1] || ''}` : '(NOT_CONFIGURED)',
    SMTP_PASS_SET: !!pass,
    RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY,
    IS_VERCEL: process.env.VERCEL === '1',
    ENV: process.env.NODE_ENV
  });

  if (!host || !user) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: pass || ''
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
}

/**
 * Send official E-Ticket email with inline QR code and optional PDF attachment.
 * IMPORTANT: guest.qr_token (or guest.token) is taken directly from the database record and NEVER regenerated.
 * Includes hard bounce detection, dev simulation toggle, and comprehensive audit logging.
 */
export async function sendTicketEmail(
  guest: Guest,
  ticketUrl: string,
  qrCodeBuffer: Buffer,
  pdfBuffer?: Buffer
): Promise<{
  success: boolean;
  status: EmailDeliveryStatus;
  messageId?: string;
  error?: string;
  provider?: string;
  simulated?: boolean;
}> {
  console.log(`\n==================== [MAILER DISPATCH START] ====================`);
  console.log(`[Mailer:Step 1] Target Recipient: ${guest.email} (${guest.nama})`);

  if (!guest.email) {
    console.error(`[Mailer:Step 1 ERROR] Peserta tidak memiliki alamat email yang terdaftar.`);
    return {
      success: false,
      status: 'FAILED',
      error: 'Peserta tidak memiliki alamat email yang terdaftar.'
    };
  }

  const subject = `[RAPIM TNI 2026] E-Ticket Registrasi - ${guest.pangkat} ${guest.nama}`;

  // Validate format
  if (!isValidEmailFormat(guest.email)) {
    console.error(`[Mailer:INVALID FORMAT] Format alamat email '${guest.email}' tidak valid.`);
    db.addEmailLog({
      guest_id: guest.id,
      email: guest.email,
      subject,
      status: 'FAILED',
      error_message: 'Format alamat email tidak valid'
    });
    db.updateGuest(guest.id, {
      email_status: 'FAILED',
      emailSent: false,
      last_email_error: 'Format alamat email tidak valid'
    });
    return {
      success: false,
      status: 'FAILED',
      error: 'Format alamat email tidak valid.'
    };
  }

  // Hard bounce guard: never retry bounced emails
  if (guest.email_status === 'BOUNCED') {
    const bounceReason = guest.last_email_error || '550 Recipient address rejected (User unknown)';
    console.warn(`[Mailer:STOP RETRY] Email ${guest.email} sebelumnya terdeteksi BOUNCED. Pengiriman otomatis dihentikan.`);
    return {
      success: false,
      status: 'BOUNCED',
      error: `Email ${guest.email} memantul (${bounceReason}). Pengiriman dibatalkan demi mencegah spam delivery failure.`
    };
  }

  // Determine professional sender name
  const isProd = process.env.NODE_ENV === 'production';
  const fromName = isProd
    ? (process.env.SMTP_FROM_NAME || 'Portal RAPIM TNI 2026')
    : (process.env.SMTP_FROM_NAME || 'RAPIM TNI 2026 (Development)');
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'eregister287@gmail.com';

  // --------------------------------------------------------------------------
  // DEVELOPMENT SIMULATION MODE (EMAIL_ENABLED=false)
  // When false, NEVER contact external SMTP or Resend API.
  // --------------------------------------------------------------------------
  const isEmailEnabled = process.env.EMAIL_ENABLED !== 'false';
  if (!isEmailEnabled) {
    const simulatedId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    console.log(`[Mailer:DEV MODE] EMAIL_ENABLED=false. Email berhasil disimulasikan untuk: ${guest.email} (${guest.nama})`);
    console.log(`[Mailer:DEV MODE] Message ID: ${simulatedId}`);
    console.log(`==================== [MAILER DISPATCH END] ====================\n`);

    db.addEmailLog({
      guest_id: guest.id,
      email: guest.email,
      subject,
      status: 'SENT',
      message_id: simulatedId,
      provider: 'simulated_dev_mode',
      error_message: '[DEV MODE SIMULATED]'
    });

    db.updateGuest(guest.id, {
      email_status: 'SENT',
      emailSent: true,
      last_email_error: undefined,
      email_retry_count: 0
    });

    return {
      success: true,
      status: 'SENT',
      simulated: true,
      messageId: simulatedId,
      provider: 'simulated_dev_mode'
    };
  }

  // --------------------------------------------------------------------------
  // PROVIDER 1: Resend API (HTTPS Port 443, Serverless-Optimized)
  // --------------------------------------------------------------------------
  if (process.env.RESEND_API_KEY) {
    console.log(`[Mailer:Step 2] Menggunakan Resend HTTP API (Serverless-Optimized)...`);
    try {
      const htmlContent = generateTicketEmailHtml({ guest, ticketUrl });
      const attachmentsPayload: any[] = [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer.toString('base64'),
          cid: 'qrcode'
        }
      ];

      if (pdfBuffer && Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 0) {
        const cleanName = (guest.nrp || guest.nama).replace(/[^a-zA-Z0-9]/g, '_');
        attachmentsPayload.push({
          filename: `ETicket_RAPIM_TNI_2026_${cleanName}.pdf`,
          content: pdfBuffer.toString('base64')
        });
      }

      console.log(`[Mailer:Step 3] Mengirimkan payload ke https://api.resend.com/emails...`);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${fromName} <${process.env.RESEND_FROM || 'onboarding@resend.dev'}>`,
          to: [guest.email],
          subject,
          html: htmlContent,
          attachments: attachmentsPayload
        })
      });

      const resendData = await res.json();
      if (!res.ok) {
        throw new Error(resendData.message || resendData.error || `HTTP ${res.status} from Resend API`);
      }

      console.log(`[Mailer:SUCCESS] Email berhasil dikirim via Resend API! ID: ${resendData.id}`);
      console.log(`==================== [MAILER DISPATCH END] ====================\n`);

      db.addEmailLog({
        guest_id: guest.id,
        email: guest.email,
        subject,
        status: 'SENT',
        message_id: resendData.id,
        provider: 'resend'
      });

      db.updateGuest(guest.id, {
        email_status: 'SENT',
        emailSent: true,
        last_email_error: undefined,
        email_retry_count: 0
      });

      return {
        success: true,
        status: 'SENT',
        messageId: resendData.id,
        provider: 'resend'
      };
    } catch (resendErr: any) {
      console.error(`[Mailer:Resend Error] Gagal via Resend API:`, resendErr?.message || resendErr);
      if (isHardBounce(resendErr)) {
        const errorMsg = resendErr?.message || 'Resend rejected recipient address';
        db.addEmailLog({
          guest_id: guest.id,
          email: guest.email,
          subject,
          status: 'BOUNCED',
          error_message: errorMsg,
          provider: 'resend'
        });
        db.updateGuest(guest.id, {
          email_status: 'BOUNCED',
          emailSent: false,
          last_email_error: errorMsg
        });
        return {
          success: false,
          status: 'BOUNCED',
          error: `Alamat email ditolak oleh server penerima (Bounced): ${errorMsg}`
        };
      }
    }
  }

  // --------------------------------------------------------------------------
  // PROVIDER 2: Nodemailer SMTP
  // --------------------------------------------------------------------------
  console.log(`[Mailer:Step 2] Menginisialisasi koneksi SMTP Nodemailer...`);
  const transporter = getEmailTransporter();
  if (!transporter) {
    const errorMsg = 'SMTP_HOST atau SMTP_USER belum diset di Environment Variables.';
    console.warn(`[Mailer:Step 2 FAILED] ${errorMsg}`);
    console.log(`==================== [MAILER DISPATCH END] ====================\n`);

    db.addEmailLog({
      guest_id: guest.id,
      email: guest.email,
      subject,
      status: 'FAILED',
      error_message: errorMsg,
      provider: 'smtp'
    });

    db.updateGuest(guest.id, {
      email_status: 'FAILED',
      emailSent: false,
      last_email_error: errorMsg
    });

    return {
      success: false,
      status: 'FAILED',
      error: errorMsg
    };
  }

  try {
    console.log(`[Mailer:Step 3] Memverifikasi koneksi handshake SMTP ke ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}...`);
    try {
      await transporter.verify();
      console.log(`[Mailer:Step 3 PASSED] Verifikasi koneksi & autentikasi SMTP server sukses!`);
    } catch (verifyErr: any) {
      console.error(`[Mailer:Step 3 WARNING] Transporter verify gagal:`, {
        code: verifyErr?.code,
        command: verifyErr?.command,
        message: verifyErr?.message,
        response: verifyErr?.response
      });
      if (isHardBounce(verifyErr)) {
        throw verifyErr;
      }
    }

    console.log(`[Mailer:Step 4] Mengkompilasi template HTML militer dan lampiran QR Code (${qrCodeBuffer.length} bytes)...`);
    const htmlContent = generateTicketEmailHtml({
      guest,
      ticketUrl
    });

    const attachments: Array<{
      filename: string;
      content: Buffer;
      contentType?: string;
      cid?: string;
    }> = [
      {
        filename: 'qrcode.png',
        content: qrCodeBuffer,
        contentType: 'image/png',
        cid: 'qrcode'
      }
    ];

    if (pdfBuffer && Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 0) {
      const cleanName = (guest.nrp || guest.nama).replace(/[^a-zA-Z0-9]/g, '_');
      attachments.push({
        filename: `ETicket_RAPIM_TNI_2026_${cleanName}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    console.log(`[Mailer:Step 5] Mengirim email ke ${guest.email} via "${fromName}" <${fromEmail}>...`);
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: guest.email,
      subject,
      html: htmlContent,
      attachments
    });

    console.log(`[Mailer:SUCCESS] Email E-Ticket berhasil diterima server SMTP!`);
    console.log(`  - Message ID : ${info.messageId}`);
    console.log(`  - Response   : ${info.response}`);
    console.log(`==================== [MAILER DISPATCH END] ====================\n`);

    db.addEmailLog({
      guest_id: guest.id,
      email: guest.email,
      subject,
      status: 'SENT',
      message_id: info.messageId,
      provider: 'smtp'
    });

    db.updateGuest(guest.id, {
      email_status: 'SENT',
      emailSent: true,
      last_email_error: undefined,
      email_retry_count: 0
    });

    return {
      success: true,
      status: 'SENT',
      messageId: info.messageId,
      provider: 'smtp'
    };
  } catch (err: any) {
    console.error(`\n[Mailer:FATAL ERROR] Gagal mengirim email tiket ke ${guest.email}:`);
    console.error(`  - Code       : ${err?.code || 'UNKNOWN'}`);
    console.error(`  - Message    : ${err?.message}`);
    console.error(`  - Command    : ${err?.command || '-'}`);
    console.error(`  - Response   : ${err?.response || '-'}`);

    const hardBounce = isHardBounce(err);
    const errorMsg = err?.response || err?.message || 'SMTP delivery failed';

    if (hardBounce) {
      console.error(`  [HARD BOUNCE DETECTED]: Server penerima menolak alamat ${guest.email}.`);
      console.error(`  Tindakan: Menandai status BOUNCED dan MENGHENTIKAN percobaan retry otomatis.`);
      console.log(`==================== [MAILER DISPATCH END] ====================\n`);

      db.addEmailLog({
        guest_id: guest.id,
        email: guest.email,
        subject,
        status: 'BOUNCED',
        error_message: errorMsg,
        provider: 'smtp'
      });

      db.updateGuest(guest.id, {
        email_status: 'BOUNCED',
        emailSent: false,
        last_email_error: errorMsg
      });

      return {
        success: false,
        status: 'BOUNCED',
        error: `Alamat email ditolak oleh server penerima (User unknown/bounced): ${errorMsg}`
      };
    }

    const currentRetries = (guest.email_retry_count || 0) + 1;
    db.addEmailLog({
      guest_id: guest.id,
      email: guest.email,
      subject,
      status: 'FAILED',
      error_message: errorMsg,
      provider: 'smtp'
    });

    db.updateGuest(guest.id, {
      email_status: 'FAILED',
      emailSent: false,
      email_retry_count: currentRetries,
      last_email_error: errorMsg
    });

    console.log(`==================== [MAILER DISPATCH END] ====================\n`);

    return {
      success: false,
      status: 'FAILED',
      error: `Gagal mengirim email (${err?.code || 'SMTP_ERROR'}): ${err?.message}`
    };
  }
}

/**
 * Kirim email notifikasi post check-in secara otomatis dengan detail penempatan kursi dan wisma.
 */
export async function sendPostCheckInEmail(
  guest: Guest,
  assignment: Assignment,
  checkinDetails: { gate: string; waktu: string; petugas: string }
): Promise<{ success: boolean; error?: string }> {
  if (!guest.email) {
    return { success: false, error: 'Peserta tidak memiliki alamat email.' };
  }

  // Hard bounce guard
  if (guest.email_status === 'BOUNCED') {
    return { success: false, error: 'Alamat email peserta sebelumnya terdeteksi BOUNCED.' };
  }

  const subject = `[RAPIM TNI 2026] Informasi Kursi & Akomodasi — ${guest.nama}`;

  // Dev simulation mode check
  const isEmailEnabled = process.env.EMAIL_ENABLED !== 'false';
  if (!isEmailEnabled) {
    console.log(`[Mailer:DEV MODE] Post check-in email disimulasikan untuk: ${guest.email}`);
    db.addEmailLog({
      guest_id: guest.id,
      email: guest.email,
      subject,
      status: 'SENT',
      message_id: `sim_post_${Date.now()}`,
      provider: 'simulated_dev_mode',
      error_message: '[DEV MODE SIMULATED POST CHECK-IN]'
    });
    return { success: true };
  }

  const htmlContent = generatePostCheckInEmailHtml({ guest, assignment, checkinDetails });

  const isProd = process.env.NODE_ENV === 'production';
  const fromName = isProd
    ? (process.env.SMTP_FROM_NAME || 'Portal RAPIM TNI 2026')
    : (process.env.SMTP_FROM_NAME || 'RAPIM TNI 2026 (Development)');
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'eregister287@gmail.com';

  // 1. Resend API (HTTPS REST)
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [guest.email],
          subject,
          html: htmlContent
        })
      });
      if (res.ok) {
        console.log(`[Mailer] Post check-in email sent via Resend to ${guest.email}`);
        return { success: true };
      }
    } catch (e: any) {
      console.warn('[Mailer] Resend post checkin email error:', e?.message);
    }
  }

  // 2. SMTP Transporter
  const transporter = getEmailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: guest.email,
        subject,
        html: htmlContent
      });
      console.log(`[Mailer] Post check-in email sent via SMTP to ${guest.email}`);
      return { success: true };
    } catch (e: any) {
      console.warn('[Mailer] SMTP post checkin email error:', e?.message);
    }
  }

  return { success: false, error: 'Email transporter not available' };
}
