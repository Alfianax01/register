import nodemailer from 'nodemailer';
import { Guest } from '@/types';
import { generateTicketEmailHtml } from './templates/ticketEmail';

export function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

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
    }
  });
}

/**
 * Send official E-Ticket email with inline QR code and optional PDF attachment.
 * IMPORTANT: guest.qr_token (or guest.token) is taken directly from the database record and NEVER regenerated.
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
}> {
  if (!guest.email) {
    return {
      success: false,
      error: 'Peserta tidak memiliki alamat email yang terdaftar.'
    };
  }

  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn('[Nodemailer] SMTP belum dikonfigurasi lengkap (SMTP_HOST atau SMTP_USER kosong). Email otomatis dilewati.');
    return {
      success: false,
      error: 'SMTP host or user is not configured'
    };
  }

  try {
    const fromName = process.env.SMTP_FROM_NAME || 'Panitia RAPIM TNI 2026';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'panitia.rapim@tni.mil.id';
    const fromAddress = `"${fromName}" <${fromEmail}>`;

    const htmlContent = generateTicketEmailHtml({
      guest,
      ticketUrl
    });

    const subject = `[RAPIM TNI 2026] E-Ticket Registrasi - ${guest.pangkat} ${guest.nama}`;

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
        cid: 'qrcode' // inline embedded image referenced by <img src="cid:qrcode">
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

    const info = await transporter.sendMail({
      from: fromAddress,
      to: guest.email,
      subject,
      html: htmlContent,
      attachments
    });

    console.log(`[Nodemailer] E-Ticket email berhasil dikirim ke ${guest.email} (MessageID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err: any) {
    console.error('[Nodemailer Error] Gagal mengirim email tiket:', err);
    return {
      success: false,
      error: err?.message || 'Gagal mengirim email melalui SMTP server'
    };
  }
}
