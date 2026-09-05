import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mysqlAdapter } from '@/lib/db/mysql';
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    let guests: any[] = [];
    if (mysqlAdapter.isConfigured()) {
      const pesertaList = await mysqlAdapter.getAllPeserta();
      if (pesertaList && pesertaList.length > 0) {
        guests = pesertaList.map(p => ({
          nama: p.nama_lengkap,
          pangkat: p.pangkat,
          nrp: p.nrp,
          jabatan: p.jabatan,
          instansi: p.instansi,
          matra: p.matra,
          seat_number: p.seat_number,
          status_kehadiran: p.status_hadir,
          no_hp: p.no_hp
        }));
      }
    }

    if (guests.length === 0) {
      guests = db.getGuests();
      guests = await db.getGuestsAsync();
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 36, bottom: 36, left: 36, right: 36 },
      info: {
        Title: 'Daftar Hadir & Akreditasi RAPIM TNI 2026',
        Author: 'Sekretariat Panitia RAPIM TNI 2026'
      }
    });

    const chunks: Buffer[] = [];
    (doc as any).on('data', (chunk: Buffer) => chunks.push(chunk));

    const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
      (doc as any).on('end', () => resolve(Buffer.concat(chunks)));
      (doc as any).on('error', reject);
    });

    const pageWidth = 595.28;
    const marginX = 36;
    const contentWidth = pageWidth - (marginX * 2);

    // Header
    doc.rect(marginX, 36, contentWidth, 54)
       .fillColor('#1E3A8A')
       .fill();

    doc.fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .fontSize(10)
       .text('MARKAS BESAR TENTARA NASIONAL INDONESIA', marginX, 46, { align: 'center', width: contentWidth });

    doc.font('Helvetica-Bold')
       .fontSize(13)
       .text('DAFTAR INDUK PESERTA & AKREDITASI RAPIM TNI 2026', marginX, 60, { align: 'center', width: contentWidth });

    doc.font('Helvetica')
       .fontSize(8)
       .fillColor('#94A3B8')
       .text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • Total: ${guests.length} Peserta Terdaftar`, marginX, 76, { align: 'center', width: contentWidth });

    // Table Header
    let y = 104;
    doc.rect(marginX, y, contentWidth, 20)
       .fillColor('#F1F5F9')
       .strokeColor('#CBD5E1')
       .lineWidth(1)
       .fillAndStroke();

    doc.fillColor('#0F172A')
       .font('Helvetica-Bold')
       .fontSize(7.5);

    doc.text('NO', marginX + 4, y + 6, { width: 22, align: 'center' });
    doc.text('NAMA PRAJURIT / TAMU', marginX + 28, y + 6, { width: 145 });
    doc.text('PANGKAT & NRP', marginX + 175, y + 6, { width: 90 });
    doc.text('JABATAN & SATKER', marginX + 268, y + 6, { width: 135 });
    doc.text('KURSI', marginX + 406, y + 6, { width: 45, align: 'center' });
    doc.text('STATUS', marginX + 454, y + 6, { width: 60, align: 'center' });

    y += 20;

    guests.forEach((g, idx) => {
      // Check page break
      if (y > 780) {
        doc.addPage();
        y = 36;

        // Redraw table header on new page
        doc.rect(marginX, y, contentWidth, 20)
           .fillColor('#F1F5F9')
           .strokeColor('#CBD5E1')
           .lineWidth(1)
           .fillAndStroke();

        doc.fillColor('#0F172A')
           .font('Helvetica-Bold')
           .fontSize(7.5);

        doc.text('NO', marginX + 4, y + 6, { width: 22, align: 'center' });
        doc.text('NAMA PRAJURIT / TAMU', marginX + 28, y + 6, { width: 145 });
        doc.text('PANGKAT & NRP', marginX + 175, y + 6, { width: 90 });
        doc.text('JABATAN & SATKER', marginX + 268, y + 6, { width: 135 });
        doc.text('KURSI', marginX + 406, y + 6, { width: 45, align: 'center' });
        doc.text('STATUS', marginX + 454, y + 6, { width: 60, align: 'center' });

        y += 20;
      }

      // Alternate row background
      if (idx % 2 === 1) {
        doc.rect(marginX, y, contentWidth, 20)
           .fillColor('#F8FAFC')
           .fill();
      }

      doc.rect(marginX, y, contentWidth, 20)
         .strokeColor('#E2E8F0')
         .lineWidth(0.5)
         .stroke();

      const fullName = [g.gelar_depan, g.nama, g.gelar_belakang].filter(Boolean).join(' ') || g.nama;
      const isHadir = g.status_kehadiran === 'HADIR';

      doc.fillColor('#334155')
         .font('Helvetica')
         .fontSize(7);

      doc.text(String(idx + 1), marginX + 4, y + 6, { width: 22, align: 'center' });

      doc.font('Helvetica-Bold')
         .fillColor('#0F172A')
         .text(fullName, marginX + 28, y + 6, { width: 145, lineBreak: false });

      doc.font('Helvetica')
         .fillColor('#334155')
         .text(`${g.pangkat} (${g.nrp || '-'})`, marginX + 175, y + 6, { width: 90, lineBreak: false });

      doc.text(`${g.jabatan || '-'} • ${g.satuan || g.instansi || '-'}`, marginX + 268, y + 6, { width: 135, lineBreak: false });

      doc.font('Helvetica-Bold')
         .fillColor('#1E40AF')
         .text(g.seat_number || '-', marginX + 406, y + 6, { width: 45, align: 'center' });

      doc.font('Helvetica-Bold')
         .fillColor(isHadir ? '#16A34A' : '#64748B')
         .text(isHadir ? 'HADIR' : 'BELUM', marginX + 454, y + 6, { width: 60, align: 'center' });

      y += 20;
    });

    doc.end();

    const finalBuffer = await pdfBufferPromise;

    return new Response(new Uint8Array(finalBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rekap_Peserta_RAPIM_TNI_${new Date().toISOString().slice(0, 10)}.pdf"`
      }
    });

  } catch (err: any) {
    console.error('[Export PDF] Gagal membuat rekap PDF:', err);
    return NextResponse.json({ error: 'Gagal mengekspor PDF: ' + err?.message }, { status: 500 });
  }
}

