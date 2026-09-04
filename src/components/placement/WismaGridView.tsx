'use client';

import React, { useState } from 'react';
import { AccommodationRoom, Guest } from '@/types';
import { Button } from '@/components/ui/Button';
import { UserPlus, UserX, Building2 } from 'lucide-react';

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
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {wismaNames.map(name => {
          const isSelected = selectedWisma === name;
          const count = rooms.filter(r => r.wisma_name === name).length;

          return (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedWisma(name)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Building2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
              <span>{name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
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
              className={`rounded-xl border p-4 bg-white shadow-xs transition-all ${
                isFull
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : isEmpty
                  ? 'border-slate-200'
                  : 'border-blue-200 bg-blue-50/10'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    Kamar {room.room_number}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Lt. {room.floor}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isFull
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isEmpty
                    ? 'bg-slate-100 text-slate-600 border border-slate-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {isFull ? 'Penuh' : isEmpty ? 'Kosong' : '1 Terisi'}
                </span>
              </div>

              {room.notes && (
                <p className="text-[11px] text-slate-500 mb-3 italic">
                  {room.notes}
                </p>
              )}

              {/* Slots A & B */}
              <div className="space-y-2">
                {/* Slot A */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-semibold text-blue-600 uppercase block">
                      BED A
                    </span>
                    {room.slot_a_guest_name ? (
                      <div className="truncate mt-0.5">
                        <span className="font-medium text-slate-900 truncate block">
                          {room.slot_a_guest_name}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {room.slot_a_guest_rank}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Slot Kosong</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAssign(room.id, 'A', room.slot_a_guest_id)}
                    className="text-xs h-7 px-2 text-slate-600 hover:text-blue-600"
                  >
                    {room.slot_a_guest_id ? 'Ubah' : <UserPlus className="w-3.5 h-3.5" />}
                  </Button>
                </div>

                {/* Slot B (if capacity > 1) */}
                {room.capacity > 1 && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-semibold text-indigo-600 uppercase block">
                        BED B
                      </span>
                      {room.slot_b_guest_name ? (
                        <div className="truncate mt-0.5">
                          <span className="font-medium text-slate-900 truncate block">
                            {room.slot_b_guest_name}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {room.slot_b_guest_rank}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Slot Kosong</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAssign(room.id, 'B', room.slot_b_guest_id)}
                      className="text-xs h-7 px-2 text-slate-600 hover:text-indigo-600"
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
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                Alokasi Wisma Penginapan
              </span>
              <h4 className="text-sm font-semibold text-slate-900">
                Alokasi Kamar: Bed {assignModal.slot}
              </h4>
            </div>
            <button
              onClick={() => setAssignModal(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-8">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Pilih Tamu yang Memerlukan Akomodasi:
              </label>
              <select
                value={targetGuestId}
                onChange={(e) => setTargetGuestId(e.target.value)}
                className="w-full rounded-lg bg-white text-slate-900 border border-slate-200 text-xs h-[42px] px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="">-- Kosongkan Slot Bed Ini --</option>
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
                variant="primary"
                size="md"
                onClick={handleSave}
                className="flex-1 text-xs font-semibold h-[42px]"
              >
                <span>Simpan Kamar</span>
              </Button>
              {assignModal.currentGuestId && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleClear}
                  className="text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 h-[42px] px-3"
                  title="Kosongkan kamar"
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
