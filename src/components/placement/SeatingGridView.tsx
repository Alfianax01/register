'use client';

import React, { useState } from 'react';
import { SeatGroup, Seat, Guest } from '@/types';
import { Button } from '@/components/ui/Button';
import { Armchair, UserX } from 'lucide-react';

interface SeatingGridViewProps {
  groups: SeatGroup[];
  seats: Seat[];
  guests: Guest[];
  onAssignSeat: (seatNumber: string, guestId: string | null) => void;
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

  const groupSeats = seats.filter(s => s.group_code === selectedGroupCode);
  const unseatedGuests = guests.filter(g => !g.seat_number);

  const handleOpenSeat = (seat: Seat) => {
    setSelectedSeat(seat);
    setSelectedGuestId(seat.guest_id || '');
  };

  const handleSaveAssignment = () => {
    if (!selectedSeat) return;
    onAssignSeat(selectedSeat.seat_number, selectedGuestId || null);
    setSelectedSeat(null);
  };

  const handleClearSeat = () => {
    if (!selectedSeat) return;
    onAssignSeat(selectedSeat.seat_number, null);
    setSelectedSeat(null);
  };

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

      {/* Seating Stage Legend & Floor Layout */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-6">
        {/* Stage Indicator (Podium Utama) */}
        <div className="w-full py-2 bg-slate-100 rounded-lg border border-slate-200 text-center text-xs font-semibold text-slate-600 tracking-wider uppercase">
          &uarr; Mimbar Utama / Podium Pimpinan Sidang &uarr;
        </div>

        {/* Seat Grid Visual */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {groupSeats.map(seat => {
            const isAssigned = !!seat.guest_id;
            const isPresent = seat.guest_status === 'HADIR';
            const isSelected = selectedSeat?.id === seat.id;

            return (
              <button
                key={seat.id}
                type="button"
                onClick={() => handleOpenSeat(seat)}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center min-h-[70px] transition-all relative ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/50 scale-102 z-10'
                    : isPresent
                    ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
                    : isAssigned
                    ? 'border-blue-200 bg-blue-50/70 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <Armchair className={`w-4 h-4 mb-1 ${
                  isPresent ? 'text-emerald-600' : isAssigned ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <span className="font-mono font-bold text-xs">{seat.seat_number}</span>

                {isAssigned && (
                  <span className="text-[10px] truncate max-w-full block px-1 text-slate-600 mt-0.5">
                    {seat.guest_name?.split(' ')[0]}
                  </span>
                )}

                {/* Status Dot */}
                <span
                  className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                    isPresent ? 'bg-emerald-500' : isAssigned ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Hadir di Lokasi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Sudah Ditetapkan (Assigned)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span>Kursi Kosong</span>
          </div>
        </div>
      </div>

      {/* Seat Inspector / Assign Dialog Drawer */}
      {selectedSeat && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                Alokasi Tempat Duduk
              </span>
              <h4 className="text-sm font-semibold text-slate-900">
                Kursi {selectedSeat.seat_number} (Grup {selectedSeat.group_code})
              </h4>
            </div>
            <span className="text-xs text-slate-500">
              Baris {selectedSeat.row_num} &bull; Kolom {selectedSeat.col_num}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-8">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Pilih Prajurit / Tamu yang Dialokasikan:
              </label>
              <select
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                className="w-full rounded-lg bg-white text-slate-900 border border-slate-200 text-xs h-[42px] px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
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
            </div>

            <div className="sm:col-span-4 flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveAssignment}
                className="flex-1 text-xs font-semibold h-[42px]"
              >
                <span>Simpan Kursi</span>
              </Button>
              {selectedSeat.guest_id && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleClearSeat}
                  className="text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 h-[42px] px-3"
                  title="Hapus alokasi kursi"
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
