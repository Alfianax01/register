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
  } | null;
}

export const GuestVerifyModal: React.FC<GuestVerifyModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!result) return null;

  const { guest, alreadyCheckedIn, previousTimestamp, log } = result;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={alreadyCheckedIn ? 'Verifikasi Ulang Kehadiran' : 'Verifikasi Kehadiran Sukses'}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Status Alert Banner */}
        {alreadyCheckedIn ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong className="block font-semibold">Tamu Sudah Terverifikasi Hadir Sebelumnya</strong>
              <span className="text-amber-700">
                Tercatat pada {formatDateTimeID(previousTimestamp)}. Pemindaian ganda telah ditambahkan ke log audit.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <div>
              <strong className="block font-semibold">Presensi Berhasil Dikonfirmasi</strong>
              <span className="text-emerald-700">Tercatat di {log.checkpoint_name} pada {formatDateTimeID(log.scanned_at)}</span>
            </div>
          </div>
        )}

        {/* Guest Identity Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={guest.matra === 'AD' ? 'ad' : guest.matra === 'AL' ? 'al' : guest.matra === 'AU' ? 'au' : 'slate'} size="sm">
                  {guest.matra}
                </Badge>
                <span className="text-xs font-semibold text-slate-700">
                  {guest.pangkat} &bull; <span className="font-mono text-slate-500">NRP {guest.nrp}</span>
                </span>
              </div>
              <h4 className="text-base font-semibold text-slate-900 mt-1">
                {guest.gelar_depan ? `${guest.gelar_depan} ` : ''}
                {guest.nama}
                {guest.gelar_belakang ? `, ${guest.gelar_belakang}` : ''}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-200">
            <div>
              <span className="text-slate-500 block text-[11px]">Jabatan Kedinasan:</span>
              <span className="text-slate-800 font-medium">{guest.jabatan}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Satuan / Satker:</span>
              <span className="text-slate-800 font-medium">{guest.satuan} ({guest.satker})</span>
            </div>
          </div>
        </div>

        {/* Direction Cards: Seating & Room */}
        <div className="grid grid-cols-2 gap-3">
          {/* Seating Direction */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium mb-1">
              <Armchair className="w-4 h-4" />
              <span>Nomor Kursi</span>
            </div>
            {guest.seat_number ? (
              <div>
                <span className="text-xl font-bold font-mono text-blue-900 block">
                  {guest.seat_number}
                </span>
                <span className="text-[11px] text-blue-700">
                  {guest.seat_details?.group_code ? `Grup ${guest.seat_details.group_code}` : 'Sidang Pleno'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Belum ditentukan</span>
            )}
          </div>

          {/* Wisma Direction */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mb-1">
              <Bed className="w-4 h-4 text-slate-500" />
              <span>Akomodasi Wisma</span>
            </div>
            {guest.room_details ? (
              <div>
                <span className="text-sm font-semibold text-slate-900 block">
                  Kamar {guest.room_details.room_number} (Bed {guest.room_details.slot})
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {guest.room_details.wisma_name}
                </span>
              </div>
            ) : guest.butuh_akomodasi ? (
              <span className="text-xs text-amber-600 font-medium">Perlu Konfirmasi Wisma</span>
            ) : (
              <span className="text-xs text-slate-500">Tidak Menginap</span>
            )}
          </div>
        </div>

        {/* Action button */}
        <Button variant="primary" size="md" onClick={onClose} className="w-full text-xs font-semibold h-[42px]">
          <span>Selesai & Scan Tamu Berikutnya</span>
        </Button>
      </div>
    </Modal>
  );
};
