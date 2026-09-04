'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Guest } from '@/types';
import {
  Search,
  Filter,
  FileSpreadsheet,
  QrCode,
  CheckCircle2,
  Clock,
  RotateCw
} from 'lucide-react';
import Link from 'next/link';

export default function GuestsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatra, setFilterMatra] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchGuests = async () => {
    try {
      setLoading(true);
      let query = `/api/guests?q=${encodeURIComponent(searchTerm)}`;
      if (filterMatra) query += `&matra=${filterMatra}`;
      if (filterStatus) query += `&status=${filterStatus}`;

      const [res, meRes] = await Promise.all([
        fetch(query),
        fetch('/api/auth/me')
      ]);

      if (res.ok) {
        const data = await res.json();
        setGuests(data.guests || []);
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [filterMatra, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGuests();
  };

  const togglePresence = async (guest: Guest) => {
    const newStatus = guest.status_kehadiran === 'HADIR' ? 'BELUM_HADIR' : 'HADIR';
    try {
      const res = await fetch('/api/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: guest.id,
          updates: {
            status_kehadiran: newStatus,
            waktu_kehadiran_pertama: newStatus === 'HADIR' ? new Date().toISOString() : undefined
          }
        })
      });
      if (res.ok) {
        fetchGuests();
      }
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <AdminHeader
        user={currentUser}
        title="Master Data Tamu & Prajurit"
        subtitle="Kelola seluruh direktori peserta, penempatan kursi, dan pencetakan ID Card"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Filters & Actions Bar */}
        <Card className="p-4 space-y-3 bg-white border border-slate-200 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Cari nama, NRP, jabatan, satker..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="text-xs px-4 h-[42px] font-semibold">
                Cari
              </Button>
            </form>

            {/* Quick Export Button */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={() => { window.location.href = '/api/export'; }}
                className="text-xs h-[42px] flex-1 md:flex-initial"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span>Unduh Excel</span>
              </Button>

              <Button
                variant="ghost"
                size="md"
                onClick={fetchGuests}
                className="text-xs h-[42px] px-2.5 text-slate-500 hover:text-slate-800"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-slate-400" /> Filter:
            </span>

            {/* Matra Filter */}
            <select
              value={filterMatra}
              onChange={(e) => setFilterMatra(e.target.value)}
              className="bg-white text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">Semua Matra</option>
              <option value="AD">TNI AD</option>
              <option value="AL">TNI AL</option>
              <option value="AU">TNI AU</option>
              <option value="MABES">Mabes TNI</option>
              <option value="NON_TNI">Non-TNI / Sipil</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">Semua Status Presensi</option>
              <option value="HADIR">Sudah Hadir</option>
              <option value="BELUM_HADIR">Belum Check-In</option>
            </select>

            <span className="ml-auto text-[11px] text-slate-500 font-mono">
              Total: {guests.length} Tamu
            </span>
          </div>
        </Card>

        {/* Guests Table */}
        <Card className="overflow-hidden bg-white border border-slate-200 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Prajurit / Tamu</th>
                  <th className="py-3 px-4">Pangkat & NRP</th>
                  <th className="py-3 px-4">Jabatan & Kesatuan</th>
                  <th className="py-3 px-4">Kursi</th>
                  <th className="py-3 px-4">Wisma</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-mono">
                      Memuat daftar data tamu...
                    </td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Tidak ada data tamu yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  guests.map((g, idx) => {
                    const isPresent = g.status_kehadiran === 'HADIR';

                    return (
                      <tr
                        key={g.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900 font-semibold">
                              {g.gelar_depan ? `${g.gelar_depan} ` : ''}
                              {g.nama}
                              {g.gelar_belakang ? `, ${g.gelar_belakang}` : ''}
                            </strong>
                            <Badge variant={g.matra === 'AD' ? 'ad' : g.matra === 'AL' ? 'al' : g.matra === 'AU' ? 'au' : 'slate'} size="sm">
                              {g.matra}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-slate-500 block font-mono">
                            {g.no_hp}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 block">
                            {g.pangkat}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            NRP {g.nrp}
                          </span>
                        </td>

                        <td className="py-3 px-4 max-w-xs">
                          <span className="font-medium text-slate-800 block truncate">
                            {g.jabatan}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {g.satuan} &bull; {g.satker}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {g.seat_number ? (
                            <span className="font-mono font-bold text-xs text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                              {g.seat_number}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {g.room_id ? (
                            <span className="font-mono text-[11px] text-indigo-700 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">
                              {g.room_slot || 'A'}
                            </span>
                          ) : g.butuh_akomodasi ? (
                            <span className="text-[11px] text-amber-600 font-medium">Diminta</span>
                          ) : (
                            <span className="text-[11px] text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => togglePresence(g)}
                            className="focus:outline-none"
                            title="Klik untuk mengubah status kehadiran manual"
                          >
                            {isPresent ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Hadir</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 hover:border-slate-300 transition-colors">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Belum</span>
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <Link
                            href={`/ticket/${g.qr_token}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                            title="Buka E-Ticket & QR Code Tamu"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>E-Ticket</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
