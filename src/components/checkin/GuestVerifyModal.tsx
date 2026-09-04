'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { getMatraBadgeInfo, formatDateTimeID } from '@/lib/utils/formatters';
import {
  CheckCircle2,
  AlertTriangle,
  Armchair,
  Bed,
  Building,
  User,
  Clock
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
  const matraInfo = getMatraBadgeInfo(guest.matra);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={alreadyCheckedIn ? 'Peringatan: Verifikasi Ulang (Re-Scan)' : 'Verifikasi Kehadiran Berhasil!'}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Status Alert Banner */}
        {alreadyCheckedIn ? (
          <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="block font-bold">Prajurit / Tamu Sudah Tercatat Hadir Sebelumnya!</strong>
              <span>
                Telah di-scan pada {formatDateTimeID(previousTimestamp)} di checkpoint ini. Presensi ganda tercatat dalam log audit.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div>
              <strong className="block font-bold">Presensi Berhasil Diterima</strong>
              <span>Tercatat di {log.checkpoint_name} pada {formatDateTimeID(log.scanned_at)}</span>
            </div>
          </div>
        )}

        {/* Guest Identity Card */}
        <div className="p-4 rounded-xl bg-[#091811] border border-[#1E3B2F] space-y-3">
          <div className="flex items-start gap-3.5">
            <TniEmblem matra={guest.matra} size="md" className="flex-shrink-0" />
            <div>
              <Badge variant={guest.matra === 'AD' ? 'ad' : guest.matra === 'AL' ? 'al' : guest.matra === 'AU' ? 'au' : 'gold'} size="sm">
                {matraInfo.label}
              </Badge>
              <h4 className="text-base font-serif font-bold text-slate-100 mt-1">
                {guest.gelar_depan ? `${guest.gelar_depan} ` : ''}
                {guest.nama}
                {guest.gelar_belakang ? `, ${guest.gelar_belakang}` : ''}
              </h4>
              <p className="text-xs font-semibold text-[#F5E296]">
                {guest.pangkat} &bull; <span className="font-mono">NRP {guest.nrp}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-[#163124]">
            <div>
              <span className="text-slate-400 block text-[10px]">Jabatan Kedinasan:</span>
              <span className="text-slate-200 font-medium">{guest.jabatan}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Satuan / Kesatuan:</span>
              <span className="text-slate-200 font-medium">{guest.satuan} ({guest.satker})</span>
            </div>
          </div>
        </div>

        {/* Tactical Guidance (Kursi & Kamar Langsung Mengarahkan Tamu) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Seating Direction */}
          <div className="p-3.5 rounded-xl bg-[#0B2117] border border-[#235840]">
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-semibold mb-1">
              <Armchair className="w-4 h-4" />
              <span>Arahkan ke Kursi</span>
            </div>
            {guest.seat_number ? (
              <div>
                <span className="text-lg font-serif font-bold text-[#F5E296] block">
                  {guest.seat_number}
                </span>
                <span className="text-[10px] text-slate-300">
                  {guest.seat_details?.group_code ? `Grup ${guest.seat_details.group_code}` : 'Sidang Pleno'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Belum ditentukan panitia</span>
            )}
          </div>

          {/* Wisma Direction */}
          <div className="p-3.5 rounded-xl bg-[#0B1E2E] border border-[#1E4369]">
            <div className="flex items-center gap-2 text-xs text-cyan-300 font-semibold mb-1">
              <Bed className="w-4 h-4" />
              <span>Kamar Penginapan</span>
            </div>
            {guest.room_details ? (
              <div>
                <span className="text-sm font-bold text-cyan-200 block">
                  Kamar {guest.room_details.room_number} (Bed {guest.room_details.slot})
                </span>
                <span className="text-[10px] text-slate-300 truncate block">
                  {guest.room_details.wisma_name}
                </span>
              </div>
            ) : guest.butuh_akomodasi ? (
              <span className="text-xs text-amber-300">Konfirmasi Panitia Wisma</span>
            ) : (
              <span className="text-xs text-slate-400">Tidak Menginap</span>
            )}
          </div>
        </div>

        {/* Action button */}
        <Button variant="gold" size="lg" onClick={onClose} className="w-full text-xs font-bold shadow-lg">
          <span>Tutup & Siap Scan Tamu Berikutnya</span>
        </Button>
      </div>
    </Modal>
  );
};

