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
  ChevronDown
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

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

  // Visual styling for seat buttons in grid
  const getSeatVisualClasses = (seat: Seat, isSelected: boolean) => {
    const isAssigned = !!seat.guest_id || seat.status === 'ASSIGNED' || seat.status === 'HADIR';

    if (!isAssigned) {
      if (isSelected) {
        return 'bg-blue-50 text-blue-800 border-2 border-blue-500 ring-2 ring-blue-500/30 shadow-md scale-102 z-10';
      }
      return 'bg-[#F8FAFC] text-slate-500 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/80';
    }

    let alias: WarnaKursiAlias | undefined =
      (seat.colorAlias as WarnaKursiAlias) || (seat.warna as WarnaKursiAlias);
    if (!alias && (seat.kategori_instansi || seat.guest_matra)) {
      alias = getMatraColor(seat.kategori_instansi || seat.guest_matra).alias;
    }

    let base = '';
    switch (alias) {
      case 'green':
        base = 'bg-[#1F7A3E] text-white border border-[#176131] hover:bg-[#196533]';
        break;
      case 'blue':
        base = 'bg-[#2563EB] text-white border border-[#1d4ed8] hover:bg-[#1d4ed8]';
        break;
      case 'gray':
        base = 'bg-[#64748B] text-white border border-[#475569] hover:bg-[#525e6f]';
        break;
      case 'white':
        base = 'bg-white text-slate-900 border border-slate-300 shadow-xs hover:bg-slate-50';
        break;
      default:
        base = 'bg-[#2563EB] text-white border border-[#1d4ed8] hover:bg-[#1d4ed8]';
    }

    if (isSelected) {
      return `${base} ring-2 ring-amber-400 ring-offset-2 scale-102 shadow-lg z-10`;
    }

    return base;
  };

  // Matra definition for the opened modal
  const modalMatraDef = selectedSeat
    ? getMatraColor(
        selectedSeat.colorAlias ||
        selectedSeat.warna ||
        selectedSeat.kategori_instansi ||
        selectedSeat.guest_matra ||
        displayedGuest?.kategori_instansi ||
        displayedGuest?.matra
      )
    : null;

  return (
    <div className="w-full space-y-6">
      {/* Group Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {groups.map(grp => {
          const isSelected = selectedGroupCode === grp.code;
          const grpSeats = seats.filter(s => s.group_code === grp.code);
          const occupied = grpSeats.filter(s => !!s.guest_id || s.status === 'ASSIGNED' || s.status === 'HADIR').length;

          return (
            <button
              key={grp.code}
              type="button"
              onClick={() => { setSelectedGroupCode(grp.code); setSelectedSeat(null); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer select-none ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {grp.code}
              </span>
              <span>{grp.name}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {occupied}/{grp.capacity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Matra Color Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-700 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#1F7A3E] border border-[#176131] shadow-2xs" />
            <span className="font-medium">TNI AD</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#2563EB] border border-[#1d4ed8] shadow-2xs" />
            <span className="font-medium">TNI AU</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#64748B] border border-[#475569] shadow-2xs" />
            <span className="font-medium">TNI AL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-white border border-slate-300 shadow-2xs" />
            <span className="font-medium">Kementerian / Sipil</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-[#F8FAFC] border border-slate-200 shadow-2xs" />
            <span className="text-slate-500">Belum Dialokasikan</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
          <span className="font-semibold text-emerald-700">Hadir di Lokasi</span>
        </div>
      </div>

      {/* Full-Width Seating Stage & Spacious Grid */}
      <div className="p-4 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        {/* Stage Indicator (Podium Utama) */}
        <div className="w-full py-3 bg-gradient-to-b from-slate-100 to-slate-200/60 rounded-xl border border-slate-200/90 text-center text-xs font-bold text-slate-700 tracking-wider uppercase shadow-2xs flex items-center justify-center gap-2">
          <span>&uarr;</span>
          <span>MIMBAR UTAMA / PODIUM PIMPINAN SIDANG RAPIM TNI 2026</span>
          <span>&uarr;</span>
        </div>

        {/* Responsive Seating Canvas with Smooth Scroll */}
        <div className="overflow-x-auto pb-4 pt-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          <div className="min-w-[720px] md:min-w-[880px] lg:min-w-0 w-full flex justify-center">
            <div className="grid grid-cols-8 gap-2.5 sm:gap-3">
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
                    className={`w-[80px] h-[70px] sm:w-[100px] sm:h-[85px] lg:w-[110px] lg:h-[90px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative select-none hover:-translate-y-1 hover:shadow-md active:translate-y-0 text-left ${visualClass}`}
                    title={`Kursi ${seat.seat_number} - ${isAssigned ? (seat.guest_name || 'Terisi') : 'Kosong'}`}
                  >
                    {/* Top Row: Icon + Status Dot */}
                    <div className="w-full flex items-center justify-between">
                      <Armchair
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          isAssigned && (seat.colorAlias === 'white' || seat.warna === 'white')
                            ? 'text-slate-600'
                            : isAssigned
                            ? 'text-white/90'
                            : 'text-slate-400'
                        }`}
                      />

                      {/* Status Dot */}
                      {isPresent ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white shadow-xs"
                          title="Hadir di Lokasi"
                        />
                      ) : isAssigned ? (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            seat.colorAlias === 'white' ? 'bg-slate-400' : 'bg-white/70'
                          }`}
                        />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                    </div>

                    {/* Center: Seat Number */}
                    <div className="text-center">
                      <span className="font-mono font-bold text-xs sm:text-sm tracking-tight leading-none block">
                        {seat.seat_number}
                      </span>
                    </div>

                    {/* Bottom: Name or Status */}
                    <div className="w-full truncate text-center">
                      {isAssigned ? (
                        <span className="text-[10px] sm:text-[11px] truncate block font-medium opacity-90 leading-tight">
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

        <p className="text-[11px] text-slate-400 text-center sm:hidden">
          Geser ke samping untuk meninjau seluruh tata letak baris & kolom
        </p>
      </div>

      {/* Modal Popup Profesional (Center Screen, Fade+Scale, Blur Backdrop) */}
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
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs border ${
                  modalMatraDef?.alias === 'green'
                    ? 'bg-[#1F7A3E]/10 text-[#1F7A3E] border-[#1F7A3E]/20'
                    : modalMatraDef?.alias === 'blue'
                    ? 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20'
                    : modalMatraDef?.alias === 'gray'
                    ? 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
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
                    {selectedSeat.guest_status === 'HADIR' || selectedSeat.status === 'HADIR' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Hadir di Lokasi
                      </span>
                    ) : selectedSeat.guest_id ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Armchair className="w-3.5 h-3.5 text-blue-600" />
                        Sudah Ditetapkan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Belum Dialokasikan
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
                  {modalMatraDef && selectedSeat.guest_id && (
                    <span className={`px-2.5 py-1 rounded-lg text-xs border ${modalMatraDef.badgeClass}`}>
                      {modalMatraDef.label}
                    </span>
                  )}
                  {selectedSeat.guest_status === 'HADIR' || selectedSeat.status === 'HADIR' ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-300">
                      Hadir di Lokasi
                    </span>
                  ) : selectedSeat.guest_id ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100/80 text-blue-800 border border-blue-300">
                      Telah Terdaftar
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200/80 text-slate-700 border border-slate-300">
                      Belum Dialokasikan
                    </span>
                  )}
                </div>
              </div>

              {/* Data Peserta Card (Terpisah & Bersih) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Data Prajurit / Pejabat Penempati:
                </span>

                {displayedGuest ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar with Matra Color Accent */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-sm flex-shrink-0 ${
                        displayedGuest.kategori_instansi === 'ANGKATAN_DARAT' || displayedGuest.matra === 'AD'
                          ? 'bg-[#1F7A3E]'
                          : displayedGuest.kategori_instansi === 'ANGKATAN_UDARA' || displayedGuest.matra === 'AU'
                          ? 'bg-[#2563EB]'
                          : displayedGuest.kategori_instansi === 'ANGKATAN_LAUT' || displayedGuest.matra === 'AL'
                          ? 'bg-[#64748B]'
                          : 'bg-slate-700'
                      }`}>
                        {displayedGuest.nama
                          ? displayedGuest.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                          : <User className="w-6 h-6" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">
                            {displayedGuest.nama}
                          </h4>
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                            {displayedGuest.pangkat}
                          </span>
                        </div>

                        <p className="text-xs font-medium text-slate-600 mt-1 truncate">
                          {displayedGuest.jabatan || 'Pejabat TNI / Undangan'}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 truncate">
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                          <span>{displayedGuest.satker} {displayedGuest.satuan ? `(${displayedGuest.satuan})` : ''}</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Badges & Registration Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
                        <span className="text-[11px] text-slate-500 block">Kategori Instansi:</span>
                        <span className="font-semibold text-slate-800 block mt-0.5">
                          {displayedGuest.kategori_instansi
                            ? displayedGuest.kategori_instansi.replace(/_/g, ' ')
                            : displayedGuest.matra === 'NON_TNI'
                            ? 'Kementerian / Lembaga'
                            : `TNI ${displayedGuest.matra}`}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/70">
                        <span className="text-[11px] text-slate-500 block">Nomor Registrasi / NRP:</span>
                        <span className="font-mono font-semibold text-slate-800 block mt-0.5">
                          {displayedGuest.registration_id || 'REG-2026'} &bull; NRP: {displayedGuest.nrp || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty state card */
                  <div className="p-5 rounded-2xl bg-slate-50/80 border border-dashed border-slate-300 text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-slate-200/70 text-slate-500 flex items-center justify-center mx-auto">
                      <Armchair className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">Kursi Ini Belum Dialokasikan</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Gunakan form pencarian di bawah untuk memilih prajurit atau tamu yang akan menempati kursi ini.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Alokasi dengan Searchable Select */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label htmlFor="search_guest_input" className="text-xs font-bold text-slate-800">
                    Cari & Pilih Prajurit yang Dialokasikan:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {unseatedGuests.length} prajurit belum punya kursi
                  </span>
                </div>

                {/* Search Input Box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="search_guest_input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ketik nama, NRP, pangkat, atau satuan prajurit..."
                    disabled={isSaving}
                    className="w-full rounded-xl bg-white text-slate-900 border border-slate-200 pl-10 pr-9 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-xs transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Results List */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {/* Option: Kosongkan Kursi */}
                  <button
                    type="button"
                    onClick={() => setSelectedGuestId('')}
                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      !selectedGuestId ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserX className="w-3.5 h-3.5 text-slate-400" />
                      <span>-- Kosongkan Kursi Ini --</span>
                    </span>
                    {!selectedGuestId && <Check className="w-4 h-4 text-blue-600" />}
                  </button>

                  {/* Current Occupant option (if assigned) */}
                  {selectedSeat.guest_id && (
                    <button
                      type="button"
                      onClick={() => setSelectedGuestId(selectedSeat.guest_id || '')}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedGuestId === selectedSeat.guest_id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-800'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Saat Ini Menempati:</span>
                        <span className="font-semibold">{selectedSeat.guest_rank} {selectedSeat.guest_name}</span>
                      </div>
                      {selectedGuestId === selectedSeat.guest_id && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  )}

                  {/* Filtered Guests list */}
                  {filteredGuests.length > 0 ? (
                    filteredGuests.map(g => {
                      const isChosen = selectedGuestId === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setSelectedGuestId(g.id)}
                          className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                            isChosen ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-800'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                g.matra === 'AD' ? 'bg-emerald-100 text-emerald-800' :
                                g.matra === 'AU' ? 'bg-blue-100 text-blue-800' :
                                g.matra === 'AL' ? 'bg-slate-100 text-slate-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {g.matra}
                              </span>
                              <span className="font-semibold text-slate-900 truncate">
                                {g.pangkat} {g.nama}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                              NRP {g.nrp} &bull; {g.satker} ({g.satuan || '-'})
                            </span>
                          </div>
                          {isChosen && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Tidak ditemukan prajurit yang cocok dengan kata kunci &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer (Kiri: Kosongkan Kursi, Tengah: Batal, Kanan: Simpan Alokasi) */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/70 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                {selectedSeat.guest_id ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleQuickClear}
                    isLoading={isSaving}
                    disabled={isSaving}
                    className="w-full sm:w-auto text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 h-[42px] cursor-pointer"
                  >
                    <UserX className="w-4 h-4 mr-1.5" />
                    <span>Kosongkan Kursi</span>
                  </Button>
                ) : (
                  <div />
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none text-xs font-medium h-[42px] px-5 cursor-pointer"
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
                  disabled={isSaving}
                  className="flex-1 sm:flex-none text-xs font-semibold h-[42px] px-6 bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>Simpan Alokasi</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
