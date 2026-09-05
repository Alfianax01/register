'use client';

import React, { useState } from 'react';
import { SeatGroup, Seat, Guest } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Armchair, UserX, CheckCircle2, Check, User, Info } from 'lucide-react';
import {
  getMatraColor,
  WarnaKursiAlias,
  MATRA_COLORS
} from '@/lib/constants/matra-colors';

interface SeatingGridViewProps {
  groups: SeatGroup[];
  seats: Seat[];
  guests: Guest[];
  onAssignSeat: (seatNumber: string, guestId: string | null) => Promise<boolean | void> | void;
}

export const SeatingGridView: React.FC<SeatingGridViewProps> = ({
  groups,
  seats,
  guests,
  onAssignSeat
}) => {
  const [selectedGroupCode, setSelectedGroupCode] = useState('A');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const currentGroup = groups.find(g => g.code === selectedGroupCode) || groups[0];
  const groupSeats = seats.filter(s => s.group_code === selectedGroupCode);
  const unseatedGuests = guests.filter(g => !g.seat_number);

  const handleOpenSeat = (seat: Seat) => {
    setSelectedSeat(seat);
    setSelectedGuestId(seat.guest_id || '');
  };

  const handleCloseModal = () => {
    if (!isSaving) {
      setSelectedSeat(null);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedSeat) return;
    setIsSaving(true);
    try {
      await onAssignSeat(selectedSeat.seat_number, selectedGuestId || null);
      setSelectedSeat(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickClear = async () => {
    if (!selectedSeat) return;
    setIsSaving(true);
    try {
      await onAssignSeat(selectedSeat.seat_number, null);
      setSelectedSeat(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper untuk mendapatkan styling visual kursi berdasarkan status & warna matra
  const getSeatVisualClasses = (seat: Seat, isSelected: boolean) => {
    const isAssigned = !!seat.guest_id || seat.status === 'ASSIGNED' || seat.status === 'HADIR';

    if (!isAssigned) {
      if (isSelected) {
        return 'bg-blue-50 text-blue-800 border-blue-500 ring-2 ring-blue-500/40 scale-105 z-10 shadow-md';
      }
      return 'bg-[#F1F5F9] text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-200/60';
    }

    // Identifikasi alias warna kursi
    let alias: WarnaKursiAlias | undefined =
      (seat.colorAlias as WarnaKursiAlias) || (seat.warna as WarnaKursiAlias);
    if (!alias && (seat.kategori_instansi || seat.guest_matra)) {
      alias = getMatraColor(seat.kategori_instansi || seat.guest_matra).alias;
    }

    let baseClass = '';
    switch (alias) {
      case 'green':
        baseClass = 'bg-[#1B5E39] text-white border-[#14462a] hover:bg-[#164e2f]';
        break;
      case 'blue':
        baseClass = 'bg-[#1B6B93] text-white border-[#144f6d] hover:bg-[#165a7c]';
        break;
      case 'gray':
        baseClass = 'bg-[#6B7280] text-white border-[#4b5563] hover:bg-[#5b616e]';
        break;
      case 'white':
        baseClass = 'bg-white text-slate-900 border-slate-400 font-semibold shadow-xs hover:bg-slate-50';
        break;
      default:
        baseClass = 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700';
    }

    if (isSelected) {
      return `${baseClass} ring-2 ring-amber-400 ring-offset-2 scale-105 z-10 shadow-md`;
    }

    return baseClass;
  };

  const modalOccupant = selectedSeat?.guest_id
    ? guests.find(g => g.id === selectedSeat.guest_id)
    : null;

  const modalMatraDef = selectedSeat
    ? getMatraColor(
        selectedSeat.colorAlias ||
        selectedSeat.warna ||
        selectedSeat.kategori_instansi ||
        selectedSeat.guest_matra ||
        modalOccupant?.kategori_instansi ||
        modalOccupant?.matra
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Group Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {groups.map(grp => {
          const isSelected = selectedGroupCode === grp.code;
          const grpSeats = seats.filter(s => s.group_code === grp.code);
          const occupied = grpSeats.filter(s => !!s.guest_id).length;

          return (
            <button
              key={grp.code}
              type="button"
              onClick={() => { setSelectedGroupCode(grp.code); setSelectedSeat(null); }}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {grp.code}
              </span>
              <span>{grp.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {occupied}/{grp.capacity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Matra Color Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] sm:text-xs text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#1B5E39] border border-[#14462a]" />
          <span>TNI AD (Hijau)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#1B6B93] border border-[#144f6d]" />
          <span>TNI AU (Biru)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#6B7280] border border-[#4b5563]" />
          <span>TNI AL (Abu-abu)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white border border-slate-400 shadow-2xs" />
          <span>Kementerian / Lembaga (Putih)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-600 shadow-2xs" />
          <span>Hadir di Lokasi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#F1F5F9] border border-slate-300" />
          <span>Kursi Kosong</span>
        </div>
      </div>

      {/* Seating Stage & Grid (Responsive Mobile Scroll Container) */}
      <div className="p-3 sm:p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Horizontal Overflow Container for Mobile (360px, 390px, 414px) */}
        <div className="overflow-x-auto pb-3 -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="min-w-[560px] sm:min-w-0 space-y-4">
            {/* Stage Indicator (Podium Utama) */}
            <div className="w-full py-2 bg-slate-100 rounded-lg border border-slate-200 text-center text-xs font-semibold text-slate-600 tracking-wider uppercase shadow-2xs">
              &uarr; Mimbar Utama / Podium Pimpinan Sidang &uarr;
            </div>

            {/* 8-Column Seat Grid Visual */}
            <div className="grid grid-cols-8 gap-1.5 sm:gap-2.5">
              {groupSeats.map(seat => {
                const isAssigned = !!seat.guest_id || seat.status === 'ASSIGNED' || seat.status === 'HADIR';
                const isPresent = seat.status === 'HADIR' || seat.guest_status === 'HADIR';
                const isSelected = selectedSeat?.id === seat.id;
                const visualClass = getSeatVisualClasses(seat, isSelected);

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => handleOpenSeat(seat)}
                    className={`p-1 sm:p-2 rounded-lg border flex flex-col items-center justify-center min-h-[48px] sm:min-h-[68px] transition-all relative cursor-pointer ${visualClass}`}
                    title={`Kursi ${seat.seat_number} - ${isAssigned ? (seat.guest_name || 'Terisi') : 'Kosong'}`}
                  >
                    <Armchair
                      className={`w-3 h-3 sm:w-4 sm:h-4 mb-0.5 sm:mb-1 ${
                        isAssigned && (seat.colorAlias === 'white' || seat.warna === 'white')
                          ? 'text-slate-700'
                          : isAssigned
                          ? 'text-white'
                          : 'text-slate-400'
                      }`}
                    />

                    <span className="font-mono font-bold text-[10px] sm:text-xs leading-none">
                      {seat.seat_number}
                    </span>

                    {isAssigned && (
                      <span className="text-[8px] sm:text-[9px] truncate max-w-full block px-0.5 mt-0.5 opacity-90 leading-tight">
                        {seat.guest_name?.split(' ')[0]}
                      </span>
                    )}

                    {/* Status Indicator Dot */}
                    {isPresent ? (
                      <span
                        className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white shadow-xs"
                        title="Hadir di Lokasi"
                      />
                    ) : isAssigned ? (
                      <span
                        className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                          seat.colorAlias === 'white' ? 'bg-slate-400' : 'bg-white/70'
                        }`}
                      />
                    ) : (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center sm:hidden">
          Geser ke samping untuk melihat seluruh denah kursi
        </p>
      </div>

      {/* Modal Popup for Seat Allocation (Centered, Fade+Scale, Backdrop Blur) */}
      {selectedSeat && (
        <Modal
          isOpen={!!selectedSeat}
          onClose={handleCloseModal}
          maxWidth="md"
          title={`Alokasi Tempat Duduk`}
          description={`Sidang Paripurna RAPIM TNI 2026`}
        >
          <div className="space-y-4 text-xs">
            {/* Seat Information Card */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border ${
                    selectedSeat.colorAlias === 'green'
                      ? 'bg-[#1B5E39] text-white border-[#14462a]'
                      : selectedSeat.colorAlias === 'blue'
                      ? 'bg-[#1B6B93] text-white border-[#144f6d]'
                      : selectedSeat.colorAlias === 'gray'
                      ? 'bg-[#6B7280] text-white border-[#4b5563]'
                      : selectedSeat.colorAlias === 'white'
                      ? 'bg-white text-slate-900 border-slate-400'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    <Armchair className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        Kursi {selectedSeat.seat_number}
                      </span>
                      <Badge variant="primary" size="sm">
                        Grup {selectedSeat.group_code}
                      </Badge>
                      {modalMatraDef && selectedSeat.guest_id && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${modalMatraDef.badgeClass}`}>
                          {modalMatraDef.label}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {currentGroup?.name || `Grup ${selectedSeat.group_code}`}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-slate-500">
                  <span>Baris {selectedSeat.row_num}</span> &bull; <span>Kolom {selectedSeat.col_num}</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 font-medium">Status Kursi Saat Ini:</span>
                <div>
                  {selectedSeat.guest_status === 'HADIR' || selectedSeat.status === 'HADIR' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Telah Hadir di Lokasi
                    </span>
                  ) : selectedSeat.guest_id ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Armchair className="w-3.5 h-3.5 text-blue-600" />
                      Sudah Ditetapkan (Terisi)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Kosong (Belum Ditempati)
                    </span>
                  )}
                </div>
              </div>

              {/* Current Occupant Details (if assigned) */}
              {selectedSeat.guest_id && (
                <div className="pt-2.5 border-t border-slate-200/70 text-xs space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Prajurit yang Mengisi:
                  </span>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="font-semibold text-slate-900">
                          {selectedSeat.guest_rank} {selectedSeat.guest_name}
                        </span>
                      </div>
                      {selectedSeat.guest_matra && (
                        <Badge variant={selectedSeat.guest_matra.toLowerCase() as any} size="sm">
                          {selectedSeat.guest_matra}
                        </Badge>
                      )}
                    </div>
                    {modalOccupant && (
                      <div className="text-[11px] text-slate-500 pl-5.5 space-y-0.5">
                        <p>NRP: {modalOccupant.nrp} &bull; Jabatan: {modalOccupant.jabatan}</p>
                        <p>Satuan/Satker: {modalOccupant.satker} ({modalOccupant.satuan})</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Peserta */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor="modal_guest_select" className="block text-xs font-semibold text-slate-700">
                Pilih Prajurit / Tamu yang Dialokasikan:
              </label>
              <select
                id="modal_guest_select"
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                disabled={isSaving}
                className="w-full rounded-lg bg-white text-slate-900 border border-slate-200 text-xs sm:text-sm h-[46px] px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-xs transition-colors"
              >
                <option value="">-- Kosongkan Kursi Ini --</option>
                {selectedSeat.guest_id && (
                  <option value={selectedSeat.guest_id}>
                    (Saat ini) {selectedSeat.guest_rank} {selectedSeat.guest_name}
                  </option>
                )}
                {unseatedGuests.map(g => (
                  <option key={g.id} value={g.id}>
                    [{g.matra}] {g.pangkat} {g.nama} (NRP {g.nrp} - {g.satuan})
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>
                  {unseatedGuests.length > 0
                    ? `Terdapat ${unseatedGuests.length} prajurit terdaftar yang belum memiliki kursi.`
                    : 'Seluruh peserta terdaftar telah memiliki alokasi kursi.'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {selectedSeat.guest_id ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleQuickClear}
                  isLoading={isSaving}
                  disabled={isSaving}
                  className="text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-300 w-full sm:w-auto h-[44px]"
                  title="Hapus alokasi kursi ini"
                >
                  <UserX className="w-3.5 h-3.5 mr-1.5" />
                  <span>Kosongkan Kursi</span>
                </Button>
              ) : (
                <div className="hidden sm:block" />
              )}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="w-full sm:w-auto text-xs h-[44px]"
                >
                  Batal
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSaveAssignment}
                  isLoading={isSaving}
                  loadingText="Menyimpan..."
                  className="w-full sm:w-auto text-xs font-semibold h-[44px]"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Simpan Alokasi</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
