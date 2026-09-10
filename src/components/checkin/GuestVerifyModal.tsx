'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTimeID } from '@/lib/utils/formatters';
import {
  CheckCircle2,
  AlertTriangle,
  Armchair,
  Bed
} from 'lucide-react';

interface GuestVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    guest: any;
    alreadyCheckedIn: boolean;
    previousTimestamp?: string;
    log: any;
    previousGate?: string;
    log?: any;
    assignment?: any;
  } | null;
}

export const GuestVerifyModal: React.FC<GuestVerifyModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!result) return null;

  const { guest, alreadyCheckedIn, previousTimestamp, log } = result;
  const assignment = (result as any).assignment || guest?.assignment;

  const seatCode = assignment?.seat_code || guest?.seat_number || '-';
  const seatArea = assignment?.seat_area || guest?.building || 'Gedung Ahmad Yani';
  const wismaName = assignment?.wisma_name || guest?.wisma || 'Wisma Sudirman';
  const roomCode = assignment?.room_code
    ? `Kamar ${assignment.room_code}`
    : guest?.room_number
    ? (String(guest.room_number).startsWith('Kamar') ? guest.room_number : `Kamar ${guest.room_number}`)
    : '-';

  const scanTimeStr = log?.scanned_at
    ? formatDateTimeID(log.scanned_at)
    : formatDateTimeID(new Date().toISOString());

  const prevTimeStr = previousTimestamp
    ? formatDateTimeID(previousTimestamp)
    : guest?.checkin_time
    ? formatDateTimeID(guest.checkin_time)
    : '-';

  const prevGateStr = (result as any).previousGate || guest?.checkin_gate || log?.checkpoint_name || 'Gate Utama';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={alreadyCheckedIn ? 'Verifikasi Ulang Kehadiran' : 'Verifikasi Kehadiran Sukses'}
      title={alreadyCheckedIn ? 'PESERTA SUDAH CHECK-IN' : 'CHECK-IN BERHASIL'}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Status Alert Banner */}
        {alreadyCheckedIn ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong className="block font-semibold">Tamu Sudah Terverifikasi Hadir Sebelumnya</strong>
              <strong className="block font-bold text-amber-900">PERINGATAN: Peserta Sudah Check-In</strong>
              <span className="text-amber-700">
                Tercatat pada {formatDateTimeID(previousTimestamp)}. Pemindaian ganda telah ditambahkan ke log audit.
                Peserta ini telah terverifikasi hadir sebelumnya. Pemindaian ulang tidak membuat duplikasi log presensi.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <div>
              <strong className="block font-semibold">Presensi Berhasil Dikonfirmasi</strong>
              <span className="text-emerald-700">Tercatat di {log.checkpoint_name} pada {formatDateTimeID(log.scanned_at)}</span>
              <strong className="block font-bold text-emerald-950">CHECK-IN BERHASIL</strong>
              <span className="text-emerald-700">Tamu berhasil diverifikasi dan terdata hadir secara real-time.</span>
            </div>
          </div>
        )}

        {/* Guest Identity Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={guest.matra === 'AD' ? 'ad' : guest.matra === 'AL' ? 'al' : guest.matra === 'AU' ? 'au' : guest.matra === 'NON_TNI' || guest.matra === 'SIPIL' ? 'gold' : 'slate'} size="sm">
                  {guest.matra}
                  {guest.matra === 'NON_TNI' ? 'K/L' : guest.matra}
                </Badge>
                <span className="text-xs font-semibold text-slate-700">
                  {guest.pangkat} &bull; <span className="font-mono text-slate-500">NRP {guest.nrp}</span>
                </span>
        {/* Info Box */}
        {alreadyCheckedIn ? (
          /* Tampilan Already Checked-In */
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Nama Peserta
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {guest?.nama || '-'}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {guest?.pangkat || '-'} &bull; <span className="font-mono text-slate-500">NRP {guest?.nrp || '-'}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Matra
                  </span>
                  <Badge variant={guest?.matra === 'AD' ? 'ad' : guest?.matra === 'AL' ? 'al' : guest?.matra === 'AU' ? 'au' : 'slate'} size="sm">
                    {guest?.matra || '-'}
                  </Badge>
                </div>
              </div>
              <h4 className="text-base font-semibold text-slate-900 mt-1">
                {guest.nama}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Jabatan Kedinasan:</span>
              <span className="text-slate-800 font-medium">{guest.jabatan}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[11px] font-medium">Waktu Check-In Sebelumnya</span>
                <span className="text-slate-900 font-bold font-mono text-xs block mt-1">{prevTimeStr}</span>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-500 block text-[11px] font-medium">Gate Sebelumnya</span>
                <span className="text-slate-900 font-bold text-xs block mt-1">{prevGateStr}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Satuan / Satker:</span>
              <span className="text-slate-800 font-medium">{guest.satuan} ({guest.satker})</span>
            </div>
          </div>
        </div>

        {/* Direction Cards: Seating & Room */}
        {(() => {
          const assignment = (result as any).assignment || guest.assignment;
          const seatCode = assignment?.seat_code || guest.seat_assignment || guest.seat_number || 'A-01';
          const seatArea = assignment?.seat_area || 'Gedung Ahmad Yani';
          const wismaName = assignment?.wisma_name || 'Wisma Sudirman';
          const roomCode = assignment?.room_code ? `Kamar ${assignment.room_code}` : 'Kamar 203';
          const roomFloor = assignment?.room_floor || 'Lantai 2';

          return (
            <div className="grid grid-cols-2 gap-3">
              {/* Seating Direction */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
                <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium mb-1">
                  <Armchair className="w-4 h-4" />
                  <span>Nomor Kursi</span>
                </div>
        ) : (
          /* Tampilan Valid Check-In Sukses */
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xl font-black font-mono text-blue-900 block">
                    {seatCode}
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Nama Peserta
                  </span>
                  <span className="text-[11px] text-blue-700 font-medium">
                    {seatArea}
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {guest?.nama || '-'}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    {guest?.pangkat || '-'} &bull; <span className="font-mono text-slate-500">NRP {guest?.nrp || '-'}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                    Matra
                  </span>
                  <Badge variant={guest?.matra === 'AD' ? 'ad' : guest?.matra === 'AL' ? 'al' : guest?.matra === 'AU' ? 'au' : 'slate'} size="sm">
                    {guest?.matra || '-'}
                  </Badge>
                </div>
              </div>
            </div>

              {/* Wisma Direction */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mb-1">
                  <Bed className="w-4 h-4 text-emerald-600" />
                  <span>Lokasi Wisma &amp; Kamar</span>
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    {wismaName}
                  </span>
                  <span className="text-[11px] text-emerald-800 font-semibold block">
                    {roomCode} &bull; {roomFloor}
                  </span>
                </div>
            {/* Grid 4 Kartu Data: No Kursi, Tempat, Nomor Kamar, Waktu Scan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-blue-700 block text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Armchair className="w-3 h-3" />
                  Nomor Kursi
                </span>
                <span className="text-base font-black font-mono text-blue-950 block mt-1">
                  {seatCode}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-emerald-700 block text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  Tempat
                </span>
                <span className="text-xs font-bold text-emerald-950 block mt-1 truncate" title={seatArea}>
                  {seatArea}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
                <span className="text-indigo-700 block text-[10px] font-bold uppercase tracking-wider">
                  Nomor Kamar
                </span>
                <span className="text-xs font-black font-mono text-indigo-950 block mt-1">
                  {roomCode}
                </span>
                <span className="text-[10px] text-indigo-700 block truncate">{wismaName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-slate-600 block text-[10px] font-bold uppercase tracking-wider">
                  Waktu Scan
                </span>
                <span className="text-[11px] font-bold font-mono text-slate-900 block mt-1">
                  {scanTimeStr}
                </span>
              </div>
            </div>
          );
        })()}
          </div>
        )}

        {/* Action button */}
        <Button variant="primary" size="md" onClick={onClose} className="w-full text-xs font-semibold h-[42px]">
          <span>Selesai & Scan Tamu Berikutnya</span>
          <span>Selesai &amp; Scan Tamu Berikutnya</span>
        </Button>
      </div>
    </Modal>
  );
};
