import React from 'react';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { Badge } from '@/components/ui/Badge';
import { getMatraBadgeInfo, formatDateID } from '@/lib/utils/formatters';
import { Shield, Armchair, Bed, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface MilitaryIdCardProps {
  guest: any;
  qrCodeUrl: string;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export const MilitaryIdCard: React.FC<MilitaryIdCardProps> = ({ guest, qrCodeUrl, cardRef }) => {
  const matraInfo = getMatraBadgeInfo(guest.matra || 'AD');

  return (
    <div
      ref={cardRef}
      className="relative w-full max-w-sm mx-auto rounded-3xl bg-gradient-to-b from-[#0F261C] via-[#091711] to-[#040A07] border-2 border-[#D4AF37] shadow-2xl shadow-black overflow-hidden select-none id-hologram"
    >
      {/* Top Lanyard Punch Hole Slot Effect */}
      <div className="w-full pt-4 pb-2 flex justify-center">
        <div className="w-16 h-3 rounded-full bg-[#040806] border border-[#D4AF37]/50 shadow-inner flex items-center justify-center">
          <div className="w-12 h-1 rounded-full bg-black/80" />
        </div>
      </div>

      {/* Red & White Ribbon Header */}
      <div className="w-full h-2 flex">
        <div className="h-full w-1/2 bg-[#B91C1C]" />
        <div className="h-full w-1/2 bg-[#FFFFFF]" />
      </div>

      {/* Header Emblem & Event Name */}
      <div className="p-5 text-center border-b border-[#1E3B2F] bg-[#07130D]">
        <div className="flex justify-center mb-2">
          <TniEmblem matra={guest.matra} size="md" />
        </div>
        <span className="text-[9px] tracking-widest text-[#D4AF37] font-bold uppercase block">
          TENTARA NASIONAL INDONESIA
        </span>
        <h2 className="text-base font-serif font-black tracking-wide text-slate-100">
          RAPAT PIMPINAN TNI 2026
        </h2>
        <span className="text-[10px] font-mono text-slate-400">
          TANDA PESERTA / E-TICKET RESMI
        </span>
      </div>

      {/* Body: Guest Name & Rank */}
      <div className="p-5 text-center">
        <div className="inline-block mb-2">
          <Badge variant={guest.matra === 'AD' ? 'ad' : guest.matra === 'AL' ? 'al' : guest.matra === 'AU' ? 'au' : 'gold'} size="sm">
            {matraInfo.label} &bull; {matraInfo.motto}
          </Badge>
        </div>

        <h3 className="text-lg font-serif font-bold text-slate-100 leading-snug">
          {guest.gelar_depan ? `${guest.gelar_depan} ` : ''}
          {guest.nama}
          {guest.gelar_belakang ? `, ${guest.gelar_belakang}` : ''}
        </h3>

        <div className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-[#F5E296]">
          <span>{guest.pangkat}</span>
          <span>&bull;</span>
          <span className="font-mono">NRP {guest.nrp}</span>
        </div>

        <p className="text-[11px] text-slate-300 mt-1 max-w-[260px] mx-auto truncate font-sans">
          {guest.jabatan}
        </p>
        <p className="text-[10px] text-slate-400 truncate max-w-[260px] mx-auto">
          {guest.satker} - {guest.satuan}
        </p>

        {/* QR Code Container */}
        <div className="mt-5 flex justify-center">
          <div className="p-3 rounded-2xl bg-white border-2 border-[#D4AF37] shadow-xl relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCodeUrl}
              alt={`QR Code Tanda Peserta ${guest.nama}`}
              className="w-44 h-44 object-contain rounded-lg"
            />
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#0B1812] border border-[#D4AF37] text-[9px] font-mono text-[#F5E296] tracking-wider whitespace-nowrap shadow-md">
              PASS: {guest.qr_token.substring(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        <p className="text-[9px] text-slate-400 mt-4">
          Tunjukkan QR Code ini kepada panitia di Gate Pintu Masuk
        </p>
      </div>

      {/* Placement Details (Kursi & Wisma) */}
      <div className="px-5 pb-5 space-y-2.5">
        {/* Seating Placement Box */}
        <div className="p-2.5 rounded-xl bg-[#091811] border border-[#1E3B2F] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950/60 text-[#D4AF37] border border-amber-600/40">
              <Armchair className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Alokasi Kursi Acara</span>
              <span className="text-xs font-bold text-slate-100 font-serif">
                {guest.seat?.seat_number ? (
                  <span className="text-[#F5E296] font-bold text-sm">
                    {guest.seat.seat_number} ({guest.seat.group_name})
                  </span>
                ) : (
                  <span className="text-slate-500 font-normal italic">Menunggu Alokasi Panitia</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Wisma Lodging Box */}
        <div className="p-2.5 rounded-xl bg-[#091811] border border-[#1E3B2F] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950/60 text-blue-300 border border-blue-600/40">
              <Bed className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Akomodasi Wisma</span>
              <span className="text-xs font-semibold text-slate-100">
                {guest.room ? (
                  <span className="text-cyan-300">
                    {guest.room.wisma_name} - Kamar {guest.room.room_number} (Bed {guest.room.slot})
                  </span>
                ) : guest.butuh_akomodasi ? (
                  <span className="text-amber-400">Dalam Proses Penempatan</span>
                ) : (
                  <span className="text-slate-500 font-normal">Tidak Menginap</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Attendance Status Badge */}
        <div className="pt-2 flex items-center justify-between text-xs border-t border-[#163124]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Status Kehadiran:</span>
          {guest.status_kehadiran === 'HADIR' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hadir di Lokasi</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/50">
              <Clock className="w-3.5 h-3.5" />
              <span>Terdaftar (Belum Check-In)</span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom Bar Official Seal */}
      <div className="py-2.5 px-4 bg-[#030705] border-t border-[#132B20] text-center">
        <span className="text-[9px] text-slate-500 tracking-wider">
          MABES TNI CILANGKAP &bull; VERIFIKASI KEAMANAN DIGITAL
        </span>
      </div>
    </div>
  );
};

