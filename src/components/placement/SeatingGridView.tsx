'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SeatGroup, Seat, Guest } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Armchair,
  UserX,
  CheckCircle2,
  Check,
  User,
  Info,
  Search,
  X,
  Building2,
  Sparkles,
  ChevronDown,
  ArrowLeftRight
} from 'lucide-react';
import {
  MATRA_COLORS as OFFICIAL_COLORS,
  MATRA_COLOR_SPECS,
  getMatraColor,
  MatraColorSpec,
  normalizeMatraKey,
  safeMatraBg,
  safeMatraBorder,
  safeMatraTintBg,
  safeMatraTintBorder,
  DEFAULT_MATRA_COLOR
} from '@/constants/matraColors';

interface SeatingGridViewProps {
  groups: SeatGroup[];
  seats: Seat[];
  guests: Guest[];
  onAssignSeat: (seatNumber: string, guestId: string | null) => Promise<boolean | void> | void;
  onSwapSeats?: (sourceSeatNumber: string, targetSeatNumber: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const SeatingGridView: React.FC<SeatingGridViewProps> = ({
  groups,
  seats,
  guests,
  onAssignSeat,
  onSwapSeats,
  isLoading = false
}) => {
  const [selectedGroupCode, setSelectedGroupCode] = useState('A');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Drag and Drop States
  const [draggedSeatNumber, setDraggedSeatNumber] = useState<string | null>(null);
  const [dragOverSeatNumber, setDragOverSeatNumber] = useState<string | null>(null);

  const currentGroup = groups.find(g => g.code === selectedGroupCode) || groups[0];
  const groupSeats = seats.filter(s => s.group_code === selectedGroupCode);
  const unseatedGuests = useMemo(() => guests.filter(g => !g.seat_number), [guests]);

  // Open modal on seat click
  const handleOpenSeat = (seat: Seat) => {
    setSelectedSeat(seat);
    setSelectedGuestId(seat.guest_id || '');
    setSearchQuery('');
  };

  // Close modal
  const handleCloseModal = () => {
    if (!isSaving) {
      setSelectedSeat(null);
      setSelectedGuestId('');
      setSearchQuery('');
    }
  };

  // Keyboard ESC listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSeat && !isSaving) {
        handleCloseModal();
      }
    };
    if (selectedSeat) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSeat, isSaving]);

  // Save assignment handler
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

  // Clear assignment handler
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

  // Searchable guests filtering
  const filteredGuests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return unseatedGuests;
    return unseatedGuests.filter(g =>
      (g.nama && g.nama.toLowerCase().includes(query)) ||
      (g.nrp && g.nrp.toLowerCase().includes(query)) ||
      (g.pangkat && g.pangkat.toLowerCase().includes(query)) ||
      (g.satker && g.satker.toLowerCase().includes(query)) ||
      (g.satuan && g.satuan.toLowerCase().includes(query)) ||
      (g.jabatan && g.jabatan.toLowerCase().includes(query))
    );
  }, [unseatedGuests, searchQuery]);

  // Active occupant data for modal
  const activeOccupantId = selectedGuestId || selectedSeat?.guest_id;
  const displayedGuest = activeOccupantId
    ? guests.find(g => g.id === activeOccupantId)
    : null;

  // Matra definition for the opened modal
  const modalMatraSpec: MatraColorSpec | null = selectedSeat
    ? getMatraColor(
        selectedSeat.guest_matra ||
        selectedSeat.kategori_instansi ||
        displayedGuest?.matra ||
        displayedGuest?.kategori_instansi
      )
    : null;

  // 1. Loading Skeleton State (Prompt V5 Requirement)
  if (isLoading) {
    return (
      <div className="w-full space-y-6 animate-pulse select-none">
        {/* Skeleton Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200/90 p-4 flex flex-col justify-center items-center gap-2 shadow-2xs">
              <div className="w-24 h-2.5 bg-slate-200 rounded-full" />
              <div className="w-12 h-6 bg-slate-200 rounded-md" />
            </div>
          ))}
        </div>

        {/* Skeleton Group Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-36 h-10 bg-slate-200 rounded-xl" />
          ))}
        </div>

        {/* Skeleton Seating Canvas */}
        <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-xs">
          <div className="w-full h-10 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl border border-slate-200/80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty State (Prompt V5 Requirement: Wajib handle seats / guests array kosong)
  if (seats.length === 0) {
    return (
      <div className="w-full p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <Armchair className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
        <h3 className="text-base font-bold text-slate-800">Belum Ada Data Denah Kursi</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Konfigurasi kursi belum dimuat atau belum tersedia pada sistem.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Group Tabs (VIP, Blok A, B, C, D, E, F) */}
      {/* 0. Stats Bar: Total Terisi / Total Kosong / Total Check-In */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Terisi</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 font-mono mt-0.5 block">
            {seats.filter(s => !!s.guest_id).length}
          </span>
          <span className="text-[10px] text-slate-400">Prajurit / Tamu Undangan</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Kosong</span>
          <span className="text-xl sm:text-2xl font-black text-slate-600 font-mono mt-0.5 block">
            {seats.filter(s => !s.guest_id).length}
          </span>
          <span className="text-[10px] text-slate-400">Kursi Tersedia</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Check-In</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-0.5 block">
            {seats.filter(s => s.status === 'CHECK_IN' || s.guest_status === 'CHECK_IN').length}
          </span>
          <span className="text-[10px] text-emerald-600/80 font-medium">Terverifikasi di Gate</span>
        </div>
      </div>

      {/* Group Tabs (Blok VIP, Blok A, B, C, D) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {groups.map(grp => {
          const isSelected = selectedGroupCode === grp.code;
          const grpSeats = seats.filter(s => s.group_code === grp.code);
          const occupied = grpSeats.filter(s => !!s.guest_id || s.status === 'ASSIGNED' || s.status === 'CHECK_IN' || (s.status as any) === 'HADIR').length;

          const c = grp.code.toUpperCase();
          const displayLabel = c === 'A' ? 'Blok A — TNI AD' :
                               c === 'B' ? 'Blok B — TNI AL' :
                               c === 'C' ? 'Blok C — TNI AU' :
                               c === 'D' ? 'Blok D — MABES/Kemen' :
                               (c === 'VIP' || c === 'E' || grp.name.includes('VIP')) ? 'Blok VIP — SIPIL' :
                               grp.name;

          return (
            <button
              key={grp.code}
              type="button"
              onClick={() => { setSelectedGroupCode(grp.code); setSelectedSeat(null); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer select-none ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm font-semibold ring-2 ring-blue-600/20'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {grp.code}
              </span>
              <span>{grp.name}</span>
              <span>{displayLabel}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {occupied}/{grp.capacity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Matra Color Legend Bar (Single Source of Truth) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs text-slate-700 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md shadow-2xs border" style={{ backgroundColor: OFFICIAL_COLORS.TNI_AD.hex, borderColor: '#187A41' }} />
            <span className="font-semibold text-slate-800">TNI AD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md shadow-2xs border" style={{ backgroundColor: OFFICIAL_COLORS.TNI_AU.hex, borderColor: '#1D4ED8' }} />
            <span className="font-semibold text-slate-800">TNI AU</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md shadow-2xs border" style={{ backgroundColor: OFFICIAL_COLORS.TNI_AL.hex, borderColor: '#64748B' }} />
            <span className="font-semibold text-slate-800">TNI AL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md shadow-2xs border" style={{ backgroundColor: OFFICIAL_COLORS.MABES.hex, borderColor: '#7E22CE' }} />
            <span className="font-semibold text-slate-800">Mabes TNI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md shadow-2xs border" style={{ backgroundColor: OFFICIAL_COLORS.SIPIL.hex, borderColor: '#A17D16' }} />
            <span className="font-semibold text-slate-800">Sipil / VIP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md shadow-2xs border border-slate-300" style={{ backgroundColor: OFFICIAL_COLORS.KEMENTERIAN.hex }} />
            <span className="font-semibold text-slate-800">Kementerian</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-200 shadow-2xs" />
            <span className="text-slate-500">Kosong</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-3 border-l border-slate-200 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22A559] ring-2 ring-emerald-200" />
            <span className="font-semibold text-emerald-800">Check-In (Hadir)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#22A559] ring-2 ring-emerald-200 shadow-2xs" />
            <span className="font-bold text-emerald-800">CHECK-IN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-2 ring-slate-100" />
            <span className="text-slate-500">Belum Check-In</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-2 ring-slate-100 shadow-2xs" />
            <span className="font-medium text-slate-500">BELUM CHECK-IN</span>
          </div>
        </div>
      </div>

      {/* Full-Width Seating Stage & Spacious Grid */}
      <div className="p-4 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        {/* Stage Indicator (Podium Utama di Atas) */}
        <div className="w-full py-3 bg-gradient-to-b from-slate-100 to-slate-200/70 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-800 tracking-wider uppercase shadow-2xs flex items-center justify-center gap-2">
          <span>&uarr;</span>
          <span>MIMBAR UTAMA / PODIUM PIMPINAN SIDANG RAPIM TNI 2026</span>
          <span>&uarr;</span>
        </div>

        {/* Responsive Seating Canvas with Smooth Scroll */}
        <div className="overflow-x-auto pb-4 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="min-w-[720px] md:min-w-[880px] lg:min-w-0 w-full flex justify-center">
            <div className="grid grid-cols-8 gap-2.5 sm:gap-3">
              {groupSeats.map(seat => {
                const isAssigned = !!seat.guest_id || seat.status === 'ASSIGNED' || seat.status === 'CHECK_IN' || (seat.status as any) === 'HADIR';
                const isPresent = seat.status === 'CHECK_IN' || (seat.status as any) === 'HADIR' || seat.guest_status === 'CHECK_IN' || (seat.guest_status as any) === 'HADIR';
                const isSelected = selectedSeat?.id === seat.id;
                const isDragOver = dragOverSeatNumber === seat.seat_number;
                const isDraggingThis = draggedSeatNumber === seat.seat_number;

                const spec = isAssigned
                  ? getMatraColor(seat.guest_matra || seat.kategori_instansi)
                  : null;

                const matraKey = isAssigned
                  ? normalizeMatraKey(seat.guest_matra || seat.kategori_instansi)
                  : null;

                const badgeLabel = matraKey === 'TNI_AD' ? 'AD' :
                                   matraKey === 'TNI_AU' ? 'AU' :
                                   matraKey === 'TNI_AL' ? 'AL' :
                                   matraKey === 'MABES' ? 'MABES' :
                                   matraKey === 'SIPIL' ? 'SIPIL' : 'KEMEN';

                return (
                  <button
                    key={seat.id}
                    type="button"
                    draggable={isAssigned}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', seat.seat_number);
                      setDraggedSeatNumber(seat.seat_number);
                    }}
                    onDragEnd={() => {
                      setDraggedSeatNumber(null);
                      setDragOverSeatNumber(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverSeatNumber !== seat.seat_number) {
                        setDragOverSeatNumber(seat.seat_number);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverSeatNumber === seat.seat_number) {
                        setDragOverSeatNumber(null);
                      }
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const sourceNum = e.dataTransfer.getData('text/plain') || draggedSeatNumber;
                      setDraggedSeatNumber(null);
                      setDragOverSeatNumber(null);
                      if (sourceNum && sourceNum !== seat.seat_number && onSwapSeats) {
                        await onSwapSeats(sourceNum, seat.seat_number);
                      }
                    }}
                    onClick={() => handleOpenSeat(seat)}
                    style={
                      isAssigned
                        ? {
                            backgroundColor: safeMatraTintBg(seat.guest_matra || seat.kategori_instansi),
                            borderColor: isDragOver ? '#2563EB' : isSelected ? '#F59E0B' : safeMatraTintBorder(seat.guest_matra || seat.kategori_instansi),
                            boxShadow: isSelected ? '0 0 0 2px #F59E0B, 0 4px 12px rgba(0,0,0,0.08)' : undefined
                          }
                        : undefined
                    }
                    className={`w-[84px] h-[74px] sm:w-[104px] sm:h-[88px] lg:w-[114px] lg:h-[92px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative select-none hover:-translate-y-1 hover:shadow-md active:translate-y-0 text-left border ${
                      !isAssigned
                        ? isSelected
                          ? 'bg-blue-50 text-blue-800 border-2 border-blue-500 ring-2 ring-blue-500/30 shadow-md scale-102 z-10'
                          : 'bg-[#F8FAFC] text-slate-500 border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/80'
                        : isDraggingThis
                        ? 'opacity-40 scale-95'
                        : isDragOver
                        ? 'ring-2 ring-blue-500 scale-105 shadow-lg z-20'
                        : ''
                    }`}
                    title={`Kursi ${seat.seat_number} - ${isAssigned ? (seat.guest_name || 'Terisi') : 'Kosong'} (Drag & Drop untuk memindahkan)`}
                  >
                    {/* Top Row: Icon / Matra Badge + Status Dot */}
                    <div className="w-full flex items-center justify-between">
                      {isAssigned ? (
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded shadow-2xs text-white"
                          style={{ backgroundColor: safeMatraBg(seat.guest_matra || seat.kategori_instansi) }}
                        >
                          {badgeLabel}
                        </span>
                      ) : (
                        <Armchair className="w-3.5 h-3.5 text-slate-400" />
                      )}

                      {/* Status Dot: 🟢 Check-in, ⚪ Belum */}
                      {isPresent ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-[#22A559] ring-2 ring-emerald-200 shadow-xs"
                          title="Hadir di Lokasi (Check-In)"
                        />
                      ) : isAssigned ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-1 ring-slate-200 shadow-2xs"
                          title="Belum Check-In"
                        />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>

                    {/* Center: Seat Number */}
                    <div className="text-center">
                      <span className="font-mono font-black text-xs sm:text-sm tracking-tight leading-none block text-slate-900">
                        {seat.seat_number}
                      </span>
                    </div>

                    {/* Bottom: Name or "Kosong" */}
                    <div className="w-full truncate text-center">
                      {isAssigned ? (
                        <span className="text-[10px] sm:text-[11px] truncate block font-bold text-slate-800 leading-tight">
                          {seat.guest_name?.split(' ')[0]}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block font-normal leading-tight">
                          Kosong
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
          <span>Tarik dan lepas (Drag & Drop) kartu kursi untuk menukar atau memindahkan peserta dengan cepat.</span>
        </p>
      </div>

      {/* Modal Popup Detail Peserta */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
          {/* Backdrop Overlay with Blur */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-200"
            onClick={handleCloseModal}
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <div className="relative w-[95%] sm:max-w-[90%] md:max-w-[720px] rounded-[20px] bg-white border border-slate-200/90 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 ease-out">
            {/* Modal Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs border"
                  style={{
                    backgroundColor: safeMatraTintBg(displayedGuest?.matra || selectedSeat.guest_matra || selectedSeat.kategori_instansi),
                    borderColor: safeMatraTintBorder(displayedGuest?.matra || selectedSeat.guest_matra || selectedSeat.kategori_instansi),
                    color: safeMatraBg(displayedGuest?.matra || selectedSeat.guest_matra || selectedSeat.kategori_instansi)
                  }}
                >
                  <Armchair className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold font-mono text-slate-900 tracking-tight">
                      Kursi {selectedSeat.seat_number}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Grup {selectedSeat.group_code}
                    </span>

                    {/* Status Hadir / Kosong / Terisi */}
                    {selectedSeat.guest_status === 'CHECK_IN' || (selectedSeat.guest_status as any) === 'HADIR' || selectedSeat.status === 'CHECK_IN' || (selectedSeat.status as any) === 'HADIR' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        CHECK-IN &bull; Hadir di Lokasi
                      </span>
                    ) : selectedSeat.guest_id ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Armchair className="w-3.5 h-3.5 text-blue-600" />
                        Sudah Ditetapkan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Kosong
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                    <span className="font-medium text-slate-700">
                      {currentGroup?.name || `Grup ${selectedSeat.group_code}`}
                    </span>
                    <span>&bull;</span>
                    <span>Posisi: Baris {selectedSeat.row_num} • Kolom {selectedSeat.col_num}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {/* Status Kursi Badges */}
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="font-medium text-slate-600">Kategori Penugasan:</span>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {modalMatraSpec && selectedSeat.guest_id && (
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-2xs"
                      style={{ backgroundColor: safeMatraBg(displayedGuest?.matra || selectedSeat.guest_matra || selectedSeat.kategori_instansi) }}
                    >
                      {modalMatraSpec.label}
                    </span>
                  )}
                  {selectedSeat.guest_status === 'CHECK_IN' || (selectedSeat.guest_status as any) === 'HADIR' || selectedSeat.status === 'CHECK_IN' || (selectedSeat.status as any) === 'HADIR' ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-300">
                      CHECK-IN &bull; Hadir di Lokasi
                    </span>
                  ) : selectedSeat.guest_id ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100/80 text-blue-800 border border-blue-300">
                      Telah Terdaftar
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200/80 text-slate-700 border border-slate-300">
                      Belum Terisi
                    </span>
                  )}
                </div>
              </div>

              {/* Data Peserta Card */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Data Prajurit / Pejabat Penempati:
                </span>

                {displayedGuest ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar with Matra Color Accent */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: modalMatraSpec?.hex || '#2563EB' }}
                      >
                        {displayedGuest.nama ? displayedGuest.nama.charAt(0).toUpperCase() : 'P'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                            {displayedGuest.nama}
                          </h4>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                            style={{ backgroundColor: modalMatraSpec?.hex || '#2563EB' }}
                          >
                            {displayedGuest.matra || 'TNI'}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          {displayedGuest.pangkat} &bull; <span className="font-mono text-slate-500">NRP {displayedGuest.nrp || '-'}</span>
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[11px] text-slate-400 block font-medium">Jabatan Kedinasan</span>
                            <span className="font-semibold text-slate-800">{displayedGuest.jabatan || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400 block font-medium">Satuan / Satker</span>
                            <span className="font-semibold text-slate-800">{displayedGuest.satuan || displayedGuest.satker || '-'}</span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400 block font-medium">Penempatan Kursi</span>
                            <span className="font-bold text-[#1E3A8A] font-mono">
                              {displayedGuest.seat_number || selectedSeat.seat_number} &bull; {displayedGuest.building || 'Gedung Ahmad Yani'} ({displayedGuest.room || 'Ruang Sidang Utama'})
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400 block font-medium">Akomodasi Wisma</span>
                            <span className="font-semibold text-slate-800">
                              {displayedGuest.butuh_akomodasi === 0 ? 'Tidak Menginap' : `${displayedGuest.wisma_name || 'Wisma Soedirman'} - Kamar ${displayedGuest.room_number || '-'}`}
                            </span>
                          </div>
                          <div className="sm:col-span-2 pt-1 border-t border-slate-100">
                            <span className="text-[11px] text-slate-400 block font-medium">Status Presensi Gate</span>
                            <span className={`font-semibold ${displayedGuest.status_kehadiran === 'CHECK_IN' ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {displayedGuest.status_kehadiran === 'CHECK_IN'
                                ? `CHECK-IN ${displayedGuest.waktu_kehadiran_pertama ? `(${new Date(displayedGuest.waktu_kehadiran_pertama).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB)` : ''}`
                                : 'TERDAFTAR (Belum Scan di Gate)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center">
                    <UserX className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">Kursi ini sedang kosong</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Pilih salah satu prajurit di bawah untuk menetapkan kursi</p>
                  </div>
                )}
              </div>

              {/* Pilih / Ganti Peserta Form */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  {selectedSeat.guest_id ? 'Tukar / Ganti Peserta Kursi Ini:' : 'Tetapkan Peserta ke Kursi Ini:'}
                </span>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, NRP, pangkat, atau satuan prajurit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400 shadow-2xs"
                  />
                </div>

                <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-1.5 bg-slate-50/40">
                  {filteredGuests.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      Tidak ada prajurit yang cocok atau seluruh peserta telah memiliki kursi.
                    </div>
                  ) : (
                    filteredGuests.map(g => {
                      const isTarget = selectedGuestId === g.id;
                      const gSpec = getMatraColor(g.matra || g.kategori_instansi);

                      return (
                        <div
                          key={g.id}
                          onClick={() => setSelectedGuestId(g.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isTarget
                              ? 'bg-blue-50/90 border-blue-500 shadow-xs'
                              : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: gSpec.hex }}
                            >
                              {g.nama.charAt(0)}
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 truncate block">
                                {g.nama}
                              </span>
                              <span className="text-[11px] text-slate-500 truncate block">
                                {g.pangkat} &bull; {g.satuan || g.satker || '-'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs"
                              style={{ backgroundColor: gSpec.hex }}
                            >
                              {g.matra || 'TNI'}
                            </span>
                            {isTarget && (
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              {selectedSeat.guest_id ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuickClear}
                  disabled={isSaving}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs gap-1.5"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Kosongkan Kursi Ini</span>
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="text-xs text-slate-600"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAssignment}
                  disabled={isSaving || selectedGuestId === selectedSeat.guest_id}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Penempatan'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
