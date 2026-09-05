import nodemailer from 'nodemailer';
import { Guest } from '@/types';
import { generateTicketEmailHtml } from './templates/ticketEmail';

export function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log('[Mailer Config Check]', {
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
    connectionTimeout: 10000, // 10s timeout for serverless functions
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
}

/**
 * Send official E-Ticket email with inline QR code and optional PDF attachment.
 * Supports standard Nodemailer SMTP and Resend HTTPS REST API.
 * Detailed step-by-step logging for Vercel Function Logs diagnostics.
 */
export async function sendTicketEmail(
  guest: Guest,
  ticketUrl: string,
  qrCodeBuffer: Buffer,
  pdfBuffer?: Buffer
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}> {
  console.log(`\n==================== [MAILER DISPATCH START] ====================`);
  console.log(`[Mailer:Step 1] Target Recipient: ${guest.email} (${guest.nama})`);

  if (!guest.email) {
    console.error(`[Mailer:Step 1 ERROR] Peserta tidak memiliki alamat email yang terdaftar.`);
    return {
      success: false,
      error: 'Peserta tidak memiliki alamat email yang terdaftar.'
    };
  }

  const fromName = process.env.SMTP_FROM_NAME || 'Panitia RAPIM TNI 2026';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'panitia.rapim@tni.mil.id';
  const subject = `[RAPIM TNI 2026] E-Ticket Registrasi - ${guest.pangkat} ${guest.nama}`;

  // --------------------------------------------------------------------------
  // ALTERNATIVE PROVIDER: Resend API (HTTPS Port 443, 100% Reliable in Vercel)
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
      return {
        success: true,
        messageId: resendData.id,
        provider: 'resend'
      };
    } catch (resendErr: any) {
      console.error(`[Mailer:Resend Error] Gagal via Resend API:`, resendErr?.message || resendErr);
      // Fall through to try SMTP if configured
    }
  }

  // --------------------------------------------------------------------------
  // PRIMARY PROVIDER: Nodemailer SMTP
  // --------------------------------------------------------------------------
  console.log(`[Mailer:Step 2] Menginisialisasi koneksi SMTP Nodemailer...`);
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn(`[Mailer:Step 2 FAILED] SMTP belum dikonfigurasi di Environment Variables (SMTP_HOST atau SMTP_USER kosong).`);
    console.warn(`[Mailer:Solusi] Tambahkan SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS di Vercel Dashboard Settings > Environment Variables.`);
    console.log(`==================== [MAILER DISPATCH END] ====================\n`);
    return {
      success: false,
      error: 'SMTP_HOST atau SMTP_USER belum diset di Vercel Environment Variables.'
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
      // Continue to attempt sendMail in case verify is rejected by server policy
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

    return {
      success: true,
      messageId: info.messageId,
      provider: 'smtp'
    };
  } catch (err: any) {
    console.error(`\n[Mailer:FATAL ERROR] Gagal mengirim email tiket ke ${guest.email}:`);
    console.error(`  - Code       : ${err?.code || 'UNKNOWN'}`);
    console.error(`  - Message    : ${err?.message}`);
    console.error(`  - Command    : ${err?.command || '-'}`);
    console.error(`  - Response   : ${err?.response || '-'}`);

    if (err?.code === 'ETIMEDOUT' || err?.code === 'ECONNREFUSED') {
      console.error(`  [Diagnosa Vercel Serverless]:`);
      console.error(`  Koneksi TCP ke port ${process.env.SMTP_PORT || 587} mengalami timeout/diblokir oleh Vercel Serverless.`);
      console.error(`  Rekomendasi: Gunakan RESEND_API_KEY (port 443 HTTPS REST API) yang 100% bebas dari blokir port cloud.`);
    } else if (err?.code === 'EAUTH' || (err?.response && err.response.includes('535'))) {
      console.error(`  [Diagnosa Autentikasi]:`);
      console.error(`  Username atau Sandi Aplikasi (App Password) salah atau belum diset dengan benar.`);
    }

    console.log(`==================== [MAILER DISPATCH END] ====================\n`);

    return {
      success: false,
      error: `Gagal mengirim email (${err?.code || 'SMTP_ERROR'}): ${err?.message}`
    };
  }
}
