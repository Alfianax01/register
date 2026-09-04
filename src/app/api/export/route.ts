import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guests = db.getGuests();
    const headers = [
      'No',
      'NRP/Identitas',
      'Nama Lengkap',
      'Gelar Depan',
      'Gelar Belakang',
      'Matra',
      'Pangkat',
      'Jabatan',
      'Satker',
      'Satuan',
      'Nomor HP',
      'Email',
      'Kebutuhan Akomodasi',
      'Alokasi Kursi',
      'Alokasi Kamar',
      'Status Hadir',
      'Waktu Hadir Pertama'
    ];

    const rows = guests.map((g, idx) => [
      idx + 1,
      `"${g.nrp}"`,
      `"${g.nama}"`,
      `"${g.gelar_depan || ''}"`,
      `"${g.gelar_belakang || ''}"`,
      `"${g.matra}"`,
      `"${g.pangkat}"`,
      `"${g.jabatan}"`,
      `"${g.satker}"`,
      `"${g.satuan}"`,
      `"${g.no_hp}"`,
      `"${g.email}"`,
      g.butuh_akomodasi ? 'Ya' : 'Tidak',
      `"${g.seat_number || '-'}"`,
      `"${g.room_id ? `${g.room_id} (${g.room_slot || 'A'})` : '-'}"`,
      g.status_kehadiran,
      `"${g.waktu_kehadiran_pertama || '-'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="Daftar_Peserta_Rapim_TNI_${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal mengekspor data' }, { status: 500 });
  }
}

