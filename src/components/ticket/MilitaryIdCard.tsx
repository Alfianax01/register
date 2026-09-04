import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { formatDateID, formatTimeID } from '@/lib/utils/formatters';
import { Shield, Armchair, Bed, CheckCircle2, Clock } from 'lucide-react';

interface MilitaryIdCardProps {
  guest: any;
  qrCodeUrl: string;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export const MilitaryIdCard: React.FC<MilitaryIdCardProps> = ({ guest, qrCodeUrl, cardRef }) => {
  return (
    <div
      ref={cardRef}
      className="w-full max-w-md mx-auto rounded-2xl bg-white border border-slate-200 shadow-card overflow-hidden select-none"
    >
      {/* Top Header Strip */}
      <div className="p-6 border-b border-slate-100 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                TNI EVENT PASS
              </span>
              <Badge variant="primary" size="sm">
                RAPIM 2026
              </Badge>
            </div>
            <h2 className="text-sm font-semibold text-slate-900 mt-0.5">
              Kartu Tanda Peserta Resmi
            </h2>
          </div>
        </div>

        <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200/80">
          NRP {guest.nrp}
        </span>
      </div>

      {/* Guest Name & Details */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
            Nama Prajurit / Tamu Undangan
          </span>
          <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
            {guest.gelar_depan ? `${guest.gelar_depan} ` : ''}
            {guest.nama}
            {guest.gelar_belakang ? `, ${guest.gelar_belakang}` : ''}
          </h3>
          <p className="text-xs font-medium text-blue-600 mt-0.5">
            {guest.pangkat} &bull; {guest.matra === 'NON_TNI' ? 'Tamu Non-TNI' : `Matra ${guest.matra}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
          <div>
            <span className="text-slate-400 block text-[10px] font-medium uppercase">Jabatan Dinas</span>
            <span className="text-slate-800 font-medium block truncate">{guest.jabatan}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-medium uppercase">Satker & Kesatuan</span>
            <span className="text-slate-800 font-medium block truncate">{guest.satuan}</span>
          </div>
        </div>
      </div>

      {/* QR Code Center Section */}
      <div className="p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3 border-b border-slate-100">
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt={`QR Code ${guest.nama}`}
            className="w-44 h-44 object-contain"
          />
        </div>
        <div className="space-y-0.5">
          <span className="font-mono text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
            TOKEN: {guest.qr_token?.substring(0, 8).toUpperCase()}
          </span>
          <p className="text-[10px] text-slate-400 pt-1">
            Tunjukkan kode QR ini pada petugas check-in di gate venue.
          </p>
        </div>
      </div>

      {/* Seating & Wisma Badges */}
      <div className="p-5 grid grid-cols-2 gap-3 bg-white">
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase">
            <Armchair className="w-3.5 h-3.5 text-blue-600" />
            <span>Kursi Acara</span>
          </div>
          <p className="text-xs font-semibold text-slate-900">
            {guest.seat?.seat_number ? (
              <span className="text-blue-700 font-mono font-bold">
                {guest.seat.seat_number}
              </span>
            ) : (
              <span className="text-slate-400 font-normal italic">Proses Alokasi</span>
            )}
          </p>
        </div>

        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase">
            <Bed className="w-3.5 h-3.5 text-emerald-600" />
            <span>Akomodasi Wisma</span>
          </div>
          <p className="text-xs font-semibold text-slate-900">
            {guest.room ? (
              <span className="text-emerald-700 font-medium truncate block">
                Kamar {guest.room.room_number} ({guest.room.slot})
              </span>
            ) : guest.butuh_akomodasi ? (
              <span className="text-amber-600 font-normal">Menunggu Kamar</span>
            ) : (
              <span className="text-slate-400 font-normal">Tidak Menginap</span>
            )}
          </p>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 font-medium">Status Kehadiran</span>
        {guest.status_kehadiran === 'HADIR' ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Telah Hadir di Lokasi</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Terdaftar (Belum Check-In)</span>
          </span>
        )}
      </div>
    </div>
  );
};
