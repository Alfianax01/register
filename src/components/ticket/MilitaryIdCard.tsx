import React from 'react';
import { Badge } from '@/components/ui/Badge';
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
      className="w-full max-w-md mx-auto rounded-lg bg-white border border-slate-200/90 shadow-md overflow-hidden select-none"
    >
      {/* Top Header Strip */}
      <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#1E40AF] flex items-center justify-center text-white shadow-xs">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#64748B] tracking-wider uppercase">
                TNI Event Pass
              </span>
              <Badge variant="primary" size="sm">
                RAPIM 2026
              </Badge>
            </div>
            <h2 className="text-[15px] font-semibold text-[#0F172A] mt-0.5">
              Kartu Peserta Resmi
            </h2>
          </div>
        </div>

        <span className="font-mono text-[12px] font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-sm border border-slate-200">
          NRP {guest.nrp}
        </span>
      </div>

      {/* Guest Name & Details */}
      <div className="p-6 border-b border-slate-100 space-y-3.5 bg-white">
        <div>
          <span className="text-[12px] font-medium text-[#64748B] uppercase tracking-wide block">
            Nama Tamu / Prajurit
          </span>
          <h3 className="text-[18px] font-semibold text-[#0F172A] mt-0.5 leading-snug">
            {guest.gelar_depan ? `${guest.gelar_depan} ` : ''}
            {guest.nama}
            {guest.gelar_belakang ? `, ${guest.gelar_belakang}` : ''}
          </h3>
          <p className="text-[14px] font-medium text-[#1E40AF] mt-0.5">
            {guest.pangkat} &bull; {guest.matra === 'NON_TNI' ? 'Undangan Sipil / Non-TNI' : `Matra ${guest.matra}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[13px] pt-1.5 border-t border-slate-100">
          <div>
            <span className="text-[#64748B] block text-[11px] uppercase font-medium">Jabatan Dinas</span>
            <span className="text-[#0F172A] font-medium block truncate">{guest.jabatan}</span>
          </div>
          <div>
            <span className="text-[#64748B] block text-[11px] uppercase font-medium">Satuan / Satker</span>
            <span className="text-[#0F172A] font-medium block truncate">{guest.satuan}</span>
          </div>
        </div>
      </div>

      {/* QR Code Center Section */}
      <div className="p-6 bg-slate-50/60 flex flex-col items-center justify-center text-center space-y-3 border-b border-slate-100">
        <div className="p-3.5 bg-white rounded-md border border-slate-200 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeUrl}
            alt={`QR Code ${guest.nama}`}
            className="w-44 h-44 object-contain"
          />
        </div>
        <div className="space-y-1">
          <span className="font-mono text-[12px] font-medium text-slate-700 bg-white px-3 py-1 rounded-sm border border-slate-200 block">
            ID: {guest.qr_token?.substring(0, 18)}...
          </span>
          <p className="text-[12px] text-[#64748B]">
            Tunjukkan kode QR ini kepada petugas di Gate Gedung Ahmad Yani.
          </p>
        </div>
      </div>

      {/* Seating & Wisma Badges */}
      <div className="p-5 grid grid-cols-2 gap-3 bg-white">
        <div className="p-3 rounded-md border border-slate-200 bg-slate-50/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] uppercase">
            <Armchair className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span>Nomor Kursi</span>
          </div>
          <p className="text-[15px] font-bold text-[#0F172A]">
            {guest.seat_number ? (
              <span className="text-[#1E40AF] font-mono">
                {guest.seat_number}
              </span>
            ) : (
              <span className="text-slate-400 font-normal italic text-[13px]">Ditetapkan di Lokasi</span>
            )}
          </p>
        </div>

        <div className="p-3 rounded-md border border-slate-200 bg-slate-50/50 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] uppercase">
            <Bed className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Akomodasi Wisma</span>
          </div>
          <p className="text-[13px] font-medium text-[#0F172A]">
            {guest.room_details ? (
              <span className="text-emerald-700 truncate block">
                Kamar {guest.room_details.room_number} ({guest.room_details.slot})
              </span>
            ) : guest.butuh_akomodasi ? (
              <span className="text-amber-700">Menunggu Verifikasi</span>
            ) : (
              <span className="text-slate-400 font-normal">Tidak Menginap</span>
            )}
          </p>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[13px]">
        <span className="text-[12px] text-[#64748B] font-medium">Status Kehadiran:</span>
        {guest.status_kehadiran === 'HADIR' ? (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-sm border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Telah Hadir di Lokasi</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-sm border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Terdaftar (Belum Check-In)</span>
          </span>
        )}
      </div>
    </div>
  );
};
