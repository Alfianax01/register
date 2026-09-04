'use client';

import React, { useState } from 'react';
import { SeatGroup, Seat, Guest } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Armchair, User, UserX, CheckCircle2 } from 'lucide-react';

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
      <div className="flex flex-wrap gap-2 border-b border-[#1E3B2F] pb-3">
        {groups.map(grp => {
          const isSelected = selectedGroupCode === grp.code;
          const grpSeats = seats.filter(s => s.group_code === grp.code);
          const occupied = grpSeats.filter(s => !!s.guest_id).length;

          return (
            <button
              key={grp.code}
              type="button"
              onClick={() => { setSelectedGroupCode(grp.code); setSelectedSeat(null); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#143B2A] text-[#F5E296] border border-[#D4AF37] shadow-lg shadow-black/40'
                  : 'bg-[#0A1711] text-slate-300 border border-[#173325] hover:border-slate-500'
              }`}
            >
              <span className="w-5 h-5 rounded-md bg-[#070E0B] flex items-center justify-center font-mono text-[11px] text-[#D4AF37]">
                {grp.code}
              </span>
              <span>{grp.name}</span>
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-black/40 text-slate-400">
                {occupied}/{grp.capacity}
              </span>
            </button>
          );
        })}
      </div>

      {/* Seating Stage Legend & Floor Layout */}
      <div className="p-6 rounded-2xl bg-[#091811] border border-[#1E3B2F] space-y-6">
        {/* Stage Indicator (Podium Utama) */}
        <div className="w-full py-2 bg-gradient-to-r from-emerald-950 via-[#16422F] to-emerald-950 rounded-lg border border-[#2D664D] text-center text-xs font-serif font-bold text-[#F5E296] tracking-widest uppercase shadow-md">
          &uarr; MIMBAR UTAMA / PANGGUNG PIMPINAN SIDANG &uarr;
        </div>

        {/* Seat Grid Visual */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {groupSeats.map(seat => {
            const isAssigned = !!seat.guest_id;
            const isPresent = seat.guest_status === 'HADIR';
            const isSelected = selectedSeat?.id === seat.id;

            return (
              <button
                key={seat.id}
                type="button"
                onClick={() => handleOpenSeat(seat)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center min-h-[72px] transition-all relative group ${
                  isSelected
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] bg-[#1C3B2D] scale-105 z-10'
                    : isPresent
                    ? 'border-emerald-500 bg-emerald-950/80 text-emerald-200'
                    : isAssigned
                    ? 'border-amber-500/70 bg-amber-950/50 text-amber-200'
                    : 'border-[#1B382A] bg-[#0A1610] text-slate-500 hover:border-slate-400'
                }`}
              >
                <Armchair className={`w-5 h-5 mb-1 ${
                  isPresent ? 'text-emerald-400' : isAssigned ? 'text-[#D4AF37]' : 'text-slate-600'
                }`} />
                <span className="font-mono font-bold text-xs">{seat.seat_number}</span>

                {isAssigned && (
                  <span className="text-[9px] truncate max-w-full block px-1 text-slate-300 font-sans">
                    {seat.guest_name?.split(' ')[0]}
                  </span>
                )}

                {/* Status Dot */}
                <span
                  className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                    isPresent ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : isAssigned ? 'bg-amber-400' : 'bg-slate-700'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-[#173325] text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500 shadow-[0_0_6px_#34d399]" />
            <span>Hadir di Lokasi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span>Sudah Ditetapkan (Assigned)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#0A1610] border border-[#1B382A]" />
            <span>Kursi Kosong</span>
          </div>
        </div>
      </div>

      {/* Seat Inspector / Assign Dialog Drawer */}
      {selectedSeat && (
        <div className="p-5 rounded-xl bg-[#0F261C] border-2 border-[#D4AF37]/70 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center justify-between border-b border-[#1E4333] pb-3">
            <div>
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                PENETAPAN TEMPAT DUDUK
              </span>
              <h4 className="text-base font-serif font-bold text-slate-100">
                Kursi {selectedSeat.seat_number} (Grup {selectedSeat.group_code})
              </h4>
            </div>
            <span className="text-xs text-slate-300">
              Baris {selectedSeat.row_num} &bull; Kolom {selectedSeat.col_num}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Pilih Prajurit / Tamu yang Dialokasikan:
              </label>
              <select
                value={selectedGuestId}
                onChange={(e) => setSelectedGuestId(e.target.value)}
                className="w-full rounded-lg bg-[#070E0B] text-slate-100 border border-[#1E3B2F] text-xs p-3 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                <option value="">-- Kosongkan Kursi Ini --</option>
                {/* Currently assigned guest if not in unseated list */}
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
                variant="gold"
                size="md"
                onClick={handleSaveAssignment}
                className="flex-1 text-xs font-bold"
              >
                <span>Simpan Kursi</span>
              </Button>
              {selectedSeat.guest_id && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleClearSeat}
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

