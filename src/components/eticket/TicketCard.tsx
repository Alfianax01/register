'use client';

import React from 'react';
import { Guest } from '@/types';
import { CheckCircle2, Clock } from 'lucide-react';

export interface TicketCardProps {
  guest: Guest;
  qrCodeUrl: string;
  status: 'REGISTRASI' | 'CHECK_IN';
  seat: string;
  seatDetail?: string | null;
  accommodation: string;
  room: string;
  roomFloor?: string | null;
}

/**
 * Komponen Tunggal (Reusable) TicketCard untuk E-Ticket RAPIM TNI 2026.
 * Layout, struktur card, spacing, dan section tetap 100% identik antara REGISTRASI dan CHECK-IN.
 * Tanpa layout shift, tanpa box tambahan, transisi state mulus melalui update nilai data & opacity overlay.
 */
export const TicketCard: React.FC<TicketCardProps> = ({
  guest,
  qrCodeUrl,
  status,
  seat,
  seatDetail,
  accommodation,
  room,
  roomFloor
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
      <div className="text-center space-y-1 pb-4 border-b border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#1E3A8A] text-[10px] font-bold tracking-widest uppercase">
          <span>TNI EVENT PASS &bull; RAPIM 2026</span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-[#1E3A8A] tracking-tight">
          E-TICKET RAPIM TNI 2026
        </h1>
        <p className="text-[11px] text-slate-500 font-medium">
          Gedung Ahmad Yani, Mabes TNI Cilangkap &bull; 4–6 September 2026
        </p>
      </div>

      {/* 2. QR CODE */}
      <div className="py-2 pb-4 border-b border-slate-100 flex flex-col items-center justify-center">
        <div className="relative w-[200px] h-[200px] p-2.5 bg-white rounded-xl border-2 border-slate-200/90 shadow-xs flex items-center justify-center overflow-hidden">
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={`QR Code ${guest.nama}`}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                isCheckIn ? 'opacity-30' : 'opacity-100'
              }`}
            />
          ) : (
            <div className="w-full h-full bg-slate-100 animate-pulse rounded-lg" />
          )}

          {/* Overlay Status Sudah Digunakan (Murni transition opacity, tanpa merubah struktur DOM) */}
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

      {/* 3. DATA PESERTA */}
      <div className="py-2 pb-4 border-b border-slate-100 space-y-3">
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
              Matra / Kategori
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

      {/* 4. STATUS */}
      <div className="py-2 pb-4 border-b border-slate-100 flex flex-col items-center justify-center space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Status Kehadiran
        </span>
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs tracking-wider uppercase transition-colors duration-300 ${
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
          <span>{isCheckIn ? 'CHECK-IN' : 'REGISTRASI'}</span>
        </div>
      </div>

      {/* 5. PENEMPATAN PESERTA (Selalu 3 kolom tetap) */}
      <div className="pt-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Penempatan Peserta
          </span>
          <span
            className={`text-[10px] font-semibold transition-opacity duration-300 ${
              isCheckIn ? 'text-emerald-600 opacity-100' : 'opacity-0'
            }`}
          >
            &bull; Terkonfirmasi di Lokasi
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Kolom 1: Kursi */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center flex flex-col justify-between min-h-[78px] transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Kursi
              </span>
              <span
                className={`block leading-tight ${
                  isCheckIn
                    ? 'text-base sm:text-lg font-black text-[#1E3A8A] font-mono'
                    : 'text-xs sm:text-[13px] font-medium text-slate-400 italic'
                }`}
              >
                {seat}
              </span>
            </div>
            <span
              className={`text-[10px] pt-1 border-t border-slate-200/60 block truncate transition-colors ${
                isCheckIn ? 'text-slate-500 font-medium' : 'text-slate-400/80 italic'
              }`}
            >
              {isCheckIn ? (seatDetail || 'Gedung Ahmad Yani') : 'Ditetapkan di Gate'}
            </span>
          </div>

          {/* Kolom 2: Wisma */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center flex flex-col justify-between min-h-[78px] transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Wisma
              </span>
              <span
                className={`block leading-tight ${
                  isCheckIn
                    ? 'text-xs sm:text-sm font-bold text-slate-900'
                    : 'text-xs sm:text-[13px] font-medium text-slate-400 italic'
                }`}
              >
                {accommodation}
              </span>
            </div>
            <span
              className={`text-[10px] pt-1 border-t border-slate-200/60 block truncate transition-colors ${
                isCheckIn ? 'text-slate-500 font-medium' : 'text-slate-400/80 italic'
              }`}
            >
              {isCheckIn ? 'Akomodasi Peserta' : 'Mess Mabes TNI'}
            </span>
          </div>

          {/* Kolom 3: Kamar */}
          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 text-center flex flex-col justify-between min-h-[78px] transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Kamar
              </span>
              <span
                className={`block leading-tight ${
                  isCheckIn
                    ? 'text-base sm:text-lg font-black text-indigo-900 font-mono'
                    : 'text-xs sm:text-[13px] font-medium text-slate-400 italic'
                }`}
              >
                {room}
              </span>
            </div>
            <span
              className={`text-[10px] pt-1 border-t border-slate-200/60 block truncate transition-colors ${
                isCheckIn ? (roomFloor || 'Lantai Kamar') : 'Ditetapkan di Gate'
              }`}
            >
              {isCheckIn ? (roomFloor || 'Lantai Kamar') : 'Ditetapkan di Gate'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
