'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { SeatingGridView } from '@/components/placement/SeatingGridView';
import { WismaGridView } from '@/components/placement/WismaGridView';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { SeatGroup, Seat, AccommodationRoom, Guest } from '@/types';
import { getInstansiCategory, getSeatColorAlias } from '@/lib/constants/matra-colors';
import {
  Armchair,
  Bed,
  Wand2,
  CheckCircle2,
  AlertCircle,
  RotateCw
} from 'lucide-react';

export default function AllocationPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'seats' | 'rooms'>('seats');
  const [groups, setGroups] = useState<SeatGroup[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [rooms, setRooms] = useState<AccommodationRoom[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async (showLoadingSpinner: boolean = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const [seatsRes, roomsRes, guestsRes, meRes] = await Promise.all([
        fetch('/api/placement/seats'),
        fetch('/api/placement/rooms'),
        fetch('/api/guests'),
        fetch('/api/auth/me')
      ]);

      if (seatsRes.ok) {
        const seatsData = await seatsRes.json();
        setGroups(seatsData.groups || []);
        setSeats(seatsData.seats || []);
      }
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.accommodations || []);
      }
      if (guestsRes.ok) {
        const guestsData = await guestsRes.json();
        setGuests(guestsData.guests || []);
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }
    } catch {
      setNotification({ type: 'error', message: 'Gagal memuat data penempatan' });
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignSeat = async (seatNumber: string, guestId: string | null) => {
    const assignedGuest = guestId ? guests.find(g => g.id === guestId) : null;

    // 1. Optimistic Realtime Update on Seat Grid & Guests
    setSeats(prevSeats =>
      prevSeats.map(s => {
        if (s.seat_number === seatNumber) {
          if (!guestId) {
            return {
              ...s,
              guest_id: undefined,
              peserta_id: null,
              guest_name: undefined,
              guest_rank: undefined,
              guest_matra: undefined,
              guest_status: undefined,
              kategori_instansi: undefined,
              colorAlias: null,
              warna: undefined,
              status: 'KOSONG'
            };
          }
          const katInstansi = assignedGuest?.kategori_instansi || getInstansiCategory(assignedGuest?.matra || assignedGuest?.satker);
          const colorAlias = assignedGuest?.warna_kursi || getSeatColorAlias(katInstansi);
          return {
            ...s,
            guest_id: guestId,
            peserta_id: guestId,
            guest_name: assignedGuest?.nama,
            guest_rank: assignedGuest?.pangkat,
            guest_matra: assignedGuest?.matra,
            guest_status: assignedGuest?.status_kehadiran,
            kategori_instansi: katInstansi,
            colorAlias: colorAlias,
            warna: colorAlias,
            status: assignedGuest?.status_kehadiran === 'CHECK_IN' ? 'CHECK_IN' : 'ASSIGNED'
          };
        }
        if (guestId && s.guest_id === guestId && s.seat_number !== seatNumber) {
          return {
            ...s,
            guest_id: undefined,
            peserta_id: null,
            guest_name: undefined,
            guest_rank: undefined,
            guest_matra: undefined,
            guest_status: undefined,
            kategori_instansi: undefined,
            colorAlias: null,
            warna: undefined,
            status: 'KOSONG'
          };
        }
        return s;
      })
    );

    setGuests(prevGuests =>
      prevGuests.map(g => {
        if (g.id === guestId) {
          const targetSeat = seats.find(s => s.seat_number === seatNumber);
          return {
            ...g,
            seat_number: seatNumber,
            seat_assignment: seatNumber,
            seat_group_id: targetSeat?.group_id
          };
        }
        if (!guestId && g.seat_number === seatNumber) {
          return {
            ...g,
            seat_number: undefined,
            seat_assignment: undefined,
            seat_group_id: undefined
          };
        }
        return g;
      })
    );

    // 2. Persist to API
    try {
      const res = await fetch('/api/placement/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_number: seatNumber, guest_id: guestId })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal menyimpan penetapan kursi', { type: 'error' });
        fetchData(false);
      } else {
        showToast(
          guestId
            ? `Kursi ${seatNumber} berhasil ditetapkan untuk ${assignedGuest?.nama || 'Tamu'}`
            : `Kursi ${seatNumber} telah dikosongkan`,
          { type: 'success' }
        );
      }
    } catch {
      showToast('Gagal menghubungi server', { type: 'error' });
      fetchData(false);
    }
  };

  // Swap Seats via Drag and Drop
  const handleSwapSeats = async (sourceSeatNumber: string, targetSeatNumber: string) => {
    const sourceSeat = seats.find(s => s.seat_number === sourceSeatNumber);
    const targetSeat = seats.find(s => s.seat_number === targetSeatNumber);
    if (!sourceSeat) return;

    const sourceGuestId = sourceSeat.guest_id || null;
    const targetGuestId = targetSeat?.guest_id || null;

    if (!sourceGuestId && !targetGuestId) return;

    try {
      // Step 1: Assign source guest to target seat
      await fetch('/api/placement/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_number: targetSeatNumber, guest_id: sourceGuestId })
      });

      // Step 2: If target was occupied, assign target guest to source seat
      if (targetGuestId) {
        await fetch('/api/placement/seats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seat_number: sourceSeatNumber, guest_id: targetGuestId })
        });
      }

      await fetchData(false);
      showToast(`Berhasil memindahkan penempatan kursi ${sourceSeatNumber} ➔ ${targetSeatNumber}`, { type: 'success' });
    } catch {
      showToast('Gagal memproses pertukaran kursi', { type: 'error' });
      fetchData(false);
    }
  };

  const handleAssignRoom = async (roomId: string, slot: 'A' | 'B', guestId: string | null) => {
    try {
      const res = await fetch('/api/placement/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, slot, guest_id: guestId })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal menyimpan penetapan kamar', { type: 'error' });
      } else {
        showToast(data.message || 'Penetapan kamar berhasil disimpan', { type: 'success' });
        fetchData(false);
      }
    } catch {
      showToast('Gagal menghubungi server', { type: 'error' });
      fetchData(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!confirm('Jalankan alokasi otomatis kursi untuk seluruh tamu yang belum memiliki kursi?')) return;
    try {
      setAutoAssignLoading(true);
      const res = await fetch('/api/placement/auto-assign', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Berhasil mengalokasikan ${data.assignedCount} kursi secara otomatis!`, { type: 'success' });
        fetchData(false);
      } else {
        showToast(data.error || 'Gagal menjalankan auto-assign', { type: 'error' });
      }
    } catch {
      showToast('Terjadi kesalahan sistem', { type: 'error' });
    } finally {
      setAutoAssignLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
      <AdminHeader
        title="Penempatan Kursi & Wisma"
        subtitle="Manajemen visual tata letak kursi sidang pleno dan penugasan kamar wisma delegasi RAPIM TNI 2026"
        user={currentUser}
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-xs font-semibold">{notification.message}</span>
          </div>
        )}

        {/* Top Control Bar: Tabs & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Tab Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('seats')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'seats'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Armchair className="w-4 h-4" />
              <span>Layout Kursi Sidang</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                {seats.filter(s => !!s.guest_id).length}/{seats.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rooms')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rooms'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>Layout Wisma & Kamar</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                {rooms.length} Kamar
              </span>
            </button>
          </div>

          {/* Actions: Refresh & Auto Assign */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(true)}
              disabled={loading}
              className="gap-1.5 text-xs text-slate-700 bg-white border-slate-200"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh Data</span>
            </Button>

            {activeTab === 'seats' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleAutoAssign}
                disabled={autoAssignLoading}
                className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                <Wand2 className={`w-3.5 h-3.5 ${autoAssignLoading ? 'animate-spin' : ''}`} />
                <span>Auto-Allocate Kursi</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tab 1: Layout Kursi */}
        {activeTab === 'seats' && (
          <SeatingGridView
            groups={groups}
            seats={seats}
            guests={guests}
            onAssignSeat={handleAssignSeat}
            onSwapSeats={handleSwapSeats}
            isLoading={loading}
          />
        )}

        {/* Tab 2: Layout Wisma */}
        {activeTab === 'rooms' && (
          <WismaGridView
            rooms={rooms}
            guests={guests}
            onAssignRoom={handleAssignRoom}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}
