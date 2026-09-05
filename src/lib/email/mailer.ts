import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

export interface TicketEmailPayload {
  to: string;
  nama: string;
  pangkat: string;
  nrp?: string | null;
  jabatan: string;
  instansi: string;
  seat_number?: string | null;
  registration_id?: string;
  qr_token: string;
  pdfBuffer?: Buffer;
}

export async function sendTicketEmail(payload: TicketEmailPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const {
    to,
    nama,
    pangkat,
    nrp,
    jabatan,
    instansi,
    seat_number,
    registration_id,
    qr_token,
    pdfBuffer
  } = payload;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('[Nodemailer] Konfigurasi SMTP belum diisi di environment variables. Melewati pengiriman email otomatis.');
    return {
      success: false,
      error: 'SMTP host or user is not configured'
    };
  }

  try {
    const port = Number(process.env.SMTP_PORT) || 587;
    const isSecure = port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || ''
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Generate QR Code Buffer for CID Attachment
    const qrBuffer = await QRCode.toBuffer(qr_token, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 260,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    });

    const regNumber = registration_id || (nrp ? `REG-${nrp}` : 'REG-2026');
    const seatDisplay = seat_number || 'Penempatan di Meja Registrasi';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>E-Ticket Registrasi RAPIM TNI 2026</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #1e3a8a; padding: 28px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; font-size: 12px; opacity: 0.9; }
    .content { padding: 28px 24px; }
    .title-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; }
    .title-box h2 { margin: 0; font-size: 15px; color: #0f172a; }
    .title-box p { margin: 4px 0 0; font-size: 12px; color: #64748B; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .info-table td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; }
    .info-table td.label { width: 35%; color: #64748B; font-weight: 500; font-size: 12px; }
    .info-table td.value { color: #0f172a; font-weight: 600; }
    .qr-card { text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .qr-card img { width: 160px; height: 160px; display: inline-block; }
    .qr-card p { margin: 10px 0 0; font-size: 12px; color: #475569; font-weight: 500; }
    .seat-badge { display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-size: 16px; font-weight: 700; padding: 6px 14px; border-radius: 6px; font-family: monospace; }
    .instructions { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px 18px; font-size: 12px; color: #92400e; margin-bottom: 24px; line-height: 1.6; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748B; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; color: #93c5fd;">
        Markas Besar Tentara Nasional Indonesia
      </div>
      <h1>RAPAT PIMPINAN (RAPIM) TNI 2026</h1>
      <p>Surat Tanda Masuk & Kartu Peserta Resmi Akreditasi</p>
    </div>

    <div class="content">
      <div class="title-box">
        <h2>Pendaftaran Berhasil Terverifikasi</h2>
        <p>E-Ticket dan QR Code resmi Anda telah diterbitkan oleh Sekretariat Panitia RAPIM TNI 2026.</p>
      </div>

      <table class="info-table">
        <tr>
          <td class="label">Nama Lengkap</td>
          <td class="value">${nama}</td>
        </tr>
        <tr>
          <td class="label">Pangkat & NRP</td>
          <td class="value">${pangkat} ${nrp ? `&bull; NRP ${nrp}` : ''}</td>
        </tr>
        <tr>
          <td class="label">Jabatan Dinas</td>
          <td class="value">${jabatan}</td>
        </tr>
        <tr>
          <td class="label">Instansi / Satuan</td>
          <td class="value">${instansi}</td>
        </tr>
        <tr>
          <td class="label">Nomor Registrasi</td>
          <td class="value" style="font-family: monospace;">${regNumber}</td>
        </tr>
        <tr>
          <td class="label">Alokasi Kursi</td>
          <td class="value"><span class="seat-badge">${seatDisplay}</span></td>
        </tr>
      </table>

      <div class="qr-card">
        <img src="cid:qrcode" alt="QR Code E-Ticket" />
        <p>Tunjukkan QR Code ini di Gate Utama Hankam Gedung Ahmad Yani</p>
        <span style="font-family: monospace; font-size: 11px; color: #64748B;">TOKEN: ${qr_token.substring(0, 18)}...</span>
      </div>

      <div class="instructions">
        <strong>Ketentuan Kehadiran:</strong><br>
        1. Pelaksanaan: <strong>4 – 6 September 2026</strong> bertempat di <strong>Gedung Ahmad Yani Mabes TNI Cilangkap</strong>.<br>
        2. Gerbang pemindaian QR Code dibuka mulai pukul <strong>06.30 WIB</strong>.<br>
        3. Pakaian Dinas: <strong>PDU I</strong> bagi prajurit TNI aktif, <strong>PSL / PSH</strong> atau <strong>Batik Nasional</strong> bagi undangan sipil.<br>
        4. Berkas PDF E-Ticket resmi telah dilampirkan pada email ini untuk kemudahan cetak fisik format A4.
      </div>
    </div>

    <div class="footer">
      Panitia Pelaksana RAPIM TNI Tahun 2026<br>
      Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur<br>
      <em>Email ini dikirimkan otomatis oleh sistem akreditasi resmi. Harap tidak membalas email ini.</em>
    </div>
  </div>
</body>
</html>
    `;

    const attachments: any[] = [
      {
        filename: 'qrcode.png',
        content: qrBuffer,
        cid: 'qrcode'
      }
    ];

    if (pdfBuffer) {
      attachments.push({
        filename: `ETicket_RAPIM_TNI_2026_${nrp ? nrp.replace(/\s+/g, '') : 'Peserta'}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      });
    }

    const info = await transporter.sendMail({
      from: `"Sekretariat RAPIM TNI 2026" <${process.env.SMTP_USER}>`,
      to,
      subject: '[RAPIM TNI 2026] E-Ticket Registrasi',
      html: htmlContent,
      attachments
    });

    console.log(`[Nodemailer] Email E-Ticket berhasil dikirim ke ${to}. Message ID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err: any) {
    console.error(`[Nodemailer] Gagal mengirim email ke ${to}:`, err);
    return {
      success: false,
      error: err?.message || 'Gagal mengirim email'
    };
  }
}

