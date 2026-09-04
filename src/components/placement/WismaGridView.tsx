'use client';

import React, { useState } from 'react';
import { AccommodationRoom, Guest } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Bed, UserPlus, UserX, Building2, Check } from 'lucide-react';

interface WismaGridViewProps {
  rooms: AccommodationRoom[];
  guests: Guest[];
  onAssignRoom: (roomId: string, slot: 'A' | 'B', guestId: string | null) => void;
}

export const WismaGridView: React.FC<WismaGridViewProps> = ({ rooms, guests, onAssignRoom }) => {
  const [selectedWisma, setSelectedWisma] = useState('Wisma Soedirman (VVIP)');
  const [assignModal, setAssignModal] = useState<{ roomId: string; slot: 'A' | 'B'; currentGuestId?: string } | null>(null);
  const [targetGuestId, setTargetGuestId] = useState('');

  const wismaNames = Array.from(new Set(rooms.map(r => r.wisma_name)));
  const currentRooms = rooms.filter(r => r.wisma_name === selectedWisma);

  // Guests who need accommodation and don't have room assigned yet
  const unassignedGuests = guests.filter(g => g.butuh_akomodasi === 1 && !g.room_id);

  const openAssign = (roomId: string, slot: 'A' | 'B', currentGuestId?: string) => {
    setAssignModal({ roomId, slot, currentGuestId });
    setTargetGuestId(currentGuestId || '');
  };

  const handleSave = () => {
    if (!assignModal) return;
    onAssignRoom(assignModal.roomId, assignModal.slot, targetGuestId || null);
    setAssignModal(null);
  };

  const handleClear = () => {
    if (!assignModal) return;
    onAssignRoom(assignModal.roomId, assignModal.slot, null);
    setAssignModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Wisma Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#1E3B2F] pb-3">
        {wismaNames.map(name => {
          const isSelected = selectedWisma === name;
          const count = rooms.filter(r => r.wisma_name === name).length;

          return (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedWisma(name)}
              className={`px-4 py-2.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#143B2A] text-[#F5E296] border border-[#D4AF37] shadow-lg shadow-black/40'
                  : 'bg-[#0A1711] text-slate-300 border border-[#173325] hover:border-slate-500'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
              <span>{name}</span>
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-black/40 text-slate-400">
                {count} Kamar
              </span>
            </button>
          );
        })}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentRooms.map(room => {
          const slotAFilled = !!room.slot_a_guest_id;
          const slotBFilled = !!room.slot_b_guest_id;
          const isFull = room.capacity === 1 ? slotAFilled : slotAFilled && slotBFilled;
          const isEmpty = !slotAFilled && !slotBFilled;

          return (
            <div
              key={room.id}
              className={`rounded-xl border p-4 transition-all ${
                isFull
                  ? 'bg-[#0A1D15] border-emerald-700/60 shadow-md'
                  : isEmpty
                  ? 'bg-[#081510] border-[#163324]'
                  : 'bg-[#0C2219] border-amber-600/60 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#1A382A] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-serif font-bold text-slate-100">
                    Kamar {room.room_number}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Lantai {room.floor}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isFull
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                    : isEmpty
                    ? 'bg-slate-900 text-slate-400 border border-slate-700'
                    : 'bg-amber-950 text-amber-300 border border-amber-600'
                }`}>
                  {isFull ? 'Penuh' : isEmpty ? 'Kosong' : '1 Terisi'}
                </span>
              </div>

              {room.notes && (
                <p className="text-[10px] text-[#D4AF37] mb-3 italic">
                  {room.notes}
                </p>
              )}

              {/* Slots A & B */}
              <div className="space-y-2">
                {/* Slot A */}
                <div className="p-2 rounded-lg bg-[#07110C] border border-[#173022] flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[9px] font-bold text-[#D4AF37] uppercase block">
                      BED A
                    </span>
                    {room.slot_a_guest_name ? (
                      <div className="truncate">
                        <span className="font-semibold text-slate-100 truncate block">
                          {room.slot_a_guest_name}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {room.slot_a_guest_rank}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Slot Kosong</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAssign(room.id, 'A', room.slot_a_guest_id)}
                    className="text-xs p-1.5 h-auto text-slate-400 hover:text-[#F5E296]"
                  >
                    {room.slot_a_guest_id ? 'Ubah' : <UserPlus className="w-3.5 h-3.5" />}
                  </Button>
                </div>

                {/* Slot B (if capacity > 1) */}
                {room.capacity > 1 && (
                  <div className="p-2 rounded-lg bg-[#07110C] border border-[#173022] flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="text-[9px] font-bold text-cyan-400 uppercase block">
                        BED B
                      </span>
                      {room.slot_b_guest_name ? (
                        <div className="truncate">
                          <span className="font-semibold text-slate-100 truncate block">
                            {room.slot_b_guest_name}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {room.slot_b_guest_rank}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Slot Kosong</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAssign(room.id, 'B', room.slot_b_guest_id)}
                      className="text-xs p-1.5 h-auto text-slate-400 hover:text-cyan-300"
                    >
                      {room.slot_b_guest_id ? 'Ubah' : <UserPlus className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Room Modal Drawer */}
      {assignModal && (
        <div className="p-5 rounded-xl bg-[#0F261C] border-2 border-[#D4AF37]/70 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center justify-between border-b border-[#1E4333] pb-3">
            <div>
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                PENETAPAN PENGINAPAN WISMA
              </span>
              <h4 className="text-base font-serif font-bold text-slate-100">
                Alokasi Kamar: Bed {assignModal.slot}
              </h4>
            </div>
            <button
              onClick={() => setAssignModal(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Pilih Tamu yang Memerlukan Akomodasi:
              </label>
              <select
                value={targetGuestId}
                onChange={(e) => setTargetGuestId(e.target.value)}
                className="w-full rounded-lg bg-[#070E0B] text-slate-100 border border-[#1E3B2F] text-xs p-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="">-- Kosongkan Slot Bed Ini --</option>
                {/* Current occupant */}
                {assignModal.currentGuestId && (
                  <option value={assignModal.currentGuestId}>
                    (Penghuni Saat Ini)
                  </option>
                )}
                {unassignedGuests.map(g => (
                  <option key={g.id} value={g.id}>
                    [{g.matra}] {g.pangkat} {g.nama} ({g.satker}) - Inap: {g.tgl_checkin} s/d {g.tgl_checkout}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4 flex gap-2">
              <Button
                variant="gold"
                size="md"
                onClick={handleSave}
                className="flex-1 text-xs font-bold"
              >
                <span>Simpan Kamar</span>
              </Button>
              {assignModal.currentGuestId && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleClear}
                  className="text-xs text-red-400 border border-red-800/60 hover:bg-red-950/40"
                >
                  <UserX className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

