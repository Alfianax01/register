'use client';

import React from 'react';
import { Guest } from '@/types';
import { CheckCircle2, Clock, Calendar, MapPin, Building, ShieldCheck } from 'lucide-react';

export interface TicketCardProps {
  guest: Guest;
  qrCodeUrl: string;
  status: 'REGISTRASI' | 'CHECK_IN';
  seat: string;
  gedung?: string;
  wisma: string;
  room: string;
  checkinDetails?: {
    gate?: string;
    waktu?: string;
    petugas?: string;
  } | null;
}

/**
 * Komponen Tunggal (Reusable) TicketCard untuk E-Ticket RAPIM TNI 2026.
 * Sesuai hierarki diagram UI/UX:
 * 1. HEADER (RAPIM TNI 2026)
 * 2. STATUS BADGE [REGISTRASI / CHECK-IN]
 * 3. QR CODE (dengan overlay status via opacity transition)
 * 4. IDENTITAS PESERTA (Nama, NRP, Satuan, Jabatan, Pangkat)
 * 5. CHECK-IN INFO (waktu & lokasi scanner)
 * 6. PENEMPATAN PESERTA (Kursi | Gedung | Wisma & Kamar) — SELALU TAMPIL SEBELUM & SESUDAH CHECK-IN
 * 7. INFORMASI EVENT (Tanggal, Lokasi, Agenda)
 */
export const TicketCard: React.FC<TicketCardProps> = ({
  guest,
  qrCodeUrl,
  status,
  seat,
  gedung = 'Gedung Ahmad Yani',
  wisma,
  room,
  checkinDetails
}) => {
  const isCheckIn = status === 'CHECK_IN';

  return (
    <div
      className="bg-white border border-slate-200/80 p-6 space-y-4 select-none transition-all duration-300"
      style={{
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
      }}
    >
      {/* 1. HEADER */}
      <div className="text-center space-y-1 pb-3 border-b border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[20px] bg-blue-50 border border-blue-200/80 text-[#1E3A8A] text-[10px] font-bold tracking-widest uppercase">
          <span>TNI EVENT PASS &bull; RAPIM 2026</span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-[#1E3A8A] tracking-tight">
          RAPIM TNI 2026
        </h1>
        <p className="text-[11px] text-slate-500 font-medium">
          Rapat Pimpinan Tentara Nasional Indonesia
        </p>
      </div>

      {/* 2. STATUS BADGE */}
      <div className="flex justify-center pb-3 border-b border-slate-100">
        <div
          className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-[20px] font-bold text-xs tracking-wider uppercase transition-colors duration-300 ${
            isCheckIn
              ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
          }`}
        >
          {isCheckIn ? (
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <Clock className="w-4 h-4 stroke-[2.5]" />
          )}
          <span>{isCheckIn ? 'CHECK-IN BERHASIL' : 'TERDAFTAR (REGISTRASI)'}</span>
        </div>
      </div>

      {/* 3. QR CODE */}
      <div className="py-1 pb-3 border-b border-slate-100 flex flex-col items-center justify-center">
        <div className="relative w-[200px] h-[200px] p-2.5 bg-white rounded-xl border-2 border-slate-200/90 shadow-xs flex items-center justify-center overflow-hidden">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`QR Code ${guest.nama}`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isCheckIn ? 'opacity-25' : 'opacity-100'
              }`}
            />
          ) : (
            <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg" />
          )}

          {/* Overlay Status Sudah Digunakan */}
          <div
            className={`absolute inset-0 bg-slate-900/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center transition-opacity duration-300 ${
              isCheckIn ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1.5 shadow-sm">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[12px] font-black text-white tracking-wider uppercase drop-shadow-sm">
              SUDAH DIGUNAKAN
            </span>
            <span className="text-[10px] text-emerald-200 font-medium mt-0.5">
              Terverifikasi di Gate
            </span>
          </div>
        </div>
        <p className="text-[11px] font-mono text-slate-400 mt-2">
          {guest.qr_token ? `${guest.qr_token.substring(0, 18)}...` : 'ID: VALID-TICKET'}
        </p>
      </div>

      {/* 4. IDENTITAS PESERTA */}
      <div className="py-1 pb-3 border-b border-slate-100 space-y-2.5">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Nama Peserta
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {guest.nama}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-xs text-slate-600 font-medium">
            <span>{guest.pangkat}</span>
            {guest.nrp && (
              <>
                <span>&bull;</span>
                <span className="font-mono">NRP {guest.nrp}</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
              Matra Kedinasan
            </span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  guest.matra === 'AD'
                    ? 'bg-emerald-600'
                    : guest.matra === 'AL'
                    ? 'bg-blue-700'
                    : guest.matra === 'AU'
                    ? 'bg-sky-500'
                    : 'bg-amber-600'
                }`}
              />
              {guest.matra === 'AD'
                ? 'TNI AD'
                : guest.matra === 'AL'
                ? 'TNI AL'
                : guest.matra === 'AU'
                ? 'TNI AU'
                : guest.matra === 'MABES'
                ? 'Mabes TNI'
                : 'Sipil / Tamu'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">
              Jabatan / Kesatuan
            </span>
            <span
              className="font-semibold text-slate-800 truncate block"
              title={`${guest.jabatan} - ${guest.satker || guest.satuan}`}
            >
              {guest.jabatan || guest.satker || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. CHECK-IN INFO (Waktu & Scanner Gate jika sudah scan) */}
      <div className="py-1 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isCheckIn ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Verifikasi Gerbang (Check-In)
              </span>
              <span className={`text-xs font-semibold ${isCheckIn ? 'text-slate-900' : 'text-slate-500'}`}>
                {isCheckIn
                  ? `${checkinDetails?.gate || 'Gate 1 Pintu Utama'} • ${checkinDetails?.waktu || 'Telah Hadir'}`
                  : 'Belum Check-In • Tunjukkan QR saat tiba di lokasi'}
              </span>
            </div>
          </div>
          {isCheckIn && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
              VALID
            </span>
          )}
        </div>
      </div>

      {/* 6. PENEMPATAN PESERTA (Kursi, Gedung, Wisma, Kamar) — SELALU TAMPIL */}
      <div className="py-1 pb-3 border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Penempatan Peserta (Resmi Terdaftar)
          </span>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            Auto-Allocated
          </span>
        </div>

        {/* 3 Columns: Kursi | Gedung | Wisma */}
        <div className="grid grid-cols-3 gap-2">
          {/* Kolom 1: Kursi */}
          <div className="p-2.5 rounded-xl bg-blue-50/40 border border-blue-100 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Kursi
            </span>
            <span className="text-base sm:text-lg font-black text-[#1E3A8A] font-mono block">
              {seat || 'A-07'}
            </span>
            <span className="text-[10px] text-blue-700/80 font-medium block pt-0.5">
              Sidang Pleno
            </span>
          </div>

          {/* Kolom 2: Gedung */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Gedung
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate" title={gedung}>
              {gedung || 'Ahmad Yani'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
              Lokasi Duduk
            </span>
          </div>

          {/* Kolom 3: Wisma */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Wisma
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate" title={wisma}>
              {wisma || 'Wisma Soedirman'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
              Akomodasi
            </span>
          </div>
        </div>

        {/* Full-width Row: Kamar */}
        <div className="px-3 py-2 rounded-xl bg-indigo-50/40 border border-indigo-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-semibold text-slate-600">
              Nomor Kamar:
            </span>
          </div>
          <span className="font-bold font-mono text-indigo-950 text-xs sm:text-sm">
            {room && room !== '-' ? room : 'Tidak Menginap'}
          </span>
        </div>
      </div>

      {/* 7. INFORMASI EVENT */}
      <div className="pt-1 space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>4 – 6 September 2026 &bull; 08.00 WIB</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur</span>
        </div>
      </div>
    </div>
  );
};
