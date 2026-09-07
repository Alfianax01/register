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
                {guest.nama}
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
                <div>
                  <span className="text-xl font-black font-mono text-blue-900 block">
                    {seatCode}
                  </span>
                  <span className="text-[11px] text-blue-700 font-medium">
                    {seatArea}
                  </span>
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
              </div>
            </div>
          );
        })()}

        {/* Action button */}
        <Button variant="primary" size="md" onClick={onClose} className="w-full text-xs font-semibold h-[42px]">
          <span>Selesai & Scan Tamu Berikutnya</span>
        </Button>
      </div>
    </Modal>
  );
};
