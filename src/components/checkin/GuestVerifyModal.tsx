'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  Armchair,
  Building2,
  Hotel,
  DoorOpen,
  User,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';

interface GuestVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    guest: any;
    alreadyCheckedIn: boolean;
    previousTimestamp?: string;
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

  const seatCode = assignment?.seat_code || guest?.seat_assignment || guest?.seat_number || '-';
  const wismaName = assignment?.wisma_name || guest?.wisma_name || guest?.wisma || 'Tidak Menginap';
  const roomNumber = assignment?.room_code || guest?.room_number || '-';

  const rawTimestamp = previousTimestamp || guest?.checkin_time;
  let prevDateStr = '-';
  let prevTimeStr = '-';

  if (rawTimestamp) {
    try {
      const d = new Date(rawTimestamp);
      if (!isNaN(d.getTime())) {
        prevDateStr = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(d);

        const timeOnly = new Intl.DateTimeFormat('id-ID', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(d).replace('.', ':');
        prevTimeStr = `${timeOnly} WIB`;
      }
    } catch {
      prevDateStr = String(rawTimestamp);
    }
  }

  const prevGateStr = (result as any).previousGate || guest?.checkin_gate || log?.checkpoint_name || 'Gate Utama';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
    >
      {alreadyCheckedIn ? (
        /* D. Redesign Modal "Peserta Sudah Check-In" - Compact Single Card */
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 sm:p-4 text-slate-800 space-y-3">
            {/* Header Title */}
            <div className="flex items-center gap-2 pb-2.5 border-b border-amber-200/80">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <h3 className="text-sm font-bold text-amber-900 tracking-tight">
                Peserta Sudah Check-In
              </h3>
            </div>

            {/* Content Fields */}
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Nama:</span>
                <span className="text-sm font-bold text-slate-900 block leading-tight">
                  {guest?.nama || '-'}
                </span>
                {guest?.pangkat && (
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    {guest.pangkat} {guest?.nrp ? `• NRP ${guest.nrp}` : ''}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Matra:</span>
                <span className="text-xs font-semibold text-slate-800 block">
                  {guest?.matra || '-'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Check-In Sebelumnya:</span>
                <span className="text-xs font-semibold text-slate-900 block">
                  {prevDateStr}
                </span>
                {prevTimeStr !== '-' && (
                  <span className="text-xs font-bold text-amber-800 font-mono block">
                    {prevTimeStr}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Gate:</span>
                <span className="text-xs font-semibold text-slate-800 block">
                  {prevGateStr}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-full text-xs font-semibold h-10 border-slate-300 hover:bg-slate-100"
          >
            Tutup
          </Button>
        </div>
      ) : (
        /* E. Modal Scan Berhasil - Green Compact Single Card */
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3.5 sm:p-4 text-slate-800 space-y-3">
            {/* Header Title */}
            <div className="flex items-center gap-2 pb-2.5 border-b border-emerald-200/80">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <h3 className="text-sm font-bold text-emerald-900 tracking-tight">
                Check-In Berhasil
              </h3>
            </div>

            {/* Content Fields */}
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[11px] text-slate-500 block font-medium">Nama:</span>
                <span className="text-sm font-bold text-slate-900 block leading-tight">
                  {guest?.nama || '-'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Matra:</span>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {guest?.matra || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Pangkat:</span>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {guest?.pangkat || '-'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 block font-medium">Nomor Kursi:</span>
                <span className="text-base font-black font-mono text-emerald-950 block">
                  {seatCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Wisma:</span>
                  <span className="text-xs font-semibold text-slate-800 block truncate" title={wismaName}>
                    {wismaName}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-medium">Nomor Kamar:</span>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {roomNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full text-xs font-semibold h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Selesai
          </Button>
        </div>
      )}
    </Modal>
  );
};
