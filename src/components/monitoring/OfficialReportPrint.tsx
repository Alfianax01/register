import React from 'react';
import { Guest } from '@/types';
import { formatDateTimeID } from '@/lib/utils/formatters';

interface OfficialReportPrintProps {
  guests: Guest[];
}

export const OfficialReportPrint: React.FC<OfficialReportPrintProps> = ({ guests }) => {
  return (
    <div className="hidden print:block bg-white text-black p-8 text-xs font-serif leading-normal">
      {/* Official Military Letterhead (Kop Surat) */}
      <div className="border-b-2 border-black pb-4 mb-6 text-center space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-widest">
          MARKAS BESAR TENTARA NASIONAL INDONESIA
        </h4>
        <h3 className="text-sm font-bold uppercase tracking-wider">
          PANITIA PENYELENGGARA RAPAT PIMPINAN (RAPIM) TNI
        </h3>
        <p className="text-[10px] font-sans">
          Jalan Raya Hankam, Cilangkap, Cipayung, Jakarta Timur 13870 &bull; Telp: (021) 84595000
        </p>
      </div>

      {/* Document Title */}
      <div className="text-center mb-6">
        <h2 className="text-base font-bold underline uppercase">
          LAPORAN DAFTAR HADIR PESERTA SIDANG PARIPURNA
        </h2>
        <p className="text-xs mt-1">
          RAPIM TNI TAHUN 2026 &mdash; GEDUNG AHMAD YANI CILANGKAP
        </p>
        <p className="text-[10px] font-sans text-gray-600 mt-0.5">
          Dicetak secara otomatis dari Sistem Presensi Digital pada {formatDateTimeID(new Date().toISOString())}
        </p>
      </div>

      {/* Attendance Table */}
      <table className="w-full border-collapse border border-black text-[11px] mb-8">
        <thead>
          <tr className="bg-gray-100 text-center font-bold">
            <th className="border border-black p-2 w-8">No.</th>
            <th className="border border-black p-2 w-28">NRP / Identitas</th>
            <th className="border border-black p-2">Nama Lengkap & Gelar</th>
            <th className="border border-black p-2 w-32">Pangkat / Matra</th>
            <th className="border border-black p-2">Jabatan & Kesatuan</th>
            <th className="border border-black p-2 w-20">Kursi</th>
            <th className="border border-black p-2 w-24">Status Presensi</th>
            <th className="border border-black p-2 w-24">Tanda Tangan</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g, idx) => (
            <tr key={g.id} className="align-middle">
              <td className="border border-black p-1.5 text-center font-mono">{idx + 1}</td>
              <td className="border border-black p-1.5 font-mono">{g.nrp}</td>
              <td className="border border-black p-1.5 font-bold">
                {g.gelar_depan ? `${g.gelar_depan} ` : ''}
                {g.nama}
                {g.gelar_belakang ? `, ${g.gelar_belakang}` : ''}
              </td>
              <td className="border border-black p-1.5">
                {g.pangkat} ({g.matra})
              </td>
              <td className="border border-black p-1.5">
                {g.jabatan} - {g.satuan}
              </td>
              <td className="border border-black p-1.5 text-center font-mono font-bold">
                {g.seat_number || '-'}
              </td>
              <td className="border border-black p-1.5 text-center font-bold">
                {g.status_kehadiran === 'HADIR' ? 'HADIR' : 'BELUM'}
              </td>
              <td className="border border-black p-1.5 text-center font-mono text-[9px]">
                {g.status_kehadiran === 'HADIR' ? 'TERVERIFIKASI' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Official Sign-off Columns */}
      <div className="flex justify-between items-start pt-6 text-xs break-inside-avoid">
        <div className="text-center w-64">
          <p>Mengetahui,</p>
          <p className="font-bold">SEKRETARIS PANITIA RAPIM TNI</p>
          <div className="h-20" />
          <p className="font-bold underline">BAMBANG TRISNOHADI</p>
          <p>LETNAN JENDERAL TNI</p>
        </div>

        <div className="text-center w-64">
          <p>Jakarta, 4 September 2026</p>
          <p className="font-bold">KOORDINATOR REGISTRASI & PRESENSI</p>
          <div className="h-20" />
          <p className="font-bold underline">RADITYO PRAKOSO, S.T.</p>
          <p>LETKOL CHB NRP 1102941</p>
        </div>
      </div>
    </div>
  );
};

