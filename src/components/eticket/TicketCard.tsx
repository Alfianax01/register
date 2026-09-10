'use client';

import React from 'react';
import { Guest } from '@/types';
import { CheckCircle2, Clock, Calendar, MapPin, Building, ShieldCheck, Armchair } from 'lucide-react';
import { MATRA_COLORS, getMatraColor, safeMatraBg } from '@/constants/matraColors';
import {
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Building,
  ShieldCheck,
  Armchair,
  DoorClosed,
  UserCheck
} from 'lucide-react';
import { getMatraColor, safeMatraBg } from '@/constants/matraColors';
import { formatIndonesianDate, formatIndonesianTimeWIB } from '@/lib/utils/formatters';

export interface TicketCardProps {
  guest: Guest;
  qrCodeUrl: string;
  status: 'REGISTRASI' | 'CHECK_IN';
  status: 'TEREGISTRASI' | 'CHECK-IN' | 'REGISTRASI' | 'CHECK_IN';
  seat: string;
  gedung?: string;
  ruangan?: string;
  wisma: string;
  room: string;
  checkinDetails?: {
    gate?: string;
    waktu?: string;
    petugas?: string;
    tanggal?: string;
    jam?: string;
  } | null;
}

/**
 * Komponen Tunggal (Reusable) TicketCard untuk E-Ticket RAPIM TNI 2026.
 * Sesuai hierarki diagram UI/UX & V4 State Machine:
 * Sesuai hierarki diagram UI/UX & Prompt V6 State Machine:
 * 1. HEADER (RAPIM TNI 2026)
 * 2. STATUS BADGE [TERDAFTAR / CHECK-IN BERHASIL]
 * 3. QR CODE (dengan overlay status SUDAH DIGUNAKAN via opacity transition)
 * 4. IDENTITAS PESERTA (Nama, NRP, Matra, Jabatan/Kesatuan)
 * 5. HINT BOX (Hanya jika belum check-in: Background warning 8%, border 20%, radius 10px)
 * 6. CHECK-IN INFO (Hanya jika sudah check-in)
 * 7. PENEMPATAN PESERTA (Hanya jika sudah check-in: Kursi | Gedung | Ruangan & Wisma | Kamar)
 * 8. INFORMASI EVENT (Tanggal, Lokasi)
 * 2. STATUS BADGE [🟡 TEREGISTRASI / 🟢 CHECK-IN BERHASIL]
 * 3. WAKTU REGISTRASI CARD (Icon 📅🕒, format Indonesia + WIB, tampil di kedua status)
 * 4. QR CODE (dengan overlay status SUDAH DIGUNAKAN saat CHECK-IN)
 * 5. IDENTITAS PESERTA (Nama, Pangkat, NRP, Matra, Jabatan/Kesatuan)
 * 6. HINT BOX (Hanya jika belum check-in)
 * 7. CHECK-IN INFO (Hanya jika sudah check-in: 📅 Tanggal + 🕒 Jam + 🚪 Gate + 👤 Petugas)
 * 8. PENEMPATAN PESERTA (Hanya jika sudah check-in: Kursi | Gedung | Ruangan & Wisma | Kamar)
 * 9. INFORMASI EVENT (Tanggal, Lokasi)
 */
export const TicketCard: React.FC<TicketCardProps> = ({
  guest,
  qrCodeUrl,
  status,
  seat,
  gedung = 'Gedung Ahmad Yani',
  ruangan = 'Ruang Sidang Utama',
  wisma,
  room,
  checkinDetails
}) => {
  const isCheckIn = status === 'CHECK_IN';
  const isCheckIn = status === 'CHECK_IN' || status === 'CHECK-IN';
  const matraSpec = getMatraColor(guest?.matra || guest?.kategori_instansi);

  // Waktu Registrasi: Diambil dari registered_at atau created_at (Format Indonesia + WIB)
  const regTimestamp = guest.registered_at || guest.created_at || (guest as any).tgl_registrasi || '2026-09-09T09:28:00+07:00';
  const regDateShort = formatIndonesianDate(regTimestamp, 'short'); // Contoh: 09 Sep 2026
  const regDateFull = formatIndonesianDate(regTimestamp, 'long');   // Contoh: 09 September 2026
  const regTime = formatIndonesianTimeWIB(regTimestamp);             // Contoh: 09:28 WIB

  // Waktu Check-In: Diambil saat terverifikasi di gerbang
  const checkinTimestamp = guest.waktu_kehadiran_pertama || guest.checkin_time || checkinDetails?.waktu || '2026-09-09T09:28:00+07:00';
  const checkinDate = checkinDetails?.tanggal || formatIndonesianDate(checkinTimestamp, 'short');
  const checkinTime = checkinDetails?.jam || formatIndonesianTimeWIB(checkinTimestamp);
  const checkinGate = checkinDetails?.gate || guest.checkin_gate || 'Gate 1 (Utama)';
  const checkinOfficer = checkinDetails?.petugas || 'Petugas Scanner 01';

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
      <div className="flex justify-center pb-1">
        <div
          className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-[20px] font-bold text-xs tracking-wider uppercase transition-colors duration-300 ${
            isCheckIn
              ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
              ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
          }`}
        >
          {isCheckIn ? (
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          ) : (
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <Clock className="w-4 h-4 text-amber-600 stroke-[2.5]" />
          )}
          <span>{isCheckIn ? 'CHECK-IN BERHASIL' : 'TERDAFTAR'}</span>
          <span>{isCheckIn ? 'CHECK-IN BERHASIL' : 'TEREGISTRASI'}</span>
        </div>
      </div>

      {/* 3. QR CODE */}
      {/* 3. WAKTU REGISTRASI CARD (Design Token: bg-secondary, radius 10px, padding 12px 16px) */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderColor: '#e2e8f0',
          borderRadius: '10px',
          padding: '10px 14px',
          borderWidth: '1px',
          borderStyle: 'solid'
        }}
        className="flex items-center justify-between text-xs transition-all"
      >
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Waktu Registrasi
          </span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-slate-800">
          <span className="flex items-center gap-1.5" title={regDateFull}>
            <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span>{regDateShort}</span>
          </span>
          <span className="flex items-center gap-1 font-mono text-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>{regTime}</span>
          </span>
        </div>
      </div>

      {/* 4. QR CODE */}
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
      {/* 5. IDENTITAS PESERTA */}
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
            {guest.nrp && guest.nrp !== '-' && (
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
                className="w-2.5 h-2.5 rounded-full shadow-2xs"
                style={{ backgroundColor: safeMatraBg(guest?.matra || guest?.kategori_instansi) }}
              />
              <span>{matraSpec.label}</span>
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

      {/* HINT BOX (Sebelum Check-In: Muncul saat belum scan QR di Gate) */}
      {/* 6. HINT BOX (Sebelum Check-In: Muncul saat status TEREGISTRASI) */}
      {!isCheckIn && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderColor: 'rgba(245, 158, 11, 0.20)',
            borderRadius: '10px',
            padding: '12px 16px',
            textAlign: 'center',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
        >
          <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-xs">
            <Clock className="w-3.5 h-3.5 stroke-[2.5] text-amber-600" />
            <span>Belum Check-In</span>
          </div>
          <p className="text-[11px] text-amber-900/80 mt-1 leading-relaxed font-medium">
            Penempatan kursi dan akomodasi akan muncul setelah scan QR di lokasi.
          </p>
        </div>
      )}

      {/* 5. CHECK-IN INFO (Hanya Tampil SETELAH Check-In Berhasil) */}
      {/* 5. CHECK-IN INFO (Tampil SETELAH Check-In Berhasil) */}
      {/* 7. CHECK-IN INFO (Hanya Tampil SETELAH Check-In Berhasil: 📅 Tanggal + 🕒 Jam + 🚪 Gate + 👤 Petugas) */}
      {isCheckIn && (
        <div className="py-1 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                  Verifikasi Gerbang (Check-In Info)
                  Verifikasi Gerbang (Check-In Terverifikasi)
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {checkinDetails?.gate || 'Gate Masuk: Gate A — Utama'} &bull; {checkinDetails?.waktu || 'Telah Hadir'}
                  {checkinDetails?.petugas ? ` &bull; Petugas: ${checkinDetails.petugas}` : ''}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full shrink-0">
              VALID
        <div
          style={{
            backgroundColor: '#ecfdf5',
            borderColor: '#a7f3d0',
            borderRadius: '10px',
            padding: '12px 14px',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
          className="space-y-2.5 transition-all"
        >
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Informasi Check-In Resmi</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
              TERVERIFIKASI
            </span>
          </div>

          {/* Grid 4 Item: 📅 Tanggal, 🕒 Jam, 🚪 Gate, 👤 Petugas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* 📅 Tanggal Check-In */}
            <div className="bg-white/90 p-2 rounded-lg border border-emerald-200/60">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>Tanggal</span>
              </span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px] truncate" title={checkinDate}>
                {checkinDate}
              </p>
            </div>

            {/* 🕒 Jam Check-In */}
            <div className="bg-white/90 p-2 rounded-lg border border-emerald-200/60">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>Waktu</span>
              </span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px] font-mono truncate" title={checkinTime}>
                {checkinTime}
              </p>
            </div>

            {/* 🚪 Gate Masuk */}
            <div className="bg-white/90 p-2 rounded-lg border border-emerald-200/60">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <DoorClosed className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>Gate Masuk</span>
              </span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px] truncate" title={checkinGate}>
                {checkinGate}
              </p>
            </div>

            {/* 👤 Petugas Scanner */}
            <div className="bg-white/90 p-2 rounded-lg border border-emerald-200/60">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span>Petugas</span>
              </span>
              <p className="font-bold text-slate-900 mt-0.5 text-[11px] truncate" title={checkinOfficer}>
                {checkinOfficer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. PENEMPATAN PESERTA (Kursi, Gedung, Wisma, Kamar — Hanya Tampil SETELAH Check-In) */}
      {/* 8. PENEMPATAN PESERTA (Kursi, Gedung, Wisma, Kamar — Hanya Tampil SETELAH Check-In) */}
      {isCheckIn && (
        <div className="py-1 pb-3 border-b border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Armchair className="w-3.5 h-3.5 text-blue-600" />
            <span>Penempatan Kursi & Akomodasi</span>
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            isCheckIn 
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
              : 'text-blue-700 bg-blue-50 border border-blue-200'
          }`}>
            {isCheckIn ? 'Check-In Terverifikasi' : 'Alokasi Resmi'}
          </span>
        </div>

        {/* Baris 1: Nomor Kursi | Gedung | Ruangan */}
        <div className="grid grid-cols-3 gap-2">
          {/* Kolom 1: Kursi */}
          <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200 text-center flex flex-col justify-between shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
              Nomor Kursi
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Armchair className="w-3.5 h-3.5 text-blue-600" />
              <span>Penempatan Kursi & Akomodasi</span>
            </span>
            <span className="text-base sm:text-lg font-black text-[#1E3A8A] font-mono block">
              {seat || guest.seat_number || 'A-01'}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded text-emerald-700 bg-emerald-50 border border-emerald-200">
              Check-In Terverifikasi
            </span>
            <span className="text-[10px] text-blue-800 font-semibold block pt-0.5">
              {guest.seat_block ? `Blok ${guest.seat_block}` : 'Sidang Pleno'}
            </span>
          </div>

          {/* Kolom 2: Gedung */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Gedung
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate" title={gedung || guest.building || 'Gedung Ahmad Yani'}>
              {gedung || guest.building || 'Gedung Ahmad Yani'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
              Mabes TNI
            </span>
          </div>
          {/* Baris 1: Nomor Kursi | Gedung | Ruangan */}
          <div className="grid grid-cols-3 gap-2">
            {/* Kolom 1: Kursi */}
            <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200 text-center flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                Nomor Kursi
              </span>
              <span className="text-base sm:text-lg font-black text-[#1E3A8A] font-mono block">
                {seat || guest.seat_number || 'A-01'}
              </span>
              <span className="text-[10px] text-blue-800 font-semibold block pt-0.5">
                {guest.seat_block ? `Blok ${guest.seat_block}` : 'Sidang Pleno'}
              </span>
            </div>

          {/* Kolom 3: Ruangan */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Ruangan
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate" title={ruangan || guest.room_name || guest.room || 'Ruang Sidang Utama'}>
              {ruangan || guest.room_name || guest.room || 'Ruang Sidang Utama'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
              Lantai 1
            </span>
          </div>
        </div>
            {/* Kolom 2: Gedung */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Gedung
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate" title={gedung || guest.building || 'Gedung Ahmad Yani'}>
                {gedung || guest.building || 'Gedung Ahmad Yani'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
                Mabes TNI
              </span>
            </div>

        {/* Baris 2: Wisma | Nomor Kamar */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Wisma Akomodasi
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate" title={wisma || guest.wisma_name || 'Tidak Menginap'}>
              {guest.butuh_akomodasi === 0 || guest.wisma_name === 'Tidak Menginap' 
                ? 'Tidak Menginap' 
                : (wisma || guest.wisma_name || 'Wisma Kartika')}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
              {guest.butuh_akomodasi === 0 || guest.wisma_name === 'Tidak Menginap' ? 'Tanpa Penginapan' : 'Mess Resmi TNI'}
            </span>
            {/* Kolom 3: Ruangan */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Ruangan
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate" title={ruangan || guest.room_name || guest.room || 'Ruang Sidang Utama'}>
                {ruangan || guest.room_name || guest.room || 'Ruang Sidang Utama'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
                Lantai 1
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Nomor Kamar & Bed
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 block truncate">
              {guest.butuh_akomodasi === 0 || guest.wisma_name === 'Tidak Menginap' || (!guest.room_number && !room)
                ? 'Tidak Menginap'
                : `Kamar ${room || guest.room_number}${guest.bed_number ? ` (Bed ${guest.bed_number})` : ''}`}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
              {guest.butuh_akomodasi === 0 || guest.wisma_name === 'Tidak Menginap' ? 'Status: Mandiri' : 'Kamar Ditentukan'}
            </span>
          {/* Baris 2: Wisma | Nomor Kamar */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Wisma Akomodasi
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate" title={wisma || guest.wisma_name || 'Tidak Menginap'}>
                {guest.butuh_akomodasi === 0 || guest.wisma_name === 'Tidak Menginap' 
                  ? 'Tidak Menginap' 
                  : (wisma || guest.wisma_name || 'Wisma Kartika')}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
                {guest.butuh_akomodasi === 0 || guest.wisma_name === 'Tidak Menginap' ? 'Tanpa Penginapan' : 'Mess Resmi TNI'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Nomor Kamar & Bed
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 block truncate">
                {guest.butuh_akomodasi === 0 || guest.wisma_name === 'Tidak Menginap' || (!guest.room_number && !room)
                  ? 'Tidak Menginap'
                  : `Kamar ${room || guest.room_number}${guest.bed_number ? ` (Bed ${guest.bed_number})` : ''}`}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block pt-0.5">
                {guest.butuh_akomodasi === 0 || guest.wisma_name === 'Tidak Menginap' ? 'Status: Mandiri' : 'Kamar Ditentukan'}
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 7. INFORMASI EVENT */}
      {/* 9. INFORMASI EVENT */}
      <div className="pt-2 text-xs text-slate-500 space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>Rabu &ndash; Kamis, 4 &ndash; 5 September 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
          <span>Gedung Ahmad Yani, Mabes TNI Cilangkap</span>
        </div>
      </div>
    </div>
  );
};
