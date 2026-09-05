'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AccommodationRoom, Guest } from '@/types';
import { Button } from '@/components/ui/Button';
import {
  Hotel,
  DoorClosed,
  Bed,
  BedDouble,
  Layers,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  X,
  Check,
  UserX,
  UserPlus,
  ShieldCheck,
  Wifi,
  AirVent,
  Tv,
  Bath,
  Briefcase,
  Building2
} from 'lucide-react';

interface WismaGridViewProps {
  rooms: AccommodationRoom[];
  guests: Guest[];
  onAssignRoom: (roomId: string, slot: 'A' | 'B', guestId: string | null) => Promise<void> | void;
}

// Exact Matra styling adhering to military guidelines
const getInstansiStyle = (matra?: string, kategori?: string) => {
  const m = matra?.toUpperCase();
  const k = kategori?.toUpperCase();

  if (m === 'AD' || k === 'ANGKATAN_DARAT') {
    return {
      bgHex: '#1F7A3E',
      badgeClass: 'bg-[#1F7A3E]/10 text-[#1F7A3E] border-[#1F7A3E]/30',
      avatarBg: 'bg-[#1F7A3E]',
      label: 'TNI AD'
    };
  }
  if (m === 'AU' || k === 'ANGKATAN_UDARA') {
    return {
      bgHex: '#2563EB',
      badgeClass: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30',
      avatarBg: 'bg-[#2563EB]',
      label: 'TNI AU'
    };
  }
  if (m === 'AL' || k === 'ANGKATAN_LAUT') {
    return {
      bgHex: '#475569',
      badgeClass: 'bg-[#475569]/10 text-[#475569] border-[#475569]/30',
      avatarBg: 'bg-[#475569]',
      label: 'TNI AL'
    };
  }
  return {
    bgHex: '#FFFFFF',
    badgeClass: 'bg-white text-slate-800 border-[#D1D5DB] shadow-2xs',
    avatarBg: 'bg-slate-700',
    label: 'Kementerian / Lembaga'
  };
};

export const WismaGridView: React.FC<WismaGridViewProps> = ({ rooms, guests, onAssignRoom }) => {
  const wismaNames = useMemo(() => Array.from(new Set(rooms.map(r => r.wisma_name))), [rooms]);
  const [selectedWisma, setSelectedWisma] = useState(wismaNames[0] || 'Wisma Soedirman (VVIP)');

  // Modal State
  const [activeModalRoom, setActiveModalRoom] = useState<AccommodationRoom | null>(null);
  const [targetSlot, setTargetSlot] = useState<'A' | 'B'>('A');
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync selected wisma if initial list updates
  useEffect(() => {
    if (wismaNames.length > 0 && !wismaNames.includes(selectedWisma)) {
      setSelectedWisma(wismaNames[0]);
    }
  }, [wismaNames, selectedWisma]);

  // Rooms in current selected wisma
  const currentRooms = useMemo(() => {
    return rooms.filter(r => r.wisma_name === selectedWisma);
  }, [rooms, selectedWisma]);

  // Guests who need accommodation
  const guestsNeedingAccommodation = useMemo(() => {
    return guests.filter(g => g.butuh_akomodasi === 1);
  }, [guests]);

  // Unassigned guests needing accommodation
  const unassignedGuests = useMemo(() => {
    return guestsNeedingAccommodation.filter(g => !g.room_id);
  }, [guestsNeedingAccommodation]);

  // Overall Statistics across all rooms & guests
  const stats = useMemo(() => {
    let totalRooms = rooms.length;
    let fullRooms = 0;
    let partialRooms = 0;
    let emptyRooms = 0;

    rooms.forEach(r => {
      const aFilled = !!r.slot_a_guest_id;
      const bFilled = !!r.slot_b_guest_id;
      const isFull = r.capacity === 1 ? aFilled : aFilled && bFilled;
      const isEmpty = !aFilled && !bFilled;

      if (isFull) fullRooms++;
      else if (isEmpty) emptyRooms++;
      else partialRooms++;
    });

    return {
      totalRooms,
      occupiedRooms: fullRooms + partialRooms,
      fullRooms,
      partialRooms,
      emptyRooms,
      totalGuestsNeeding: guestsNeedingAccommodation.length,
      unassignedGuestsCount: unassignedGuests.length
    };
  }, [rooms, guestsNeedingAccommodation, unassignedGuests]);

  // Open Room Modal
  const handleOpenRoomModal = (room: AccommodationRoom, initialSlot: 'A' | 'B' = 'A') => {
    setActiveModalRoom(room);
    setTargetSlot(initialSlot);
    const curId = initialSlot === 'A' ? room.slot_a_guest_id : room.slot_b_guest_id;
    setSelectedGuestId(curId || '');
    setSearchQuery('');
  };

  // Close Modal
  const handleCloseModal = () => {
    if (!isSubmitting) {
      setActiveModalRoom(null);
      setSelectedGuestId('');
      setSearchQuery('');
    }
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalRoom && !isSubmitting) {
        handleCloseModal();
      }
    };
    if (activeModalRoom) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModalRoom, isSubmitting]);

  // Update target slot in modal
  const handleChangeTargetSlot = (slot: 'A' | 'B') => {
    if (!activeModalRoom) return;
    setTargetSlot(slot);
    const curId = slot === 'A' ? activeModalRoom.slot_a_guest_id : activeModalRoom.slot_b_guest_id;
    setSelectedGuestId(curId || '');
  };

  // Save Assignment
  const handleSaveAssignment = async () => {
    if (!activeModalRoom) return;
    setIsSubmitting(true);
    try {
      await onAssignRoom(activeModalRoom.id, targetSlot, selectedGuestId || null);
      setActiveModalRoom(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear Slot
  const handleClearSlot = async (slotToClear?: 'A' | 'B') => {
    if (!activeModalRoom) return;
    const slot = slotToClear || targetSlot;
    setIsSubmitting(true);
    try {
      await onAssignRoom(activeModalRoom.id, slot, null);
      setActiveModalRoom(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered guests for search list
  const filteredGuests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return unassignedGuests;
    return unassignedGuests.filter(g =>
      (g.nama && g.nama.toLowerCase().includes(q)) ||
      (g.nrp && g.nrp.toLowerCase().includes(q)) ||
      (g.pangkat && g.pangkat.toLowerCase().includes(q)) ||
      (g.satker && g.satker.toLowerCase().includes(q)) ||
      (g.satuan && g.satuan.toLowerCase().includes(q)) ||
      (g.jabatan && g.jabatan.toLowerCase().includes(q))
    );
  }, [unassignedGuests, searchQuery]);

  // Current occupant for the active slot
  const currentSlotOccupantId = activeModalRoom
    ? (targetSlot === 'A' ? activeModalRoom.slot_a_guest_id : activeModalRoom.slot_b_guest_id)
    : undefined;

  const currentSlotOccupant = useMemo(() => {
    if (!currentSlotOccupantId) return null;
    return guests.find(g => g.id === currentSlotOccupantId) || null;
  }, [guests, currentSlotOccupantId]);

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Summary Cards (Statistik Cepat di Atas Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Kamar */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Hotel className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Kamar</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-none mt-1">
              {stats.totalRooms}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">{wismaNames.length} Gedung Wisma</span>
          </div>
        </div>

        {/* Kamar Terisi */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Kamar Terisi</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 leading-none mt-1">
              {stats.occupiedRooms}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">{stats.fullRooms} Penuh &bull; {stats.partialRooms} Parsial</span>
          </div>
        </div>

        {/* Kamar Kosong */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Kamar Kosong</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 leading-none mt-1">
              {stats.emptyRooms}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Siap Ditempati</span>
          </div>
        </div>

        {/* Total Tamu Butuh Wisma */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Tamu Butuh Wisma</span>
            <div className="text-xl sm:text-2xl font-bold text-indigo-900 leading-none mt-1">
              {stats.totalGuestsNeeding}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Prajurit & Delegasi</span>
          </div>
        </div>

        {/* Belum Dialokasikan */}
        <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-xl bg-white border border-amber-200/80 bg-amber-50/20 shadow-2xs hover:shadow-md transition-all duration-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">Belum Dialokasi</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-700 leading-none mt-1">
              {stats.unassignedGuestsCount}
            </div>
            <span className="text-[10px] text-amber-700/80 block mt-0.5">Menunggu Kamar</span>
          </div>
        </div>
      </div>

      {/* 2. Wisma Building Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {wismaNames.map(name => {
            const isSelected = selectedWisma === name;
            const count = rooms.filter(r => r.wisma_name === name).length;

            return (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedWisma(name)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Building2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{name}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count} Kamar
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <span className="font-bold text-slate-800">{currentRooms.length} kamar</span> di {selectedWisma}
        </div>
      </div>

      {/* 3. Room Grid (Tablet: 2 kolom, Mobile: 1 kolom, Desktop: 3 kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {currentRooms.map(room => {
          const slotAFilled = !!room.slot_a_guest_id;
          const slotBFilled = !!room.slot_b_guest_id;
          const isFull = room.capacity === 1 ? slotAFilled : slotAFilled && slotBFilled;
          const isEmpty = !slotAFilled && !slotBFilled;
          const isPartial = !isFull && !isEmpty;

          const guestA = slotAFilled ? guests.find(g => g.id === room.slot_a_guest_id) : null;
          const guestB = slotBFilled ? guests.find(g => g.id === room.slot_b_guest_id) : null;

          const styleA = guestA ? getInstansiStyle(guestA.matra, guestA.kategori_instansi) : null;
          const styleB = guestB ? getInstansiStyle(guestB.matra, guestB.kategori_instansi) : null;

          return (
            <div
              key={room.id}
              className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                isFull
                  ? 'border-emerald-200/90 hover:border-emerald-400'
                  : isPartial
                  ? 'border-blue-200/90 hover:border-blue-400'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Kartu Kamar */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-3.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isFull
                        ? 'bg-emerald-50 text-emerald-700'
                        : isPartial
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      <DoorClosed className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
                        Kamar {room.room_number}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70">
                          <Layers className="w-3 h-3 text-slate-500" />
                          Lantai {room.floor}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          &bull; {room.capacity === 1 ? 'Single Bed (VIP)' : 'Twin Bed (2 Slot)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Kamar Badge */}
                  <div>
                    {isFull ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        Penuh
                      </span>
                    ) : isPartial ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        1 Terisi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Kosong
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes or Room Label */}
                {room.notes && (
                  <p className="text-[11px] text-slate-500 mb-3 bg-slate-50/70 px-2.5 py-1 rounded-lg border border-slate-100 italic truncate">
                    {room.notes}
                  </p>
                )}

                {/* Empty State Banner (Jika kamar kosong total) */}
                {isEmpty && (
                  <div
                    onClick={() => handleOpenRoomModal(room, 'A')}
                    className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer text-center mb-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 flex items-center justify-center mx-auto transition-colors">
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-2">Tidak Ada Penghuni</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Kamar siap dialokasikan untuk prajurit/tamu VIP</p>
                  </div>
                )}

                {/* 2. Bed Cards (Mini-Card with shadow lift & border glow) */}
                <div className="space-y-2.5">
                  {/* Bed A Mini-Card */}
                  <div
                    onClick={() => handleOpenRoomModal(room, 'A')}
                    className={`rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                      slotAFilled
                        ? 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 hover:ring-1 hover:ring-blue-100'
                        : 'border-dashed border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-blue-600" />
                        BED A {room.capacity === 1 && '(VIP Utama)'}
                      </span>
                      {slotAFilled && styleA && (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${styleA.badgeClass}`}>
                          {styleA.label}
                        </span>
                      )}
                    </div>

                    {slotAFilled && guestA ? (
                      <div className="flex items-center gap-2.5 mt-2">
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center flex-shrink-0 ${styleA?.avatarBg || 'bg-slate-700'}`}>
                          {guestA.nama ? guestA.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'A'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {guestA.nama}
                            </span>
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                              {guestA.pangkat}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                            {guestA.jabatan || guestA.satker} {guestA.satuan ? `(${guestA.satuan})` : ''}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-1 text-slate-400 text-xs">
                        <span className="text-[11px] italic">Slot Kosong</span>
                        <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5" />
                          Alokasikan
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bed B Mini-Card (Jika Kapasitas > 1) */}
                  {room.capacity > 1 && (
                    <div
                      onClick={() => handleOpenRoomModal(room, 'B')}
                      className={`rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                        slotBFilled
                          ? 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 hover:ring-1 hover:ring-blue-100'
                          : 'border-dashed border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-700 flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-indigo-600" />
                          BED B
                        </span>
                        {slotBFilled && styleB && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${styleB.badgeClass}`}>
                            {styleB.label}
                          </span>
                        )}
                      </div>

                      {slotBFilled && guestB ? (
                        <div className="flex items-center gap-2.5 mt-2">
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center flex-shrink-0 ${styleB?.avatarBg || 'bg-slate-700'}`}>
                            {guestB.nama ? guestB.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'B'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {guestB.nama}
                              </span>
                              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                                {guestB.pangkat}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                              {guestB.jabatan || guestB.satker} {guestB.satuan ? `(${guestB.satuan})` : ''}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between py-1 text-slate-400 text-xs">
                          <span className="text-[11px] italic">Slot Kosong</span>
                          <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                            <UserPlus className="w-3.5 h-3.5" />
                            Alokasikan
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {room.capacity === 1
                    ? (slotAFilled ? '1/1 Terisi' : '0/1 Kosong')
                    : `${(slotAFilled ? 1 : 0) + (slotBFilled ? 1 : 0)}/2 Terisi`}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenRoomModal(room, 'A')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-blue-50"
                >
                  Kelola Alokasi &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. MODAL DETAIL KAMAR (2-Kolom Desktop/Tablet, Bottom-Sheet Mobile) */}
      {activeModalRoom && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:w-[92%] sm:max-w-[880px] bg-white rounded-t-[24px] sm:rounded-[20px] shadow-2xl border border-slate-200/80 flex flex-col max-h-[88vh] sm:max-h-[80vh] overflow-hidden animate-sheet-slide sm:animate-modal-scale"
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-slate-50 border-b border-slate-100">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Hotel className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {activeModalRoom.wisma_name} &bull; Kamar {activeModalRoom.room_number}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700">
                      Lantai {activeModalRoom.floor}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Kapasitas: {activeModalRoom.capacity} Bed &bull; Sistem Reservasi Wisma Resmi RAPIM TNI 2026
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Kolom Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-0 flex-1 overflow-hidden">
              {/* Kolom Kiri: Informasi Kamar, Fasilitas, & Status (md:col-span-5) */}
              <div className="md:col-span-5 bg-slate-50/70 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-slate-200/80 overflow-y-auto space-y-4">
                {/* Informasi Kamar */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Informasi & Ketentuan Kamar
                  </h5>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nomor Kamar:</span>
                      <span className="font-bold text-slate-800">Kamar {activeModalRoom.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Posisi Lantai:</span>
                      <span className="font-semibold text-slate-800">Lantai {activeModalRoom.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tipe Akomodasi:</span>
                      <span className="font-semibold text-slate-800">
                        {activeModalRoom.capacity === 1 ? 'Single Room (VIP)' : 'Twin Room (2 Slot)'}
                      </span>
                    </div>
                    {activeModalRoom.notes && (
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-slate-500 block text-[11px]">Catatan Khusus:</span>
                        <span className="font-medium text-slate-700 italic block mt-0.5">{activeModalRoom.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fasilitas Kamar VIP Militer Modern */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Fasilitas Kamar VIP
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center gap-2">
                      <AirVent className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium text-[11px]">AC Silent Daikin</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium text-[11px]">Smart TV Satelit</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium text-[11px]">Wi-Fi 6 Dedicated</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium text-[11px]">Meja Kerja Kedinasan</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center gap-2">
                      <Bath className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium text-[11px]">Water Heater & Shower</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium text-[11px]">Kunci Keamanan VIP</span>
                    </div>
                  </div>
                </div>

                {/* Status Penghuni Kamar Saat Ini */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Penghuni Kamar Saat Ini
                  </h5>
                  <div className="space-y-2 text-xs">
                    {/* Slot A Occupant */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>BED A:</span>
                        {activeModalRoom.slot_a_guest_id ? (
                          <button
                            type="button"
                            onClick={() => handleClearSlot('A')}
                            disabled={isSubmitting}
                            className="text-rose-600 hover:text-rose-700 cursor-pointer font-semibold"
                          >
                            Kosongkan Bed A
                          </button>
                        ) : (
                          <span className="text-slate-400 font-normal italic">Kosong</span>
                        )}
                      </div>
                      {activeModalRoom.slot_a_guest_name ? (
                        <div className="font-semibold text-slate-900">
                          {activeModalRoom.slot_a_guest_rank} {activeModalRoom.slot_a_guest_name}
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px]">Belum dialokasikan</div>
                      )}
                    </div>

                    {/* Slot B Occupant (if capacity > 1) */}
                    {activeModalRoom.capacity > 1 && (
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span>BED B:</span>
                          {activeModalRoom.slot_b_guest_id ? (
                            <button
                              type="button"
                              onClick={() => handleClearSlot('B')}
                              disabled={isSubmitting}
                              className="text-rose-600 hover:text-rose-700 cursor-pointer font-semibold"
                            >
                              Kosongkan Bed B
                            </button>
                          ) : (
                            <span className="text-slate-400 font-normal italic">Kosong</span>
                          )}
                        </div>
                        {activeModalRoom.slot_b_guest_name ? (
                          <div className="font-semibold text-slate-900">
                            {activeModalRoom.slot_b_guest_rank} {activeModalRoom.slot_b_guest_name}
                          </div>
                        ) : (
                          <div className="text-slate-400 italic text-[11px]">Belum dialokasikan</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Search & Assignment (Discord / Slack Member Selector Style) (md:col-span-7) */}
              <div className="md:col-span-7 p-4 sm:p-5 flex flex-col min-h-0 overflow-hidden space-y-3.5">
                {/* 1. Target Bed Slot Selector (Bed A vs Bed B) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Pilih Target Slot Bed yang Dialokasikan:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChangeTargetSlot('A')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        targetSlot === 'A'
                          ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                      }`}
                    >
                      <Bed className="w-4 h-4" />
                      <span>Bed A {activeModalRoom.capacity === 1 && '(VIP)'}</span>
                      {activeModalRoom.slot_a_guest_id && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${targetSlot === 'A' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          Terisi
                        </span>
                      )}
                    </button>

                    {activeModalRoom.capacity > 1 && (
                      <button
                        type="button"
                        onClick={() => handleChangeTargetSlot('B')}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          targetSlot === 'B'
                            ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/20'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                        }`}
                      >
                        <Bed className="w-4 h-4" />
                        <span>Bed B</span>
                        {activeModalRoom.slot_b_guest_id && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${targetSlot === 'B' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'}`}>
                            Terisi
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Real-time Search Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="search_wisma_guest" className="text-xs font-bold text-slate-700">
                      Cari Tamu & Prajurit yang Butuh Akomodasi:
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {unassignedGuests.length} prajurit belum punya kamar
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="search_wisma_guest"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama, NRP, pangkat, atau satuan..."
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-slate-50/70 text-slate-900 border border-slate-200 pl-10 pr-9 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
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
                </div>

                {/* 3. Member Selector List (Discord/Slack Style) */}
                <div className="flex-1 overflow-y-auto space-y-1.5 min-h-[180px] max-h-[260px] sm:max-h-[300px] pr-1 border border-slate-200/80 rounded-xl p-2 bg-slate-50/40 divide-y divide-slate-100">
                  {/* Option: Kosongkan Slot */}
                  <div
                    onClick={() => setSelectedGuestId('')}
                    className={`p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                      !selectedGuestId
                        ? 'bg-blue-50/90 text-blue-800 font-semibold border border-blue-200'
                        : 'hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <UserX className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold block">-- Kosongkan Slot Bed Ini --</span>
                        <span className="text-[10px] text-slate-400">Tidak menempatkan prajurit manapun</span>
                      </div>
                    </div>
                    {!selectedGuestId && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                  </div>

                  {/* Option: Current Occupant (if exists and not already unassigned) */}
                  {currentSlotOccupant && (
                    <div
                      onClick={() => setSelectedGuestId(currentSlotOccupant.id)}
                      className={`p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                        selectedGuestId === currentSlotOccupant.id
                          ? 'bg-blue-50/90 text-blue-800 font-semibold border border-blue-200'
                          : 'hover:bg-white text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                          getInstansiStyle(currentSlotOccupant.matra, currentSlotOccupant.kategori_instansi).avatarBg
                        }`}>
                          {currentSlotOccupant.nama ? currentSlotOccupant.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'P'}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-blue-600 uppercase block tracking-wider">
                            Penghuni Saat Ini:
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 truncate">{currentSlotOccupant.nama}</span>
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                              {currentSlotOccupant.pangkat}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate">
                            NRP {currentSlotOccupant.nrp} &bull; {currentSlotOccupant.satker}
                          </span>
                        </div>
                      </div>
                      {selectedGuestId === currentSlotOccupant.id && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                    </div>
                  )}

                  {/* Filtered unassigned guests */}
                  {filteredGuests.length > 0 ? (
                    filteredGuests.map(g => {
                      const isSelected = selectedGuestId === g.id;
                      const instStyle = getInstansiStyle(g.matra, g.kategori_instansi);

                      return (
                        <div
                          key={g.id}
                          onClick={() => setSelectedGuestId(g.id)}
                          className={`p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-50/90 text-blue-900 font-semibold border border-blue-200 shadow-2xs'
                              : 'hover:bg-white hover:shadow-2xs text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full text-white font-bold text-xs flex items-center justify-center flex-shrink-0 ${instStyle.avatarBg}`}>
                              {g.nama ? g.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'T'}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${instStyle.badgeClass}`}>
                                  {instStyle.label}
                                </span>
                                <span className="font-bold text-slate-900 truncate">
                                  {g.nama}
                                </span>
                                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                                  {g.pangkat}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                {g.jabatan || 'Prajurit Tamu'} &bull; {g.satker} {g.satuan ? `(${g.satuan})` : ''}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Inap: {g.tgl_checkin || 'RAPIM'} s/d {g.tgl_checkout || 'Selesai'} &bull; NRP: {g.nrp || '-'}
                              </div>
                            </div>
                          </div>

                          {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      {searchQuery ? (
                        <>Tidak ada prajurit yang cocok dengan kata kunci &quot;{searchQuery}&quot;</>
                      ) : (
                        <>Seluruh prajurit yang membutuhkan akomodasi telah memiliki kamar.</>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/90 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div>
                {currentSlotOccupantId ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => handleClearSlot()}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 h-[40px] cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5 mr-1.5" />
                    <span>Kosongkan Slot Ini</span>
                  </Button>
                ) : (
                  <div />
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none text-xs font-medium h-[40px] px-4 cursor-pointer"
                >
                  Batal
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSaveAssignment}
                  isLoading={isSubmitting}
                  loadingText="Menyimpan..."
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none text-xs font-semibold h-[40px] px-5 bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>Simpan Penempatan</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
