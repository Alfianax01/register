
'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Guest, MatraType } from '@/types';
import { TNI_RANKS } from '@/lib/constants/ranks';
import {
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  QrCode,
  CheckCircle2,
  Clock,
  RotateCw,
  Edit2,
  Trash2,
  Mail,
  Download,
  AlertTriangle,
  Loader2,
  Send
} from 'lucide-react';
import Link from 'next/link';

export default function GuestsPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatra, setFilterMatra] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals state
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const [resendingGuest, setResendingGuest] = useState<Guest | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendingLoading, setResendingLoading] = useState(false);

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
        showToast(
          `Status presensi ${guest.nama} diubah ke ${newStatus === 'HADIR' ? 'HADIR' : 'BELUM HADIR'}`,
          { type: 'success' }
        );
        fetchGuests();
      } else {
        showToast('Gagal mengubah status presensi', { type: 'error' });
      }
    } catch {
      showToast('Terjadi kesalahan jaringan', { type: 'error' });
    }
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setEditFormData({
      nama: guest.nama || '',
      gelar_depan: guest.gelar_depan || '',
      gelar_belakang: guest.gelar_belakang || '',
      pangkat: guest.pangkat || '',
      nrp: guest.nrp || '',
      jabatan: guest.jabatan || '',
      satker: guest.satker || '',
      satuan: guest.satuan || '',
      negara_instansi: guest.negara_instansi || '',
      matra: guest.matra || 'AD',
      email: guest.email || '',
      no_hp: guest.no_hp || '',
      seat_number: guest.seat_number || ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;

    setSavingEdit(true);
    try {
      const res = await fetch('/api/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGuest.id,
          updates: editFormData
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Data ${editFormData.nama} berhasil diperbarui`, { type: 'success' });
        setEditingGuest(null);
        fetchGuests();
      } else {
        showToast(data.error || 'Gagal menyimpan pembaruan', { type: 'error' });
      }
    } catch {
      showToast('Terjadi kesalahan jaringan', { type: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingGuest) return;

    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/guests?id=${encodeURIComponent(deletingGuest.id)}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Peserta ${deletingGuest.nama} berhasil dihapus`, { type: 'success' });
        setDeletingGuest(null);
        fetchGuests();
      } else {
        showToast(data.error || 'Gagal menghapus data peserta', { type: 'error' });
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat menghapus', { type: 'error' });
    } finally {
      setDeletingLoading(false);
    }
  };

  const openResendModal = (guest: Guest) => {
    setResendingGuest(guest);
    setResendEmail(guest.email || '');
  };

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendingGuest) return;

    if (!resendEmail.trim()) {
      showToast('Harap masukkan alamat email tujuan', { type: 'error' });
      return;
    }

    setResendingLoading(true);
    try {
      const res = await fetch(`/api/ticket/${resendingGuest.qr_token}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`E-Ticket & PDF berhasil dikirimkan ke ${resendEmail}`, { type: 'success' });
        setResendingGuest(null);
        fetchGuests();
      } else {
        showToast(data.error || 'Gagal mengirim email E-Ticket', { type: 'error' });
      }
    } catch {
      showToast('Terjadi kesalahan jaringan saat mengirim email', { type: 'error' });
    } finally {
      setResendingLoading(false);
    }
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

            {/* Quick Export & Rekap Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={() => { window.location.href = '/api/export'; }}
                className="text-xs h-[42px] flex-1 md:flex-initial"
                title="Unduh seluruh data tamu format file Excel / CSV"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span>Unduh Excel</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => { window.open('/api/export/pdf', '_blank'); }}
                className="text-xs h-[42px] flex-1 md:flex-initial"
                title="Cetak dan unduh rekap resmi daftar hadir seluruh peserta format PDF A4"
              >
                <FileText className="w-4 h-4 mr-1.5 text-rose-600" />
                <span>Rekap PDF</span>
              </Button>

              <Button
                variant="ghost"
                size="md"
                onClick={fetchGuests}
                className="text-xs h-[42px] px-2.5 text-slate-500 hover:text-slate-800"
                title="Muat ulang data"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
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
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3">Prajurit / Tamu</th>
                  <th className="py-3 px-3">Pangkat & NRP</th>
                  <th className="py-3 px-3">Jabatan & Kesatuan</th>
                  <th className="py-3 px-3 text-center">Kursi</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center w-52">Aksi Dokumen & Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Memuat direktori data tamu...</span>
                      </div>
                    </td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
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
                        <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900 font-semibold">
                              {g.gelar_depan ? `${g.gelar_depan} ` : ''}
                              {g.nama}
                              {g.gelar_belakang ? `, ${g.gelar_belakang}` : ''}
                            </strong>
                            <Badge variant={g.matra === 'AD' ? 'ad' : g.matra === 'AL' ? 'al' : g.matra === 'AU' ? 'au' : 'slate'} size="sm">
                              {g.matra}
                            </Badge>
                            {g.emailSent && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="E-Ticket telah dikirim via email">
                                <Mail className="w-2.5 h-2.5" /> Terkirim
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                            <span>{g.no_hp}</span>
                            {g.email && <span className="truncate max-w-[140px]">&bull; {g.email}</span>}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800 block">
                            {g.pangkat}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            NRP: {g.nrp || '-'}
                          </span>
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <span className="font-medium text-slate-800 block truncate">
                            {g.jabatan}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {g.satuan || g.satker || g.negara_instansi}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {g.seat_number ? (
                            <span className="font-mono font-bold text-xs text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                              {g.seat_number}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">-</span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
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

                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Buka E-Ticket Digital */}
                            <Link
                              href={`/ticket/${g.qr_token}`}
                              target="_blank"
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Buka E-Ticket Web & QR Code"
                            >
                              <QrCode className="w-4 h-4" />
                            </Link>

                            {/* Unduh PDF Resmi */}
                            <Link
                              href={`/api/ticket/${g.qr_token}/pdf`}
                              target="_blank"
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Unduh E-Ticket PDF Resmi (A4 Invoice)"
                            >
                              <Download className="w-4 h-4" />
                            </Link>

                            {/* Kirim Ulang Email E-Ticket */}
                            <button
                              type="button"
                              onClick={() => openResendModal(g)}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              title="Kirim Ulang E-Ticket PDF via Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>

                            {/* Edit Profil Peserta */}
                            <button
                              type="button"
                              onClick={() => openEditModal(g)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="Sunting Data Peserta"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Hapus Peserta */}
                            <button
                              type="button"
                              onClick={() => setDeletingGuest(g)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Hapus Peserta dari Database"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* ========================================================== */}
      {/* MODAL EDIT DATA PESERTA */}
      {/* ========================================================== */}
      <Modal
        isOpen={!!editingGuest}
        onClose={() => setEditingGuest(null)}
        title="Sunting Profil Tamu & Prajurit"
        description="Perbarui informasi identitas kedinasan, penempatan kursi, dan kontak resmi peserta."
        maxWidth="lg"
      >
        {editingGuest && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap (Tanpa Gelar) <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={editFormData.nama}
                  onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gelar Depan
                </label>
                <Input
                  value={editFormData.gelar_depan}
                  onChange={(e) => setEditFormData({ ...editFormData, gelar_depan: e.target.value })}
                  placeholder="Contoh: Dr. / Mayjen TNI"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gelar Belakang
                </label>
                <Input
                  value={editFormData.gelar_belakang}
                  onChange={(e) => setEditFormData({ ...editFormData, gelar_belakang: e.target.value })}
                  placeholder="Contoh: S.E., M.M."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pangkat Kedinasan <span className="text-rose-500">*</span>
                </label>
                <input
                  list="rank-suggestions"
                  value={editFormData.pangkat}
                  onChange={(e) => setEditFormData({ ...editFormData, pangkat: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  placeholder="Pilih atau ketik pangkat"
                  required
                />
                <datalist id="rank-suggestions">
                  {TNI_RANKS.map((r) => (
                    <option key={r.id} value={r.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NRP / Nomor Identitas
                </label>
                <Input
                  value={editFormData.nrp}
                  onChange={(e) => setEditFormData({ ...editFormData, nrp: e.target.value })}
                  placeholder="Nomor NRP atau NIP"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Matra / Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editFormData.matra}
                  onChange={(e) => setEditFormData({ ...editFormData, matra: e.target.value as MatraType })}
                  aria-label="Pilih matra atau kategori tamu"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="AD">TNI AD (Angkatan Darat)</option>
                  <option value="AL">TNI AL (Angkatan Laut)</option>
                  <option value="AU">TNI AU (Angkatan Udara)</option>
                  <option value="MABES">Mabes TNI</option>
                  <option value="NON_TNI">Undangan Sipil / Non-TNI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Kursi Pleno
                </label>
                <Input
                  value={editFormData.seat_number}
                  onChange={(e) => setEditFormData({ ...editFormData, seat_number: e.target.value.toUpperCase() })}
                  placeholder="Contoh: A-01, B-05"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Kedinasan <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={editFormData.jabatan}
                  onChange={(e) => setEditFormData({ ...editFormData, jabatan: e.target.value })}
                  placeholder="Contoh: Pangdam / Asops Panglima TNI"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Satuan Kerja / Kementerian / Instansi
                </label>
                <Input
                  value={editFormData.satker}
                  onChange={(e) => setEditFormData({ ...editFormData, satker: e.target.value, negara_instansi: e.target.value })}
                  placeholder="Contoh: Kodam Jaya / Kementerian Pertahanan"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={editFormData.no_hp}
                  onChange={(e) => setEditFormData({ ...editFormData, no_hp: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email (Pengiriman E-Ticket)
                </label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="nama@tni.mil.id"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setEditingGuest(null)}
                disabled={savingEdit}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={savingEdit}
                className="gap-1.5"
              >
                {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan Perubahan</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================== */}
      {/* MODAL KONFIRMASI HAPUS PESERTA */}
      {/* ========================================================== */}
      <Modal
        isOpen={!!deletingGuest}
        onClose={() => setDeletingGuest(null)}
        title="Konfirmasi Penghapusan Peserta"
        description="Tindakan ini permanen dan akan menghapus seluruh data pendaftaran peserta dari sistem."
        maxWidth="md"
      >
        {deletingGuest && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 space-y-1">
                <p className="font-semibold text-rose-900">
                  Anda akan menghapus peserta:
                </p>
                <p className="font-bold text-slate-900 text-sm">
                  {deletingGuest.nama} ({deletingGuest.pangkat} &bull; NRP {deletingGuest.nrp || '-'})
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Menghapus peserta ini akan mengosongkan kursi {deletingGuest.seat_number ? `(${deletingGuest.seat_number})` : ''} dan mencabut keabsahan E-Ticket serta QR Code terkait.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setDeletingGuest(null)}
                disabled={deletingLoading}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="md"
                onClick={handleDeleteSubmit}
                disabled={deletingLoading}
                className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {deletingLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Hapus Permanen</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================== */}
      {/* MODAL KIRIM ULANG E-TICKET VIA EMAIL */}
      {/* ========================================================== */}
      <Modal
        isOpen={!!resendingGuest}
        onClose={() => setResendingGuest(null)}
        title="Kirim Ulang E-Ticket PDF"
        description="Sistem akan me-regenerate berkas invoice E-Ticket resmi PDF A4 dan mengirimkannya langsung ke alamat email peserta."
        maxWidth="md"
      >
        {resendingGuest && (
          <form onSubmit={handleResendSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="font-semibold text-slate-900">
                {resendingGuest.nama} ({resendingGuest.pangkat})
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                NRP: {resendingGuest.nrp || '-'} &bull; Kursi: {resendingGuest.seat_number || 'Belum diatur'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Tujuan <span className="text-rose-500">*</span>
              </label>
              <Input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="nama@tni.mil.id"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Lampiran PDF resmi E-Ticket A4 bertanda tangan digital akan otomatis di-generate dan dilampirkan via SMTP.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setResendingGuest(null)}
                disabled={resendingLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={resendingLoading}
                className="gap-1.5"
              >
                {resendingLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Kirimkan E-Ticket</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
