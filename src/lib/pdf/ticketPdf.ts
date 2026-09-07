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
  status?: string; // 'REGISTRASI' | 'CHECK IN'
  seat_number?: string | null;
  seat_group?: string;
  gedung?: string;
  seat_row?: string;
  seat_num?: string;
  wisma_name?: string;
  room_code?: string;
  registration_id?: string;
  qr_token: string;
  created_at?: string;
}

export async function generateTicketPdf(data: TicketPdfData): Promise<Buffer> {
  const qrBuffer = await QRCode.toBuffer(data.qr_token, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 320,
    color: {
      dark: '#07160F',
      light: '#FFFFFF'
    }
  });

  return new Promise((resolve, reject) => {
    // margins 0 to strictly guarantee exactly 1 page
    const doc = new PDFDocument({
      size: 'A4', // 595.28 x 841.89
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      autoFirstPage: true,
      info: {
        Title: `Event Pass RAPIM TNI 2026 - ${data.nama}`,
        Author: 'Markas Besar Tentara Nasional Indonesia',
        Subject: 'Official Event Pass & Credential Badge',
        Keywords: 'TNI, RAPIM 2026, Event Pass, Akreditasi'
      }
    });

    const chunks: Buffer[] = [];
    (doc as any).on('data', (chunk: Buffer) => chunks.push(chunk));
    (doc as any).on('end', () => resolve(Buffer.concat(chunks)));
    (doc as any).on('error', (err: any) => reject(err));

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    // Matra Color Theme
    let themeColor = '#1E3A8A'; // Default Mabes TNI Blue
    let matraLabel = 'MARKAS BESAR TNI';
    if (data.matra === 'AD') {
      themeColor = '#15803D'; // TNI AD Hijau
      matraLabel = 'TNI ANGKATAN DARAT';
    } else if (data.matra === 'AL') {
      themeColor = '#1E3A8A'; // TNI AL Biru Tua
      matraLabel = 'TNI ANGKATAN LAUT';
    } else if (data.matra === 'AU') {
      themeColor = '#0284C7'; // TNI AU Biru Muda
      matraLabel = 'TNI ANGKATAN UDARA';
    } else if (data.matra === 'NON_TNI') {
      themeColor = '#475569'; // Sipil Abu Elegan
      matraLabel = 'KEMENTERIAN / LEMBAGA NEGARA';
    }

    // 1. Full Page Background
    doc.rect(0, 0, pageWidth, pageHeight).fill('#F8FAFC');

    // 2. Official Top Banner
    const bannerHeight = 110;
    doc.rect(0, 0, pageWidth, bannerHeight).fill(themeColor);

    // Decorative Accent Line
    doc.rect(0, bannerHeight - 4, pageWidth, 4).fill('#F59E0B');

    doc.fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('MARKAS BESAR TENTARA NASIONAL INDONESIA', 40, 24, {
         align: 'center',
         width: pageWidth - 80,
         characterSpacing: 2
       });

    doc.font('Helvetica-Bold')
       .fontSize(18)
       .text('RAPAT PIMPINAN TNI TAHUN 2026', 40, 42, {
         align: 'center',
         width: pageWidth - 80,
         characterSpacing: 0.5
       });

    doc.font('Helvetica-Bold')
       .fontSize(9.5)
       .fillColor('#FDE68A')
       .text('OFFICIAL EVENT PASS & IDENTITAS AKREDITASI', 40, 68, {
         align: 'center',
         width: pageWidth - 80,
         characterSpacing: 1.5
       });

    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('#E2E8F0')
       .text('Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur • 4 – 6 September 2026', 40, 84, {
         align: 'center',
         width: pageWidth - 80
       });

    // 3. Main Pass Card (Modern Flat Container)
    const cardX = 35;
    const cardY = 125;
    const cardWidth = pageWidth - (cardX * 2); // 525.28
    const cardHeight = 675;

    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 14)
       .fillColor('#FFFFFF')
       .strokeColor('#E2E8F0')
       .lineWidth(1)
       .fillAndStroke();

    // 4. Hero Section: NAMA PESERTA & JABATAN
    let currentY = cardY + 24;

    // Category / Matra Pill
    const matraPillWidth = 220;
    const matraPillX = cardX + (cardWidth - matraPillWidth) / 2;
    doc.roundedRect(matraPillX, currentY, matraPillWidth, 20, 10)
       .fillColor(themeColor)
       .fill();

    doc.font('Helvetica-Bold')
       .fontSize(8.5)
       .fillColor('#FFFFFF')
       .text(matraLabel, matraPillX, currentY + 5.5, {
         align: 'center',
         width: matraPillWidth,
         characterSpacing: 1
       });

    currentY += 34;

    // NAMA PESERTA (BESAR & TEBAL)
    const displayName = (data.nama || 'NAMA PESERTA').toUpperCase();
    doc.font('Helvetica-Bold')
       .fontSize(21)
       .fillColor('#0F172A')
       .text(displayName, cardX + 20, currentY, {
         align: 'center',
         width: cardWidth - 40
       });

    currentY += 28;

    // JABATAN & PANGKAT
    const displayRankTitle = `${data.pangkat || ''} ${data.jabatan ? `— ${data.jabatan}` : ''}`.trim().toUpperCase();
    doc.font('Helvetica-Bold')
       .fontSize(11)
       .fillColor('#475569')
       .text(displayRankTitle, cardX + 20, currentY, {
         align: 'center',
         width: cardWidth - 40
       });

    currentY += 24;

    // 5. HIGHLIGHT BLOCKS: STATUS & NOMOR KURSI
    const isCheckIn = data.status === 'CHECK IN' || data.status === 'CHECK_IN';
    const statusText = isCheckIn ? 'STATUS: CHECK IN' : 'STATUS: REGISTRASI';
    const statusBg = isCheckIn ? '#10B981' : '#F59E0B';

    const seatCode = data.seat_number || 'A-07';
    const seatText = `KURSI: ${seatCode}`;

    const blockWidth = 230;
    const blockHeight = 44;
    const blockGap = 16;
    const blockStartX = cardX + (cardWidth - (blockWidth * 2 + blockGap)) / 2;

    // Status Box
    doc.roundedRect(blockStartX, currentY, blockWidth, blockHeight, 8)
       .fillColor(statusBg)
       .fill();

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor('#FFFFFF')
       .text(statusText, blockStartX, currentY + 15, {
         align: 'center',
         width: blockWidth,
         characterSpacing: 0.5
       });

    // Kursi Box
    doc.roundedRect(blockStartX + blockWidth + blockGap, currentY, blockWidth, blockHeight, 8)
       .fillColor('#0F172A')
       .fill();

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fillColor('#FFFFFF')
       .text(seatText, blockStartX + blockWidth + blockGap, currentY + 15, {
         align: 'center',
         width: blockWidth,
         characterSpacing: 0.5
       });

    currentY += blockHeight + 20;

    // Subtle Divider
    doc.moveTo(cardX + 30, currentY)
       .lineTo(cardX + cardWidth - 30, currentY)
       .strokeColor('#E2E8F0')
       .lineWidth(1)
       .stroke();

    currentY += 16;

    // 6. QR CODE (Crisp & Centered)
    const qrSize = 165;
    const qrX = cardX + (cardWidth - qrSize) / 2;
    const qrY = currentY;

    // QR Card Outline
    doc.roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 10)
       .fillColor('#F8FAFC')
       .strokeColor('#CBD5E1')
       .lineWidth(1)
       .fillAndStroke();

    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    currentY += qrSize + 22;

    doc.font('Helvetica')
       .fontSize(8.5)
       .fillColor('#64748B')
       .text('Tunjukkan QR Code ini kepada petugas gate untuk verifikasi dan alokasi kursi', cardX + 20, currentY, {
         align: 'center',
         width: cardWidth - 40
       });

    currentY += 20;

    // Subtle Divider
    doc.moveTo(cardX + 30, currentY)
       .lineTo(cardX + cardWidth - 30, currentY)
       .strokeColor('#E2E8F0')
       .lineWidth(1)
       .stroke();

    currentY += 16;

    // 7. CREDENTIALS MATRIX (Two Columns)
    const gridX = cardX + 30;
    const colWidth = (cardWidth - 60) / 2;

    const infoLeft = [
      { label: 'NRP / IDENTITAS', value: data.nrp ? `NRP ${data.nrp}` : '-' },
      { label: 'SATUAN / SATKER', value: data.instansi || 'Mabes TNI' },
      { label: 'KATEGORI PESERTA', value: data.kategori_tamu || 'Delegasi Resmi' }
    ];

    const wismaVal = data.wisma_name === 'Tidak Menginap'
      ? 'Tidak Menginap'
      : (data.wisma_name ? `${data.wisma_name} (Kamar ${data.room_code || '103A'})` : 'Wisma Soedirman (Kamar 103A)');
    const seatRowChar = data.seat_row || (data.seat_number ? data.seat_number.split('-')[0] : 'A');
    const seatNumChar = data.seat_num || (data.seat_number ? data.seat_number.split('-')[1] : '07');
    const gedungVal = `Gedung Ahmad Yani (Baris ${seatRowChar} No ${seatNumChar})`;

    const infoRight = [
      { label: 'LOKASI SIDANG', value: gedungVal },
      { label: 'AKOMODASI WISMA', value: wismaVal },
      { label: 'NOMOR REGISTRASI', value: data.registration_id || 'REG-2026' }
    ];

    infoLeft.forEach((item, idx) => {
      const rowY = currentY + (idx * 34);
      doc.font('Helvetica-Bold')
         .fontSize(7.5)
         .fillColor('#94A3B8')
         .text(item.label, gridX, rowY);

      doc.font('Helvetica-Bold')
         .fontSize(9.5)
         .fillColor('#1E293B')
         .text(item.value, gridX, rowY + 10, { width: colWidth - 20 });
    });

    infoRight.forEach((item, idx) => {
      const rowY = currentY + (idx * 34);
      const rightX = gridX + colWidth;
      doc.font('Helvetica-Bold')
         .fontSize(7.5)
         .fillColor('#94A3B8')
         .text(item.label, rightX, rowY);

      doc.font('Helvetica-Bold')
         .fontSize(9.5)
         .fillColor('#1E293B')
         .text(item.value, rightX, rowY + 10, { width: colWidth - 20 });
    });

    // 8. Bottom Security Footer
    const footerY = cardY + cardHeight - 34;
    doc.rect(cardX, footerY, cardWidth, 34)
       .fillColor('#F1F5F9')
       .fill();

    doc.font('Helvetica')
       .fontSize(7.5)
       .fillColor('#64748B')
       .text('Dokumen Resmi Mabes TNI • Hak Cipta Panitia RAPIM TNI 2026 • Dicetak secara sah oleh sistem elektronik', cardX, footerY + 11, {
         align: 'center',
         width: cardWidth
       });

    // Finish Document (strictly 1 page!)
    doc.end();
  });
}
