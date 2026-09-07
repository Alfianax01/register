import ExcelJS from 'exceljs';
import { Guest } from '@/types';

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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\./g, ':');
  } catch {
    return '-';
  }
}

export interface ExcelMetaOptions {
  title?: string;
  subtitle?: string;
}

/**
 * Menghasilkan Buffer file Microsoft Excel (.xlsx) resmi untuk delegasi RAPIM TNI 2026.
 */
export async function generateGuestsExcelBuffer(
  guests: Guest[],
  meta?: ExcelMetaOptions
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sekretariat Panitia RAPIM TNI 2026';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Daftar Peserta', {
    views: [{ showGridLines: true }]
  });

  // 1. Column Widths
  worksheet.columns = [
    { key: 'no', width: 6 },
    { key: 'nama', width: 30 },
    { key: 'matra', width: 12 },
    { key: 'pangkat', width: 18 },
    { key: 'jabatan', width: 25 },
    { key: 'satker', width: 20 },
    { key: 'satuan', width: 20 },
    { key: 'kursi', width: 15 },
    { key: 'status', width: 15 },
    { key: 'tgl_reg', width: 22 },
    { key: 'tgl_checkin', width: 22 }
  ];

  // 2. Row 1: Judul Utama
  worksheet.mergeCells('A1:K1');
  const titleRow = worksheet.getRow(1);
  titleRow.height = 30;
  const titleCell = worksheet.getCell('A1');
  titleCell.value = meta?.title || 'DAFTAR PESERTA RAPIM TNI 2026';
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // 3. Row 2: Sub-judul Institusi
  worksheet.mergeCells('A2:K2');
  const subRow = worksheet.getRow(2);
  subRow.height = 20;
  const subCell = worksheet.getCell('A2');
  subCell.value = meta?.subtitle || 'TENTARA NASIONAL INDONESIA';
  subCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF334155' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // 4. Row 3: Kosong
  worksheet.getRow(3).height = 10;

  // 5. Row 4-7: Metadata
  const nowWIB = new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'full',
    timeStyle: 'short'
  }) + ' WIB';

  const totalPeserta = guests.length;
  const totalRegistrasi = guests.filter(g => g.status_kehadiran === 'REGISTRASI' || (g.status_kehadiran as any) === 'BELUM_HADIR').length;
  const totalCheckIn = guests.filter(g => g.status_kehadiran === 'CHECK_IN' || (g.status_kehadiran as any) === 'HADIR').length;

  const metaRows = [
    { label: 'Tanggal Export', value: nowWIB },
    { label: 'Total Peserta', value: `${totalPeserta} Orang` },
    { label: 'Total Registrasi', value: `${totalRegistrasi} Orang` },
    { label: 'Total Check-In', value: `${totalCheckIn} Orang` }
  ];

  metaRows.forEach((m, idx) => {
    const rowNum = 4 + idx;
    const r = worksheet.getRow(rowNum);
    r.height = 18;

    worksheet.getCell(`A${rowNum}`).value = m.label;
    worksheet.getCell(`A${rowNum}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF475569' } };

    worksheet.getCell(`B${rowNum}`).value = `: ${m.value}`;
    worksheet.getCell(`B${rowNum}`).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
  });

  // 6. Row 8: Kosong
  worksheet.getRow(8).height = 12;

  // 7. Row 9: Table Header
  const headerRow = worksheet.getRow(9);
  headerRow.height = 25;
  const headers = [
    'No',
    'Nama Peserta',
    'Matra',
    'Pangkat',
    'Jabatan',
    'Satker',
    'Satuan',
    'Kursi',
    'Status',
    'Tanggal Registrasi',
    'Tanggal Check-In'
  ];

  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // Biru Institusi TNI #1E3A8A
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF94A3B8' } },
      bottom: { style: 'thin', color: { argb: 'FF94A3B8' } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } }
    };
  });

  // Freeze Header & Filter
  worksheet.autoFilter = 'A9:K9';
  worksheet.views = [{ state: 'frozen', ySplit: 9, showGridLines: true }];

  // 8. Data Rows
  let currentRowNum = 10;

  guests.forEach((g, idx) => {
    const row = worksheet.getRow(currentRowNum);
    row.height = 22;

    const isCheckIn = g.status_kehadiran === 'CHECK_IN' || (g.status_kehadiran as any) === 'HADIR';
    const statusText = isCheckIn ? 'CHECK IN' : 'REGISTRASI';
    const isEven = idx % 2 === 1;
    const defaultBgArgb = isEven ? 'FFF8FAFC' : 'FFFFFFFF'; // Zebra striping

    const rowData = [
      idx + 1,
      g.nama || '-',
      g.matra || '-',
      g.pangkat || '-',
      g.jabatan || '-',
      g.satker || '-',
      g.satuan || '-',
      g.seat_assignment || g.seat_number || '-',
      statusText,
      formatWIB(g.created_at),
      formatWIB(g.waktu_kehadiran_pertama)
    ];

    rowData.forEach((val, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = val;
      cell.font = { name: 'Arial', size: 10, color: { argb: 'FF1E293B' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Background
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: defaultBgArgb }
      };

      // Alignment
      if (colIdx === 0 || colIdx === 2 || colIdx === 7 || colIdx === 8 || colIdx === 9 || colIdx === 10) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      // Khusus Cell Status (Kolom 9)
      if (colIdx === 8) {
        const statusBgColor = isCheckIn ? 'FF10B981' : 'FFF59E0B'; // Emerald vs Amber
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: statusBgColor }
        };
        cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      }
    });

    currentRowNum++;
  });

  // 9. Footer (Merge baris terakhir + 2)
  const footerRowNum = currentRowNum + 1;
  worksheet.mergeCells(`A${footerRowNum}:K${footerRowNum}`);
  const footerRow = worksheet.getRow(footerRowNum);
  footerRow.height = 22;
  const footerCell = worksheet.getCell(`A${footerRowNum}`);
  footerCell.value = 'Dokumen dibuat otomatis oleh Sistem RAPIM TNI 2026';
  footerCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF64748B' } };
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // 10. Generate Buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

