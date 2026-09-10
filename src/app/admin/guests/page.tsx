'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Guest, MatraType } from '@/types';
import { TNI_RANKS } from '@/lib/constants/ranks';
import { MATRA_COLORS, getMatraColor, safeMatraBg } from '@/constants/matraColors';
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
  AlertCircle,
  Loader2,
  Send,
  Eye,
  Armchair,
  Building,
  ShieldCheck,
  User,
  Phone
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

  // Export states
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Modals state
  const [viewingGuest, setViewingGuest] = useState<Guest | null>(null);

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
    } catch {
      showToast('Gagal memuat data peserta', { type: 'error' });
    } finally {
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

  const handleExport = async (format: 'excel' | 'pdf') => {
    const isExcel = format === 'excel';
    if (isExcel) setExportingExcel(true);
    else setExportingPdf(true);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (filterMatra) params.set('matra', filterMatra);
      if (filterStatus) params.set('status', filterStatus);

      const endpoint = isExcel ? `/api/export?${params.toString()}` : `/api/export/pdf?${params.toString()}`;
      const res = await fetch(endpoint);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || (isExcel ? 'Gagal mengekspor Excel' : 'Gagal mengekspor PDF');
        showToast(errMsg, { type: 'error' });
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get('content-disposition');
      let filename = isExcel
        ? `RAPIM-TNI-2026-Peserta-${new Date().toISOString().slice(0, 10)}.xlsx`
        : `Rekap_Peserta_RAPIM_TNI_${new Date().toISOString().slice(0, 10)}.pdf`;

      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(isExcel ? '✓ Excel berhasil dibuat' : '✓ PDF berhasil dibuat', { type: 'success' });
    } catch {
      showToast(isExcel ? 'Gagal mengekspor Excel' : 'Gagal mengekspor PDF', { type: 'error' });
    } finally {
      if (isExcel) setExportingExcel(false);
      else setExportingPdf(false);
    }
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setEditFormData({
      nama: guest.nama || '',
      pangkat: guest.pangkat || '',
      nrp: guest.nrp || '',
      jabatan: guest.jabatan || '',
      satker: guest.satker || '',
      satuan: guest.satuan || '',
      negara_instansi: guest.negara_instansi || '',
      matra: guest.matra || 'AD',
      email: guest.email || '',
      no_hp: guest.no_hp || '',
      seat_number: guest.seat_number || guest.seat_assignment || ''
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
          updates: {
            nama: editFormData.nama.trim(),
            pangkat: editFormData.pangkat.trim(),
            nrp: editFormData.nrp.trim(),
            jabatan: editFormData.jabatan.trim(),
            satker: editFormData.satker.trim(),
            satuan: editFormData.satuan.trim(),
            negara_instansi: editFormData.negara_instansi.trim(),
            matra: editFormData.matra,
            email: editFormData.email.trim(),
            no_hp: editFormData.no_hp ? editFormData.no_hp.trim() : undefined,
            seat_number: editFormData.seat_number.trim() || undefined,
            seat_assignment: editFormData.seat_number.trim() || undefined
          }
        })
      });

      if (res.ok) {
        showToast(`Profil ${editFormData.nama} berhasil diperbarui`, { type: 'success' });
        setEditingGuest(null);
        fetchGuests();
      } else {
        const err = await res.json();
        showToast(err.message || 'Gagal menyimpan perubahan data', { type: 'error' });
      }
    } catch {
      showToast('Terjadi gangguan jaringan saat menyimpan data', { type: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingGuest) return;
    setDeletingLoading(true);
    try {
      const res = await fetch(`/api/guests?id=${deletingGuest.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast(`Peserta ${deletingGuest.nama} berhasil dihapus dari sistem`, { type: 'success' });
        setDeletingGuest(null);
        fetchGuests();
      } else {
        const err = await res.json();
        showToast(err.message || 'Gagal menghapus peserta', { type: 'error' });
      }
    } catch {
      showToast('Gagal menghubungi server database', { type: 'error' });
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleResendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendingGuest || !resendEmail) return;

    setResendingLoading(true);
    try {
      const res = await fetch(`/api/ticket/${resendingGuest.qr_token}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`E-Ticket resmi berhasil dikirim ke ${resendEmail}`, { type: 'success' });
        setResendingGuest(null);
        fetchGuests();
      } else {
        showToast(data.error || data.message || 'Gagal mengirim email E-Ticket', { type: 'error' });
      }
    } catch {
      showToast('Gagal mengirimkan instruksi ke server mail', { type: 'error' });
    } finally {
      setResendingLoading(false);
    }
  };

  const getStatusAlokasi = (g: Guest) => {
    const hasSeat = Boolean(g.seat_number || g.seat_assignment || g.assignment?.seat_code);
    const needsRoom = g.butuh_akomodasi === 1;
    const hasRoom = needsRoom && (
      Boolean(g.room_id) ||
      Boolean(g.room_number && g.room_number !== '-') ||
      Boolean(g.assignment?.room_code && g.assignment.room_code !== '-') ||
      Boolean(g.wisma_assignment && g.wisma_assignment !== 'Tidak Menginap')
    );

    if (hasSeat && (!needsRoom || hasRoom)) {
      return {
        status: 'LENGKAP',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
      };
    }
    if (hasSeat && needsRoom && !hasRoom) {
      return {
        status: 'KURSI SAJA',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-300 font-bold'
      };
    }
    if (!hasSeat && hasRoom) {
      return {
        status: 'AKOMODASI SAJA',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold'
      };
    }
    return {
      status: 'BELUM DIALOKASIKAN',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
    };
  };

  const renderMatraBadge = (matra?: string | null) => {
    const spec = getMatraColor(matra);
    const shortLabel = spec.key === 'TNI_AD' ? 'TNI AD' :
                       spec.key === 'TNI_AU' ? 'TNI AU' :
                       spec.key === 'TNI_AL' ? 'TNI AL' :
                       spec.key === 'MABES' ? 'MABES' :
                       spec.key === 'SIPIL' ? 'SIPIL' :
                       spec.key === 'KEMENTERIAN' ? 'KEMEN' : 'TNI';
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black text-white shadow-2xs"
        style={{ backgroundColor: safeMatraBg(matra) }}
      >
        {shortLabel}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    if (status === 'CHECK_IN') {
      return (
        <span
          className="inline-flex items-center justify-center gap-1.5 w-24 py-1 rounded-full text-[10px] font-black text-white bg-[#16A34A] shadow-xs"
          title="Peserta telah Check-In di Gate"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>CHECK-IN</span>
        </span>
      );
    }

    return (
      <span
        className="inline-flex items-center justify-center gap-1 w-24 py-1 rounded-full text-[10px] font-bold text-white bg-[#D97706] shadow-xs"
        title="Peserta Terdaftar (Belum Check-In di Gate)"
      >
        <Clock className="w-3 h-3 stroke-[2.5]" />
        <span>REGISTRASI</span>
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
      <AdminHeader
        title="Data Peserta"
        subtitle="Manajemen direktori prajurit, status kehadiran gate, dan berkas E-Ticket resmi RAPIM TNI 2026"
        user={currentUser}
      />

      <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] w-full mx-auto">
        {/* Top Actions & Filters Card */}
        <Card className="p-4 bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama, NRP, Jabatan, atau Token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
              />
            </form>

            {/* Export & Refresh Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchGuests}
                disabled={loading}
                className="gap-1.5 text-xs text-slate-700 bg-white border-slate-200"
                title="Muat ulang direktori data peserta"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
                disabled={exportingExcel || loading}
                className="gap-1.5 text-xs text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
                title="Ekspor Spreadsheet (.xlsx) Resmi"
              >
                {exportingExcel ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{exportingExcel ? 'Membuat laporan...' : 'Ekspor Excel'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
                disabled={exportingPdf || loading}
                className="gap-1.5 text-xs text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
                title="Unduh Lembar Presensi Resmi PDF (Landscape)"
              >
                {exportingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                )}
                <span>{exportingPdf ? 'Membuat laporan...' : 'Cetak Presensi PDF'}</span>
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
              aria-label="Filter Matra"
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
              aria-label="Filter Status"
              className="bg-white text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">Semua Status Presensi</option>
              <option value="REGISTRASI">Registrasi</option>
              <option value="CHECK_IN">Check-In</option>
            </select>

            <span className="ml-auto text-[11px] text-slate-500 font-mono">
              Total: <strong>{guests.length}</strong> Peserta
            </span>
          </div>
        </Card>

        {/* Compact Guests Table */}
        <Card className="overflow-hidden bg-white border border-slate-200 shadow-xs">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full min-w-[1440px] table-fixed text-left text-xs border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 shadow-xs">
                <tr className="text-slate-600 uppercase font-semibold text-[10px] tracking-wider bg-slate-50/95">
                  <th className="py-2.5 px-3 w-[50px] text-center sticky left-0 z-30 bg-slate-50 border-r border-slate-200/80">No</th>
                  <th className="py-2.5 px-3 w-[220px] sticky left-[50px] z-30 bg-slate-50 border-r border-slate-200/80 shadow-[2px_0_4px_rgba(0,0,0,0.03)]">Nama Peserta</th>
                  <th className="py-2.5 px-3 w-[85px] text-center">Matra</th>
                  <th className="py-2.5 px-3 w-[130px]">Pangkat</th>
                  <th className="py-2.5 px-3 w-[95px] text-center">Kursi</th>
                  <th className="py-2.5 px-3 w-[140px]">Gedung</th>
                  <th className="py-2.5 px-3 w-[150px]">Ruangan</th>
                  <th className="py-2.5 px-3 w-[135px]">Wisma</th>
                  <th className="py-2.5 px-3 w-[85px] text-center">Kamar</th>
                  <th className="py-2.5 px-3 w-[140px] text-center">Status Alokasi</th>
                  <th className="py-2.5 px-3 w-[125px] text-center">Status Kehadiran</th>
                  <th className="py-2.5 px-3 w-[110px] text-center sticky right-0 z-30 bg-slate-50 border-l border-slate-200/80 shadow-[-2px_0_4px_rgba(0,0,0,0.03)]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 [&>tr:nth-child(even)]:bg-slate-50/60">
                {loading ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400 font-mono">
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Memuat data direktori peserta...</span>
                      </div>
                    </td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-400">
                      Tidak ada peserta yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  guests.map((g, idx) => {
                    const alokasi = getStatusAlokasi(g);
                    const seatNum = g.seat_number || g.seat_assignment || g.assignment?.seat_code || '-';
                    const gedung = g.building || g.assignment?.gedung || g.assignment?.building || 'Gedung Ahmad Yani';
                    const ruangan = g.room || g.assignment?.seat_area || g.assignment?.room || 'Ruang Sidang Utama';
                    const wisma = g.butuh_akomodasi === 0 ? 'Tidak Menginap' : (g.wisma_name || g.assignment?.wisma_name || g.wisma_assignment || '-');
                    const kamar = g.butuh_akomodasi === 0 ? '-' : (g.room_number || g.assignment?.room_code || '-');

                    return (
                      <tr
                        key={g.id}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        {/* 1. No (Sticky Kiri) */}
                        <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px] sticky left-0 z-10 bg-white group-hover:bg-blue-50/40 border-r border-slate-100">
                          {idx + 1}
                        </td>

                        {/* 2. Nama Peserta (Sticky Kiri) */}
                        <td className="py-2 px-3 max-w-[220px] sticky left-[50px] z-10 bg-white group-hover:bg-blue-50/40 border-r border-slate-100 shadow-[2px_0_4px_rgba(0,0,0,0.03)]">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-slate-900 font-semibold truncate block"
                              title={g.nama}
                            >
                              {g.nama}
                            </span>
                            {g.email_status === 'BOUNCED' ? (
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded flex-shrink-0 gap-0.5"
                                title={`Email Bounced: ${g.last_email_error || 'Alamat ditolak server tujuan'}`}
                              >
                                <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
                                <span>Bounced</span>
                              </span>
                            ) : g.email_status === 'FAILED' ? (
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded flex-shrink-0 gap-0.5"
                                title={`Email Gagal Terkirim: ${g.last_email_error || 'Gagal via SMTP'}`}
                              >
                                <AlertCircle className="w-2.5 h-2.5 text-amber-500" />
                                <span>Gagal</span>
                              </span>
                            ) : (g.email_status === 'SENT' || g.emailSent) ? (
                              <span
                                className="inline-flex items-center text-[10px] text-emerald-600 flex-shrink-0"
                                title="E-Ticket telah terkirim via email"
                              >
                                <Mail className="w-3 h-3" />
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* 3. Matra */}
                        <td className="py-2 px-3 text-center">
                          {renderMatraBadge(g.matra)}
                        </td>

                        {/* 4. Pangkat */}
                        <td className="py-2 px-3 text-slate-800 font-medium truncate" title={g.pangkat}>
                          {g.pangkat}
                        </td>

                        {/* 5. Nomor Kursi */}
                        <td className="py-2 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs text-blue-900 bg-blue-50 border border-blue-200">
                            {seatNum}
                          </span>
                        </td>

                        {/* 6. Gedung */}
                        <td className="py-2 px-3 text-slate-700 font-medium truncate" title={gedung}>
                          {gedung}
                        </td>

                        {/* 7. Ruangan */}
                        <td className="py-2 px-3 text-slate-600 truncate" title={ruangan}>
                          {ruangan}
                        </td>

                        {/* 8. Wisma */}
                        <td className="py-2 px-3 text-slate-700 truncate" title={wisma}>
                          {wisma}
                        </td>

                        {/* 9. Kamar */}
                        <td className="py-2 px-3 text-center font-mono text-xs font-semibold text-slate-800">
                          {kamar}
                        </td>

                        {/* 10. Status Alokasi */}
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${alokasi.badgeClass}`}>
                            {alokasi.status}
                          </span>
                        </td>

                        {/* 11. Status Kehadiran */}
                        <td className="py-2 px-3 text-center">
                          {renderStatusBadge(g.status_kehadiran)}
                        </td>

                        {/* 12. Aksi (Sticky Kanan) */}
                        <td className="py-2 px-3 text-center sticky right-0 z-10 bg-white group-hover:bg-blue-50/40 border-l border-slate-100 shadow-[-2px_0_4px_rgba(0,0,0,0.03)]">
                          <div className="flex items-center justify-center gap-1">
                            {/* Lihat Detail */}
                            <button
                              type="button"
                              onClick={() => setViewingGuest(g)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Lihat Profil & Detail Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Profil */}
                            <button
                              type="button"
                              onClick={() => openEditModal(g)}
                              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Sunting Informasi Peserta"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Hapus Peserta */}
                            <button
                              type="button"
                              onClick={() => setDeletingGuest(g)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Hapus Data Peserta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      {/* MODAL LIHAT DETAIL PESERTA */}
      {/* ========================================================== */}
      <Modal
        isOpen={!!viewingGuest}
        onClose={() => setViewingGuest(null)}
        title="Detail Profil Peserta"
        description="Informasi lengkap identitas kedinasan, penempatan, dan status kehadiran."
        maxWidth="lg"
      >
        {viewingGuest && (
          <div className="space-y-4">
            {/* Header Profil */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {viewingGuest.nama}
                  </h3>
                  {renderMatraBadge(viewingGuest.matra)}
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {viewingGuest.pangkat} &bull; NRP/NIP: <span className="font-mono">{viewingGuest.nrp || '-'}</span>
                </p>
              </div>
              <div>
                {renderStatusBadge(viewingGuest.status_kehadiran)}
              </div>
            </div>

            {/* Grid 4 Bagian Sesuai Spesifikasi */}
            <div className="space-y-3 text-xs">
              {/* 1. IDENTITAS */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider block border-b border-slate-100 pb-1">
                  1. Identitas Peserta
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nama Lengkap</span>
                    <p className="font-semibold text-slate-800">{viewingGuest.nama}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">NRP / NIP</span>
                    <p className="font-mono font-semibold text-slate-800">{viewingGuest.nrp || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Pangkat & Matra</span>
                    <p className="font-semibold text-slate-800">{viewingGuest.pangkat} ({viewingGuest.matra})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Jabatan Kedinasan</span>
                    <p className="font-semibold text-slate-800">{viewingGuest.jabatan || '-'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 text-[10px] block">Kesatuan / Satker</span>
                    <p className="font-semibold text-slate-800">{viewingGuest.kesatuan || viewingGuest.satuan || viewingGuest.satker || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Instansi / Negara</span>
                    <p className="font-semibold text-slate-800">{viewingGuest.negara_instansi || 'Indonesia / TNI'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Kontak WhatsApp & Email</span>
                    <p className="font-mono text-slate-800">{viewingGuest.no_hp || viewingGuest.phone || '-'}</p>
                    <p className="text-slate-600 truncate">{viewingGuest.email || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 2. PENEMPATAN ACARA */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg space-y-2">
                <span className="text-blue-700 font-bold uppercase text-[10px] tracking-wider block border-b border-blue-100 pb-1 flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5" />
                  <span>2. Penempatan Acara (Sidang Pleno)</span>
                </span>
                <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
                  <div className="p-2 bg-white rounded-md border border-blue-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block">Nomor Kursi</span>
                    <p className="font-mono font-bold text-base text-blue-900">
                      {viewingGuest.seat_number || viewingGuest.seat_assignment || 'Belum Ditentukan'}
                    </p>
                    <span className="text-[9px] text-blue-600 block">{viewingGuest.seat_block ? `Blok ${viewingGuest.seat_block}` : 'Blok Terpilih'}</span>
                  </div>
                  <div className="p-2 bg-white rounded-md border border-blue-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block">Gedung</span>
                    <p className="font-semibold text-slate-800 truncate" title={viewingGuest.building || 'Gedung Ahmad Yani'}>
                      {viewingGuest.building || 'Gedung Ahmad Yani'}
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded-md border border-blue-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block">Ruangan</span>
                    <p className="font-semibold text-slate-800 truncate" title={viewingGuest.room_name || viewingGuest.room || 'Ruang Sidang Utama'}>
                      {viewingGuest.room_name || viewingGuest.room || 'Ruang Sidang Utama'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. AKOMODASI */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="text-slate-600 font-bold uppercase text-[10px] tracking-wider block border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>3. Akomodasi & Penginapan</span>
                </span>
                <div className="grid grid-cols-3 gap-2 pt-0.5">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Wisma</span>
                    <p className="font-semibold text-slate-800">
                      {viewingGuest.butuh_akomodasi === 0 || viewingGuest.wisma_name === 'Tidak Menginap'
                        ? 'Tidak Menginap'
                        : (viewingGuest.wisma_name || '-')}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Nomor Kamar</span>
                    <p className="font-mono font-semibold text-slate-800">
                      {viewingGuest.butuh_akomodasi === 0 || viewingGuest.wisma_name === 'Tidak Menginap'
                        ? '-'
                        : (viewingGuest.room_number || '-')}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Bed</span>
                    <p className="font-mono font-semibold text-slate-800">
                      {viewingGuest.butuh_akomodasi === 0 || viewingGuest.wisma_name === 'Tidak Menginap'
                        ? '-'
                        : (viewingGuest.bed_number ? `Bed ${viewingGuest.bed_number}` : '-')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. KEHADIRAN */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <span className="text-slate-600 font-bold uppercase text-[10px] tracking-wider block border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>4. Kehadiran & Verifikasi Gate</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Status Kehadiran</span>
                    <div className="pt-1">{renderStatusBadge(viewingGuest.status_kehadiran)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Gate Check-In</span>
                    <p className="font-semibold text-slate-800">{viewingGuest.checkin_gate || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Waktu Check-In</span>
                    <p className="font-mono text-[11px] text-slate-800">
                      {viewingGuest.checkin_time || viewingGuest.waktu_kehadiran_pertama 
                        ? new Date(viewingGuest.checkin_time || viewingGuest.waktu_kehadiran_pertama!).toLocaleString('id-ID')
                        : '-'}
                    </p>
                  </div>
                </div>
                {viewingGuest.waktu_kehadiran_pertama && (
                  <p className="text-[11px] text-emerald-700 font-medium pt-1">
                    Waktu Scan Presensi: {new Date(viewingGuest.waktu_kehadiran_pertama).toLocaleString('id-ID')}
                  </p>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Token: {viewingGuest.qr_token}</span>
                  <span>ID: {viewingGuest.registration_id || '-'}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Link
                  href={`/ticket/${viewingGuest.qr_token}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Buka E-Ticket</span>
                </Link>

                <Link
                  href={`/api/ticket/${viewingGuest.qr_token}/pdf`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setResendEmail(viewingGuest.email || '');
                    setResendingGuest(viewingGuest);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Kirim Email</span>
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingGuest(null)}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================== */}
      {/* MODAL EDIT DATA PESERTA */}
      {/* ========================================================== */}
      <Modal
        isOpen={!!editingGuest}
        onClose={() => setEditingGuest(null)}
        title="Sunting Profil Peserta"
        description="Perbarui identitas kedinasan, penempatan kursi, dan kontak resmi peserta."
        maxWidth="lg"
      >
        {editingGuest && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap (termasuk gelar) <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={editFormData.nama}
                  maxLength={150}
                  onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                  placeholder="Contoh: Jenderal TNI Agus Subiyanto, S.E., M.Si."
                  required
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
                  Nomor WhatsApp / HP (Opsional)
                </label>
                <Input
                  value={editFormData.no_hp}
                  onChange={(e) => setEditFormData({ ...editFormData, no_hp: e.target.value })}
                  placeholder="Contoh: 08123456789"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email (Wajib) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="nama@tni.mil.id"
                  required
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
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-900">
                  {resendingGuest.nama} ({resendingGuest.pangkat})
                </div>
                {resendingGuest.email_status === 'BOUNCED' ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 rounded">
                    BOUNCED
                  </span>
                ) : resendingGuest.email_status === 'FAILED' ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded">
                    FAILED
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded">
                    {resendingGuest.email_status || 'READY'}
                  </span>
                )}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                NRP: {resendingGuest.nrp || '-'} &bull; Kursi: {resendingGuest.seat_number || 'Belum diatur'}
              </div>
            </div>

            {resendingGuest.email_status === 'BOUNCED' && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-1 text-rose-800">
                <div className="font-semibold flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Peringatan: Alamat Email Sebelumnya Memantul (BOUNCED)</span>
                </div>
                <p className="text-[11px] text-rose-600 leading-relaxed">
                  Server mail penerima menolak alamat ini ({resendingGuest.last_email_error || '550 Recipient address rejected: User unknown'}).
                  <strong className="block mt-0.5 font-semibold text-rose-800">Mohon perbaiki alamat email peserta di bawah ke alamat yang valid sebelum menekan Kirimkan E-Ticket.</strong>
                </p>
              </div>
            )}

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
