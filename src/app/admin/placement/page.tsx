'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { SeatingGridView } from '@/components/placement/SeatingGridView';
import { WismaGridView } from '@/components/placement/WismaGridView';
import { Button } from '@/components/ui/Button';
import { SeatGroup, Seat, AccommodationRoom, Guest } from '@/types';
import {
  Armchair,
  Bed,
  Wand2,
  CheckCircle2,
  AlertCircle,
  RotateCw
} from 'lucide-react';

export default function PlacementPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'seats' | 'rooms'>('seats');
  const [groups, setGroups] = useState<SeatGroup[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [rooms, setRooms] = useState<AccommodationRoom[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignSeat = async (seatNumber: string, guestId: string | null) => {
    try {
      const res = await fetch('/api/placement/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_number: seatNumber, guest_id: guestId })
      });

      const data = await res.json();
      if (!res.ok) {
        setNotification({ type: 'error', message: data.error || 'Gagal mengubah kursi' });
        return;
      }

      setNotification({ type: 'success', message: 'Alokasi kursi berhasil diperbarui.' });
      fetchData();
    } catch {
      setNotification({ type: 'error', message: 'Gagal menghubungi server penempatan kursi.' });
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
        setNotification({ type: 'error', message: data.error || 'Gagal mengubah kamar' });
        return;
      }

      setNotification({ type: 'success', message: 'Alokasi kamar penginapan berhasil diperbarui.' });
      fetchData();
    } catch {
      setNotification({ type: 'error', message: 'Gagal menghubungi server wisma.' });
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
        setNotification({ type: 'error', message: data.error || 'Gagal auto-assign' });
      } else {
        setNotification({ type: 'success', message: data.message });
        fetchData();
      }
    } catch {
      setNotification({ type: 'error', message: 'Gagal menjalankan alokasi otomatis.' });
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

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Sub-Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-lg bg-slate-200/70 border border-slate-200 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('seats')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
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
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
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
          <div className="flex items-center gap-2">
            {activeTab === 'seats' && (
              <Button
                variant="primary"
                size="md"
                onClick={handleAutoAssign}
                isLoading={autoAssignLoading}
                className="text-xs font-semibold h-[38px]"
              >
                <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Auto-Assign Kursi (By Pangkat)</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={fetchData}
              className="text-xs h-[38px]"
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
