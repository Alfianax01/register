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
  RotateCw,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  Check
} from 'lucide-react';

interface AuditSeatGuest {
  id: string;
  registration_id?: string;
  nama: string;
  pangkat?: string;
  matra?: string;
  nrp?: string;
  status_kehadiran?: string;
}

interface AuditData {
  totalSeats: number;
  occupiedSeats: number;
  emptySeats: number;
  hasDuplicates: boolean;
  duplicateSeats: Array<{
    seatNumber: string;
    count: number;
    guests: AuditSeatGuest[];
  }>;
  unseatedGuests: AuditSeatGuest[];
}

export default function AllocationPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'seats' | 'rooms' | 'audit'>('seats');
  const [groups, setGroups] = useState<SeatGroup[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [rooms, setRooms] = useState<AccommodationRoom[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoAssignLoading, setAutoAssignLoading] = useState(false);
  const [deduplicateLoading, setDeduplicateLoading] = useState(false);
  const [unseatedSearch, setUnseatedSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async (showLoadingSpinner: boolean = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const [seatsRes, roomsRes, guestsRes, meRes, auditRes] = await Promise.all([
        fetch('/api/placement/seats'),
        fetch('/api/placement/rooms'),
        fetch('/api/guests'),
        fetch('/api/auth/me'),
        fetch('/api/placement/audit')
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
      if (auditRes.ok) {
        const aData = await auditRes.json();
        setAuditData(aData);
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
        fetchData(false);
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
      await fetch('/api/placement/seats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_number: targetSeatNumber, guest_id: sourceGuestId })
      });

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

  const handleDeduplicate = async () => {
    if (!confirm('Jalankan deduplikasi otomatis untuk menyelesaikan semua nomor kursi yang bentrok?')) return;
    try {
      setDeduplicateLoading(true);
      const res = await fetch('/api/placement/deduplicate', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Berhasil menyelesaikan ${data.resolvedCount} kursi bentrok!`, { type: 'success' });
        await fetchData(false);
      } else {
        showToast(data.error || 'Gagal menjalankan deduplikasi', { type: 'error' });
      }
    } catch {
      showToast('Terjadi kesalahan sistem saat deduplikasi', { type: 'error' });
    } finally {
      setDeduplicateLoading(false);
    }
  };

  const filteredUnseated = (auditData?.unseatedGuests || []).filter(g => {
    if (!unseatedSearch.trim()) return true;
    const q = unseatedSearch.toLowerCase();
    return (
      g.nama.toLowerCase().includes(q) ||
      (g.nrp && g.nrp.toLowerCase().includes(q)) ||
      (g.pangkat && g.pangkat.toLowerCase().includes(q)) ||
      (g.matra && g.matra.toLowerCase().includes(q))
    );
  });

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

        {/* TOP WARNING BANNER (JIKA ADA KURSI GANDA / BENTROK) */}
        {auditData?.hasDuplicates && (
          <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs flex-shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  Peringatan: Ditemukan {auditData.duplicateSeats.length} Nomor Kursi Duplikat / Bentrok!
                  <span className="bg-rose-500 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    Konflik Terdeteksi
                  </span>
                </h4>
                <p className="text-xs text-amber-900/90 mt-0.5">
                  Satu kursi hanya dapat ditempati oleh 1 peserta (strict 1:1). Klik tombol di samping untuk menata ulang secara otomatis.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('audit')}
                className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100 bg-white"
              >
                Lihat Detail Audit
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeduplicate}
                disabled={deduplicateLoading}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs gap-1.5"
              >
                <ShieldAlert className={`w-3.5 h-3.5 ${deduplicateLoading ? 'animate-spin' : ''}`} />
                <span>Deduplikasi Otomatis</span>
              </Button>
            </div>
          </div>
        )}

        {/* Top Control Bar: Tabs & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          {/* Tab Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
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

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Audit & Validasi Kursi</span>
              {auditData?.hasDuplicates ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-bold animate-pulse">
                  {auditData.duplicateSeats.length} Duplikat
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold">
                  Valid 1:1
                </span>
              )}
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

            {activeTab === 'audit' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeduplicate}
                disabled={deduplicateLoading || !auditData?.hasDuplicates}
                className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs disabled:opacity-50"
              >
                <ShieldAlert className={`w-3.5 h-3.5 ${deduplicateLoading ? 'animate-spin' : ''}`} />
                <span>Deduplikasi Otomatis</span>
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

        {/* Tab 3: Audit & Validasi Kursi */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Kursi</span>
                  <Armchair className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {auditData?.totalSeats || seats.length}
                  </span>
                  <span className="text-xs text-slate-500">kapasitas denah</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Kursi Terisi</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {auditData?.occupiedSeats ?? seats.filter(s => !!s.guest_id).length}
                  </span>
                  <span className="text-xs text-emerald-600">terisi peserta</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Kursi Kosong</span>
                  <Armchair className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-blue-600 font-mono">
                    {auditData?.emptySeats ?? seats.filter(s => !s.guest_id).length}
                  </span>
                  <span className="text-xs text-blue-500">siap ditempati</span>
                </div>
              </div>

              <div className={`rounded-2xl p-4 border shadow-2xs ${
                auditData?.hasDuplicates
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Kursi Duplikat / Bentrok</span>
                  {auditData?.hasDuplicates ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={`text-2xl font-black font-mono ${auditData?.hasDuplicates ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {auditData?.duplicateSeats?.length || 0}
                  </span>
                  <span className="text-xs font-medium">
                    {auditData?.hasDuplicates ? 'butuh penanganan' : '100% unik (1:1)'}
                  </span>
                </div>
              </div>
            </div>

            {/* DAFTAR KURSI DUPLIKAT (JIKA ADA) */}
            {auditData?.hasDuplicates ? (
              <div className="bg-white rounded-2xl border-2 border-rose-300 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-rose-100">
                  <div>
                    <h3 className="text-base font-bold text-rose-950 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      Daftar Kursi yang Digunakan Lebih dari Satu Peserta
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kursi-kursi di bawah ini saat ini diklaim oleh 2 orang atau lebih secara bersamaan.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDeduplicate}
                    disabled={deduplicateLoading}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5 font-bold shadow-xs"
                  >
                    <ShieldAlert className={`w-4 h-4 ${deduplicateLoading ? 'animate-spin' : ''}`} />
                    <span>Deduplikasi Otomatis Semua Kursi</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {auditData.duplicateSeats.map((dup, idx) => (
                    <div key={idx} className="bg-rose-50/60 rounded-xl p-4 border border-rose-200/80">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 bg-rose-600 text-white font-mono font-black rounded-lg text-sm shadow-2xs">
                            Kursi {dup.seatNumber}
                          </span>
                          <span className="text-xs font-bold text-rose-800">
                            {dup.count} Peserta bentrok
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-rose-200/60 text-slate-500 font-semibold">
                              <th className="py-2 px-3">Nama Peserta</th>
                              <th className="py-2 px-3">Pangkat</th>
                              <th className="py-2 px-3">Matra</th>
                              <th className="py-2 px-3">NRP</th>
                              <th className="py-2 px-3">Status Kehadiran</th>
                              <th className="py-2 px-3 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rose-100">
                            {dup.guests.map((g, gIdx) => (
                              <tr key={g.id} className="hover:bg-rose-100/50">
                                <td className="py-2 px-3 font-semibold text-slate-900">
                                  {g.nama}
                                  {gIdx === 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                                      Pemegang Utama
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-slate-700">{g.pangkat || '-'}</td>
                                <td className="py-2 px-3 font-semibold text-slate-800">{g.matra || '-'}</td>
                                <td className="py-2 px-3 font-mono text-slate-600">{g.nrp || '-'}</td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    g.status_kehadiran === 'CHECK_IN'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {g.status_kehadiran || 'REGISTRASI'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  {gIdx > 0 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAssignSeat(dup.seatNumber, null)}
                                      className="text-[11px] h-7 px-2 border-rose-300 text-rose-700 hover:bg-rose-100 bg-white"
                                    >
                                      Lepas Alokasi
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-950">
                    Semua Alokasi Kursi Valid & Unik
                  </h3>
                  <p className="text-xs text-emerald-800/90 mt-0.5">
                    Tidak ditemukan kursi ganda atau nomor bentrok. Setiap kursi yang terisi tepat ditempati oleh satu peserta.
                  </p>
                </div>
              </div>
            )}

            {/* DAFTAR PESERTA TANPA KURSI */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Peserta Belum Memiliki Kursi ({auditData?.unseatedGuests?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar tamu/prajurit teregistrasi yang belum dialokasikan nomor kursi sidang
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama / NRP..."
                      value={unseatedSearch}
                      onChange={e => setUnseatedSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                  {(auditData?.unseatedGuests?.length || 0) > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAutoAssign}
                      disabled={autoAssignLoading}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5"
                    >
                      <Wand2 className={`w-3.5 h-3.5 ${autoAssignLoading ? 'animate-spin' : ''}`} />
                      <span>Alokasikan Semua</span>
                    </Button>
                  )}
                </div>
              </div>

              {(auditData?.unseatedGuests?.length || 0) === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Semua peserta telah mendapatkan kursi sidang.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold z-10">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Nama Lengkap</th>
                        <th className="py-2.5 px-3">Pangkat</th>
                        <th className="py-2.5 px-3">Matra</th>
                        <th className="py-2.5 px-3">NRP</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUnseated.map((g, idx) => (
                        <tr key={g.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{g.nama}</td>
                          <td className="py-2 px-3 text-slate-700">{g.pangkat || '-'}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{g.matra || '-'}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{g.nrp || '-'}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              g.status_kehadiran === 'CHECK_IN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {g.status_kehadiran || 'REGISTRASI'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('seats');
                                showToast(`Silakan klik salah satu kursi kosong untuk menempatkan ${g.nama}`, { type: 'info' });
                              }}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              Pilih Kursi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
