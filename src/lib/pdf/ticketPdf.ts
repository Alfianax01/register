import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export interface TicketPdfData {
  nama: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  pangkat: string;
  nrp?: string | null;
  jabatan: string;
  instansi: string;
  kategori_tamu?: string;
  matra?: string;
  seat_number?: string | null;
  seat_group?: string;
  registration_id?: string;
  qr_token: string;
  created_at?: string;
}

export async function generateTicketPdf(data: TicketPdfData): Promise<Buffer> {
  // Generate QR Code Buffer
  const qrBuffer = await QRCode.toBuffer(data.qr_token, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 280,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4', // 595.28 x 841.89
      margins: { top: 36, bottom: 36, left: 40, right: 40 },
      autoFirstPage: true,
      info: {
        Title: `E-Ticket RAPIM TNI 2026 - ${data.nama}`,
        Author: 'Sekretariat Panitia RAPIM TNI 2026',
        Subject: 'Surat Tanda Masuk & E-Ticket Resmi',
        Keywords: 'TNI, RAPIM 2026, E-Ticket, Akreditasi'
      }
    });

    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const marginX = 40;
    const contentWidth = pageWidth - (marginX * 2); // 515.28

    // ----------------------------------------------------------
    // 1. OUTER DECORATIVE BORDER (Invoice Style)
    // ----------------------------------------------------------
    doc.rect(24, 24, pageWidth - 48, pageHeight - 48)
       .lineWidth(1.5)
       .strokeColor('#0F172A')
       .stroke();

    doc.rect(27, 27, pageWidth - 54, pageHeight - 54)
       .lineWidth(0.5)
       .strokeColor('#94A3B8')
       .stroke();

    // ----------------------------------------------------------
    // 2. OFFICIAL HEADER BAR
    // ----------------------------------------------------------
    doc.rect(28, 28, pageWidth - 56, 76)
       .fillColor('#1E3A8A')
       .fill();

    doc.fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text('MARKAS BESAR TENTARA NASIONAL INDONESIA', marginX, 40, {
         align: 'center',
         width: contentWidth,
         characterSpacing: 1.5
       });

    doc.font('Helvetica-Bold')
       .fontSize(15)
       .text('RAPAT PIMPINAN (RAPIM) TNI TAHUN 2026', marginX, 56, {
         align: 'center',
         width: contentWidth,
         characterSpacing: 0.5
       });

    doc.font('Helvetica')
       .fontSize(8.5)
       .text('Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur • 4 – 6 September 2026', marginX, 76, {
         align: 'center',
         width: contentWidth
       });

    // ----------------------------------------------------------
    // 3. DOCUMENT TITLE STRIP
    // ----------------------------------------------------------
    const titleY = 114;
    doc.rect(marginX, titleY, contentWidth, 26)
       .fillColor('#F1F5F9')
       .strokeColor('#CBD5E1')
       .lineWidth(1)
       .fillAndStroke();

    doc.fillColor('#0F172A')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text('SURAT TANDA MASUK & E-TICKET RESMI AKREDITASI', marginX + 12, titleY + 7);

    const regId = data.registration_id || (data.nrp ? `REG-${data.nrp}` : 'REG-2026-TNI');
    doc.font('Helvetica-Bold')
       .fontSize(10)
       .fillColor('#1E40AF')
       .text(`NO. REG: ${regId}`, marginX, titleY + 7, {
         align: 'right',
         width: contentWidth - 12
       });

    // ----------------------------------------------------------
    // 4. MAIN BODY (TWO COLUMNS: DATA & SEATING/QR)
    // ----------------------------------------------------------
    const bodyStartY = 152;
    const col1Width = 310;
    const col2X = marginX + col1Width + 15;
    const col2Width = contentWidth - col1Width - 15; // 190

    // LEFT COLUMN: DATA IDENTITAS PESERTA
    doc.rect(marginX, bodyStartY, col1Width, 310)
       .fillColor('#FFFFFF')
       .strokeColor('#E2E8F0')
       .lineWidth(1)
       .fillAndStroke();

    // Table Header
    doc.rect(marginX, bodyStartY, col1Width, 22)
       .fillColor('#F8FAFC')
       .strokeColor('#E2E8F0')
       .lineWidth(1)
       .fillAndStroke();

    doc.font('Helvetica-Bold')
       .fontSize(9)
       .fillColor('#334155')
       .text('DATA IDENTITAS TAMU UNDANGAN / PRAJURIT', marginX + 10, bodyStartY + 6);

    const fullName = [data.gelar_depan, data.nama, data.gelar_belakang].filter(Boolean).join(' ');

    const rows: Array<{ label: string; val: string; bold?: boolean }> = [
      { label: 'Nama Lengkap', val: fullName || '-', bold: true },
      { label: 'Pangkat / Korps', val: data.pangkat || '-' },
      { label: 'NRP / NIP', val: data.nrp || 'NON-TNI (Undangan Sipil)' },
      { label: 'Jabatan Dinas', val: data.jabatan || '-' },
      { label: 'Instansi / Satuan', val: data.instansi || '-' },
      { label: 'Matra / Kategori', val: data.matra ? (data.matra === 'NON_TNI' ? 'Sipil / Kementerian' : `TNI ${data.matra}`) : (data.kategori_tamu || 'TNI') },
      { label: 'Status Akreditasi', val: 'TERDAFTAR & TERVERIFIKASI RESMI', bold: true }
    ];

    let currentY = bodyStartY + 30;
    rows.forEach((r, idx) => {
      // Alternating row shade
      if (idx % 2 === 1) {
        doc.rect(marginX + 2, currentY - 3, col1Width - 4, 34)
           .fillColor('#F8FAFC')
           .fill();
      }

      doc.font('Helvetica-Bold')
         .fontSize(8)
         .fillColor('#64748B')
         .text(r.label.toUpperCase(), marginX + 10, currentY);

      doc.font(r.bold ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(9)
         .fillColor('#0F172A')
         .text(r.val, marginX + 10, currentY + 12, {
           width: col1Width - 20,
           lineBreak: true
         });

      currentY += 38;
    });

    // RIGHT COLUMN: SEATING & QR CODE
    doc.rect(col2X, bodyStartY, col2Width, 310)
       .fillColor('#FFFFFF')
       .strokeColor('#E2E8F0')
       .lineWidth(1)
       .fillAndStroke();

    // Box Penempatan Kursi
    doc.rect(col2X, bodyStartY, col2Width, 75)
       .fillColor('#F8FAFC')
       .strokeColor('#CBD5E1')
       .lineWidth(1)
       .fillAndStroke();

    doc.font('Helvetica-Bold')
       .fontSize(8)
       .fillColor('#64748B')
       .text('ALOKASI TEMPAT DUDUK', col2X, bodyStartY + 8, {
         align: 'center',
         width: col2Width
       });

    const seatDisplay = data.seat_number || 'DI MEJA REGISTRASI';
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fillColor('#1E3A8A')
       .text(seatDisplay, col2X, bodyStartY + 23, {
         align: 'center',
         width: col2Width
       });

    doc.font('Helvetica')
       .fontSize(7.5)
       .fillColor('#475569')
       .text(data.seat_group || 'Sidang Paripurna Gedung Ahmad Yani', col2X, bodyStartY + 50, {
         align: 'center',
         width: col2Width
       });

    // QR Code Box
    const qrBoxY = bodyStartY + 85;
    const qrSize = 130;
    const qrX = col2X + ((col2Width - qrSize) / 2);

    doc.image(qrBuffer, qrX, qrBoxY + 5, { width: qrSize, height: qrSize });

    // QR Token String
    doc.font('Helvetica-Bold')
       .fontSize(7.5)
       .fillColor('#0F172A')
       .text(`TOKEN: ${data.qr_token.substring(0, 20)}...`, col2X, qrBoxY + qrSize + 12, {
         align: 'center',
         width: col2Width
       });

    doc.font('Helvetica')
       .fontSize(7)
       .fillColor('#64748B')
       .text('Tunjukkan QR Code ini di Scanner Gate Utama', col2X + 6, qrBoxY + qrSize + 26, {
         align: 'center',
         width: col2Width - 12
       });

    // ----------------------------------------------------------
    // 5. JADWAL & KETENTUAN MASUK (INVOICE TERMS BOX)
    // ----------------------------------------------------------
    const termsY = 475;
    doc.rect(marginX, termsY, contentWidth, 195)
       .fillColor('#F8FAFC')
       .strokeColor('#CBD5E1')
       .lineWidth(1)
       .fillAndStroke();

    doc.font('Helvetica-Bold')
       .fontSize(9)
       .fillColor('#0F172A')
       .text('PETUNJUK PELAKSANAAN & TATA TERTIB KEHADIRAN', marginX + 12, termsY + 10);

    const rules = [
      'Pemeriksaan keamanan dan pemindaian barcode presensi gate masuk dibuka mulai pukul 06.30 WIB di Gate Utama Hankam.',
      'Seluruh tamu undangan diharapkan telah menempati kursi sidang paling lambat pukul 07.30 WIB sebelum upacara pembukaan resmi dimulai.',
      'Pakaian Dinas: Prajurit TNI aktif mengenakan PDU I, Pejabat Kementerian/Lembaga mengenakan PSL / PSH, dan Tamu Kehormatan mengenakan Batik Nasional Lengan Panjang.',
      'E-Ticket ini bersifat personal dan tidak dapat dipindahtangankan. Membawa cetakan fisik kertas A4 ini atau menunjukkan QR Code di smartphone sama-sama sah.',
      'Bagi peserta yang memerlukan fasilitas akomodasi wisma, harap menunjukkan lembar akreditasi ini kepada petugas resepsionis Wisma Soedirman / Wisma Kartika.'
    ];

    let ruleY = termsY + 28;
    rules.forEach((rule, idx) => {
      doc.font('Helvetica-Bold')
         .fontSize(8)
         .fillColor('#1E40AF')
         .text(`${idx + 1}.`, marginX + 12, ruleY);

      doc.font('Helvetica')
         .fontSize(8)
         .fillColor('#334155')
         .text(rule, marginX + 26, ruleY, {
           width: contentWidth - 40,
           lineGap: 2
         });

      ruleY += 31;
    });

    // ----------------------------------------------------------
    // 6. OFFICIAL FOOTER STAMP & SECURITY VERIFICATION
    // ----------------------------------------------------------
    const footerY = 682;
    doc.rect(marginX, footerY, contentWidth, 80)
       .fillColor('#FFFFFF')
       .strokeColor('#E2E8F0')
       .lineWidth(1)
       .fillAndStroke();

    // Security note on left
    doc.font('Helvetica-Bold')
       .fontSize(8)
       .fillColor('#0F172A')
       .text('VERIFIKASI KEASLIAN DOKUMEN ELEKTRONIK', marginX + 14, footerY + 12);

    doc.font('Helvetica')
       .fontSize(7.5)
       .fillColor('#64748B')
       .text(
         `Dokumen akreditasi resmi ini diterbitkan secara otomatis oleh Sistem Portal Registrasi Mabes TNI.\n` +
         `Waktu Penerbitan: ${data.created_at || new Date().toLocaleString('id-ID')}\n` +
         `Security Hash ID: ${Buffer.from(data.qr_token).toString('base64').substring(0, 32)}`,
         marginX + 14,
         footerY + 25,
         { width: 300, lineGap: 2 }
       );

    // Official signature stamp on right
    doc.rect(contentWidth - 120, footerY + 10, 150, 60)
       .strokeColor('#CBD5E1')
       .lineWidth(0.5)
       .stroke();

    doc.font('Helvetica-Bold')
       .fontSize(7.5)
       .fillColor('#1E3A8A')
       .text('PANITIA PELAKSANA', contentWidth - 120, footerY + 16, {
         align: 'center',
         width: 150
       });

    doc.font('Helvetica')
       .fontSize(6.5)
       .fillColor('#64748B')
       .text('SEKRETARIAT RAPIM TNI 2026', contentWidth - 120, footerY + 26, {
         align: 'center',
         width: 150
       });

    doc.font('Helvetica-Bold')
       .fontSize(8)
       .fillColor('#16A34A')
       .text('[ DIVERIFIKASI DIGITAL ]', contentWidth - 120, footerY + 48, {
         align: 'center',
         width: 150
       });

    // Final Page Bottom Notice
    doc.font('Helvetica')
       .fontSize(7)
       .fillColor('#94A3B8')
       .text('Halaman 1 dari 1 • Lembar Surat Tanda Masuk Resmi RAPIM TNI 2026 • Dicetak secara sah oleh sistem', marginX, pageHeight - 40, {
         align: 'center',
         width: contentWidth
       });

    doc.end();
  });
}

