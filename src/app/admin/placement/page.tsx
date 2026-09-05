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

export default function PlacementPage() {
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
            status: assignedGuest?.status_kehadiran === 'HADIR' ? 'HADIR' : 'ASSIGNED'
          };
        }
        // If this guest was previously on another seat, unassign that seat
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
          return { ...g, seat_number: seatNumber };
        }
        if (!guestId && g.seat_number === seatNumber) {
          return { ...g, seat_number: undefined };
        }
        return g;
      })
    );

    try {
      const res = await fetch('/api/placement/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_number: seatNumber, guest_id: guestId })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('Gagal Mengubah Kursi', {
          type: 'error',
          message: data.error || 'Gagal mengubah alokasi kursi.'
        });
        fetchData(false); // Rollback to server state
        return;
      }

      showToast('Alokasi Kursi Berhasil', {
        type: 'success',
        message: guestId
          ? `Kursi ${seatNumber} berhasil dialokasikan untuk ${assignedGuest ? `${assignedGuest.pangkat} ${assignedGuest.nama}` : 'prajurit'}.`
          : `Alokasi kursi ${seatNumber} telah dikosongkan.`
      });

      // Background silent sync
      fetchData(false);
    } catch {
      showToast('Koneksi Terputus', {
        type: 'error',
        message: 'Gagal menghubungi server penempatan kursi.'
      });
      fetchData(false); // Rollback
    }
  };

  const handleAssignRoom = async (roomId: string, slot: 'A' | 'B', guestId: string | null) => {
    const assignedGuest = guestId ? guests.find(g => g.id === guestId) : null;

    // Optimistic local update
    setRooms(prevRooms =>
      prevRooms.map(r => {
        const updated = { ...r };
        if (guestId) {
          if (updated.slot_a_guest_id === guestId && (updated.id !== roomId || slot !== 'A')) {
            updated.slot_a_guest_id = undefined;
            updated.slot_a_guest_name = undefined;
            updated.slot_a_guest_rank = undefined;
            updated.slot_a_guest_matra = undefined;
          }
          if (updated.slot_b_guest_id === guestId && (updated.id !== roomId || slot !== 'B')) {
            updated.slot_b_guest_id = undefined;
            updated.slot_b_guest_name = undefined;
            updated.slot_b_guest_rank = undefined;
            updated.slot_b_guest_matra = undefined;
          }
        }
        if (updated.id === roomId) {
          if (slot === 'A') {
            updated.slot_a_guest_id = guestId || undefined;
            updated.slot_a_guest_name = assignedGuest?.nama;
            updated.slot_a_guest_rank = assignedGuest?.pangkat;
            updated.slot_a_guest_matra = assignedGuest?.matra;
          } else {
            updated.slot_b_guest_id = guestId || undefined;
            updated.slot_b_guest_name = assignedGuest?.nama;
            updated.slot_b_guest_rank = assignedGuest?.pangkat;
            updated.slot_b_guest_matra = assignedGuest?.matra;
          }
        }
        return updated;
      })
    );

    setGuests(prevGuests =>
      prevGuests.map(g => {
        if (g.id === guestId) {
          return { ...g, room_id: roomId, room_slot: slot };
        }
        if (!guestId && g.room_id === roomId && g.room_slot === slot) {
          return { ...g, room_id: undefined, room_slot: undefined };
        }
        return g;
      })
    );

    try {
      const res = await fetch('/api/placement/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, slot, guest_id: guestId })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('Gagal Menetapkan Kamar', { type: 'error', message: data.error || 'Gagal mengubah kamar' });
        fetchData(false);
        return;
      }

      showToast('Alokasi Wisma Berhasil', {
        type: 'success',
        message: guestId
          ? `Kamar berhasil dialokasikan untuk ${assignedGuest ? `${assignedGuest.pangkat} ${assignedGuest.nama}` : 'prajurit'}.`
          : 'Alokasi slot kamar telah dikosongkan.'
      });
      fetchData(false);
    } catch {
      showToast('Koneksi Terputus', { type: 'error', message: 'Gagal menghubungi server wisma.' });
      fetchData(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!confirm('Jalankan alokasi kursi otomatis? Sistem akan menempatkan seluruh prajurit yang belum memiliki kursi berdasarkan urutan senioritas kepangkatan.')) {
      return;
    }

    try {
      setAutoAssignLoading(true);
      const res = await fetch('/api/placement/auto-assign', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        showToast('Auto-Assign Gagal', { type: 'error', message: data.error || 'Gagal auto-assign' });
      } else {
        showToast('Auto-Assign Berhasil', {
          type: 'success',
          message: data.message || `Berhasil menempatkan ${data.assignedCount || 0} prajurit.`
        });
        fetchData(false);
      }
    } catch {
      showToast('Koneksi Terputus', { type: 'error', message: 'Gagal menjalankan alokasi otomatis.' });
    } finally {
      setAutoAssignLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <AdminHeader
        user={currentUser}
        title="Penempatan Kursi & Wisma"
        subtitle="Alokasi tata letak kursi sidang paripurna dan kamar penginapan prajurit tamu"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto w-full space-y-6">
        {/* Sub-Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-lg bg-slate-200/70 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('seats')}
              className={`px-3.5 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'seats'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Armchair className={`w-3.5 h-3.5 ${activeTab === 'seats' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Denah Kursi Paripurna</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rooms')}
              className={`px-3.5 py-2 sm:py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'rooms'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bed className={`w-3.5 h-3.5 ${activeTab === 'rooms' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Denah Wisma Penginapan</span>
            </button>
          </div>

          {/* Actions: Auto-Assign & Refresh */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {activeTab === 'seats' && (
              <Button
                variant="primary"
                size="md"
                onClick={handleAutoAssign}
                isLoading={autoAssignLoading}
                loadingText="Mengalokasikan..."
                className="text-xs font-semibold h-[40px] sm:h-[38px] w-full sm:w-auto"
              >
                <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Auto-Assign Kursi (By Pangkat)</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={() => fetchData()}
              className="text-xs h-[40px] sm:h-[38px] w-full sm:w-auto"
            >
              <RotateCw className="w-3.5 h-3.5 mr-1" />
              <span>Segarkan</span>
            </Button>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-bold opacity-60 hover:opacity-100"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Memuat denah tata letak...</p>
          </div>
        ) : activeTab === 'seats' ? (
          <SeatingGridView
            groups={groups}
            seats={seats}
            guests={guests}
            onAssignSeat={handleAssignSeat}
          />
        ) : (
          <WismaGridView
            rooms={rooms}
            guests={guests}
            onAssignRoom={handleAssignRoom}
          />
        )}
      </div>
    </div>
  );
}
