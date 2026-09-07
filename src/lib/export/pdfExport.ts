import PDFDocument from 'pdfkit';
import { Guest } from '@/types';

export interface PdfExportMeta {
  title?: string;
  subtitle?: string;
}

/**
 * Format tanggal ke standar WIB (Asia/Jakarta)
 */
function formatWIB(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, ':');
  } catch {
    return '-';
  }
}

/**
 * Menghasilkan Buffer PDF Dokumen Rekapitulasi Presensi Resmi RAPIM TNI 2026.
 * Format Landscape A4, 8 Kolom Lengkap, Badge Status Berwarna, dan Penomoran Halaman Dinamis.
 */
export async function generateGuestsPdfBuffer(
  guests: Guest[],
  meta?: PdfExportMeta
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Landscape A4: 841.89 x 595.28 points
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 32, bottom: 36, left: 36, right: 36 },
        bufferPages: true,
        info: {
          Title: meta?.title || 'Daftar Induk Peserta & Akreditasi RAPIM TNI 2026',
          Author: 'Sekretariat Panitia RAPIM TNI 2026',
          Subject: 'Rekapitulasi Presensi & Akreditasi Resmi',
          Keywords: 'RAPIM TNI 2026, Presensi, Akreditasi, Delegasi'
        }
      });

      const chunks: Buffer[] = [];
      (doc as any).on('data', (chunk: Buffer) => chunks.push(chunk));
      (doc as any).on('end', () => resolve(Buffer.concat(chunks)));
      (doc as any).on('error', (err: any) => reject(err));

      const pageWidth = 841.89;
      const pageHeight = 595.28;
      const marginX = 36;
      const contentWidth = pageWidth - (marginX * 2); // 769.89

      // Definisi Lebar 8 Kolom
      const colWidths = {
        no: 28,
        nama: 155,
        matra: 45,
        pangkatNrp: 120,
        jabatanSatker: 150,
        satuan: 135,
        kursi: 52,
        status: 84
      };

      // Helper menggambar Header Tabel
      const drawTableHeader = (startY: number) => {
        doc.rect(marginX, startY, contentWidth, 22)
           .fillColor('#1E3A8A')
           .fill();

        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(8);

        let currentX = marginX;

        // 1. NO
        doc.text('NO', currentX, startY + 7, { width: colWidths.no, align: 'center' });
        currentX += colWidths.no;

        // 2. NAMA PESERTA
        doc.text('NAMA PESERTA', currentX + 4, startY + 7, { width: colWidths.nama - 4, align: 'left' });
        currentX += colWidths.nama;

        // 3. MATRA
        doc.text('MATRA', currentX, startY + 7, { width: colWidths.matra, align: 'center' });
        currentX += colWidths.matra;

        // 4. PANGKAT & NRP
        doc.text('PANGKAT & NRP', currentX + 4, startY + 7, { width: colWidths.pangkatNrp - 4, align: 'left' });
        currentX += colWidths.pangkatNrp;

        // 5. JABATAN & SATKER
        doc.text('JABATAN & SATKER', currentX + 4, startY + 7, { width: colWidths.jabatanSatker - 4, align: 'left' });
        currentX += colWidths.jabatanSatker;

        // 6. SATUAN
        doc.text('SATUAN / INSTANSI', currentX + 4, startY + 7, { width: colWidths.satuan - 4, align: 'left' });
        currentX += colWidths.satuan;

        // 7. KURSI
        doc.text('KURSI', currentX, startY + 7, { width: colWidths.kursi, align: 'center' });
        currentX += colWidths.kursi;

        // 8. STATUS
        doc.text('STATUS', currentX, startY + 7, { width: colWidths.status, align: 'center' });

        return startY + 22;
      };

      // 1. HEADER HALAMAN PERTAMA
      doc.rect(marginX, 32, contentWidth, 54)
         .fillColor('#1E3A8A')
         .fill();

      doc.fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .fontSize(9.5)
         .text('MARKAS BESAR TENTARA NASIONAL INDONESIA', marginX, 42, {
           align: 'center',
           width: contentWidth
         });

      doc.font('Helvetica-Bold')
         .fontSize(13)
         .text(meta?.title || 'DAFTAR INDUK PESERTA & AKREDITASI RAPIM TNI 2026', marginX, 55, {
           align: 'center',
           width: contentWidth
         });

      const nowWIB = new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'short'
      }) + ' WIB';

      const totalCheckIn = guests.filter(g => g.status_kehadiran === 'CHECK_IN' || (g.status_kehadiran as any) === 'HADIR').length;

      doc.font('Helvetica')
         .fontSize(8)
         .fillColor('#93C5FD')
         .text(
           `Tanggal Cetak: ${nowWIB}  •  Total Peserta: ${guests.length} Orang  •  Check-In: ${totalCheckIn} Orang`,
           marginX,
           72,
           { align: 'center', width: contentWidth }
         );

      // 2. TABEL DATA
      let y = 98;
      y = drawTableHeader(y);

      const rowHeight = 21;
      const maxY = pageHeight - 48; // Batas bawah sebelum footer

      guests.forEach((g, idx) => {
        // Cek Page Break
        if (y + rowHeight > maxY) {
          doc.addPage();
          y = 32;
          y = drawTableHeader(y);
        }

        const isEven = idx % 2 === 1;
        if (isEven) {
          doc.rect(marginX, y, contentWidth, rowHeight)
             .fillColor('#F8FAFC')
             .fill();
        }

        // Garis batas baris
        doc.rect(marginX, y, contentWidth, rowHeight)
           .strokeColor('#E2E8F0')
           .lineWidth(0.5)
           .stroke();

        let currentX = marginX;
        const isCheckIn = g.status_kehadiran === 'CHECK_IN' || (g.status_kehadiran as any) === 'HADIR';

        // 1. NO
        doc.fillColor('#64748B')
           .font('Helvetica')
           .fontSize(7.5)
           .text(String(idx + 1), currentX, y + 6, { width: colWidths.no, align: 'center' });
        currentX += colWidths.no;

        // 2. NAMA PESERTA
        doc.fillColor('#0F172A')
           .font('Helvetica-Bold')
           .fontSize(7.5)
           .text(g.nama || '-', currentX + 4, y + 6, { width: colWidths.nama - 8, lineBreak: false });
        currentX += colWidths.nama;

        // 3. MATRA
        doc.fillColor('#334155')
           .font('Helvetica-Bold')
           .fontSize(7.5)
           .text(g.matra || '-', currentX, y + 6, { width: colWidths.matra, align: 'center' });
        currentX += colWidths.matra;

        // 4. PANGKAT & NRP
        const nrpText = g.nrp && g.nrp !== '-' ? ` (${g.nrp})` : '';
        doc.fillColor('#334155')
           .font('Helvetica')
           .fontSize(7)
           .text(`${g.pangkat || '-'}${nrpText}`, currentX + 4, y + 6, { width: colWidths.pangkatNrp - 8, lineBreak: false });
        currentX += colWidths.pangkatNrp;

        // 5. JABATAN & SATKER
        const satkerText = g.satker ? ` • ${g.satker}` : '';
        doc.fillColor('#334155')
           .font('Helvetica')
           .fontSize(7)
           .text(`${g.jabatan || '-'}${satkerText}`, currentX + 4, y + 6, { width: colWidths.jabatanSatker - 8, lineBreak: false });
        currentX += colWidths.jabatanSatker;

        // 6. SATUAN / INSTANSI
        doc.fillColor('#334155')
           .font('Helvetica')
           .fontSize(7)
           .text(g.satuan || g.negara_instansi || '-', currentX + 4, y + 6, { width: colWidths.satuan - 8, lineBreak: false });
        currentX += colWidths.satuan;

        // 7. KURSI
        const seatText = g.seat_assignment || g.seat_number || '-';
        doc.fillColor(seatText !== '-' ? '#1E40AF' : '#94A3B8')
           .font('Helvetica-Bold')
           .fontSize(7.5)
           .text(seatText, currentX, y + 6, { width: colWidths.kursi, align: 'center' });
        currentX += colWidths.kursi;

        // 8. STATUS BADGE
        const badgeWidth = 66;
        const badgeHeight = 14;
        const badgeX = currentX + (colWidths.status - badgeWidth) / 2;
        const badgeY = y + 3.5;

        doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3)
           .fillColor(isCheckIn ? '#10B981' : '#F59E0B')
           .fill();

        doc.fillColor('#FFFFFF')
           .font('Helvetica-Bold')
           .fontSize(6.5)
           .text(isCheckIn ? 'CHECK-IN' : 'REGISTRASI', badgeX, badgeY + 3.5, {
             width: badgeWidth,
             align: 'center'
           });

        y += rowHeight;
      });

      // 3. PENOMORAN HALAMAN & FOOTER RESMI (Halaman X dari Y)
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        // Garis batas footer
        doc.rect(marginX, pageHeight - 26, contentWidth, 0.5)
           .strokeColor('#CBD5E1')
           .lineWidth(0.5)
           .stroke();

        // Footer Kiri
        doc.font('Helvetica-Oblique')
           .fontSize(7.5)
           .fillColor('#64748B')
           .text(
             'Dokumen Resmi Sekretariat Panitia RAPIM TNI 2026 — Klasifikasi Terbatas',
             marginX,
             pageHeight - 20,
             { align: 'left', width: contentWidth / 2 }
           );

        // Footer Kanan: Halaman X dari Y
        doc.font('Helvetica')
           .fontSize(7.5)
           .fillColor('#475569')
           .text(
             `Halaman ${i + 1} dari ${range.count}`,
             marginX + contentWidth / 2,
             pageHeight - 20,
             { align: 'right', width: contentWidth / 2 }
           );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

