'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { ModernScanner } from '@/components/scanner/ModernScanner';
import { ManualSearchForm } from '@/components/checkin/ManualSearchForm';
import { GuestVerifyModal } from '@/components/checkin/GuestVerifyModal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OFFICIAL_CHECKPOINTS } from '@/lib/constants/checkpoints';
import { formatTimeID } from '@/lib/utils/formatters';
import { CheckinLog } from '@/types';
import {
  MapPin,
  Clock,
  AlertCircle,
  RotateCw,
  Users,
  CheckCircle2,
  TrendingUp,
  QrCode
} from 'lucide-react';

export default function CheckinPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('GATE_UTAMA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState<CheckinLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });

  const fetchLogsAndStats = async () => {
    try {
      const [logsRes, statsRes, meRes] = await Promise.all([
        fetch('/api/checkin/logs?limit=15'),
        fetch('/api/stats'),
        fetch('/api/auth/me')
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setRecentLogs(logsData.logs || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.stats) {
          setStats({
            total: statsData.stats.totalGuests || 0,
            present: statsData.stats.presentGuests || 0,
            absent: statsData.stats.absentGuests || 0,
            percentage: statsData.stats.percentagePresent || 0
          });
        }
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }
    } catch {}
  };

  useEffect(() => {
    fetchLogsAndStats();
    const interval = setInterval(fetchLogsAndStats, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleProcessScan = async (scannedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const isUUID = /^[0-9a-fA-F-]{36}$/.test(scannedText.trim());

      const res = await fetch('/api/checkin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: isUUID ? scannedText.trim() : undefined,
          nrp: !isUUID ? scannedText.trim() : undefined,
          checkpoint_code: selectedCheckpoint
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Data tamu tidak valid');
        setIsProcessing(false);
        return;
      }

      setVerifyResult(data);
      setIsModalOpen(true);
      fetchLogsAndStats();
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke basis data presensi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeCheckpointObj = OFFICIAL_CHECKPOINTS.find(c => c.code === selectedCheckpoint) || OFFICIAL_CHECKPOINTS[0];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <AdminHeader
        user={currentUser}
        title="Scanner & Presensi Check-In"
        subtitle="Pemindaian identitas QR Code dan validasi kehadiran per checkpoint"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
        {/* 1. Statistik Kehadiran Grid: 2 Kolom Mobile, 4 Kolom Desktop */}
        <section aria-label="Statistik Kehadiran">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-3.5 sm:p-4 bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Total Undangan
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 leading-tight">
                {stats.total}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Peserta terdaftar</span>
            </Card>

            <Card className="p-3.5 sm:p-4 bg-white border border-emerald-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">
                  Telah Hadir
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 leading-tight">
                {stats.present}
              </div>
              <span className="text-[10px] text-emerald-600/80 mt-1 block">Sudah check-in gate</span>
            </Card>

            <Card className="p-3.5 sm:p-4 bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Belum Hadir
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-700 leading-tight">
                {stats.absent}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Menunggu kehadiran</span>
            </Card>

            <Card className="p-3.5 sm:p-4 bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Persentase
                </span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 leading-tight">
                {stats.percentage}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats.percentage, 100)}%` }}
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Checkpoint Dropdown Selector Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor="checkpoint-select-checkin" className="text-[11px] text-slate-500 font-medium block">
                Lokasi Checkpoint Aktif:
              </label>
              <select
                id="checkpoint-select-checkin"
                value={selectedCheckpoint}
                onChange={(e) => setSelectedCheckpoint(e.target.value)}
                className="bg-white text-slate-900 font-semibold text-xs sm:text-sm border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer mt-0.5 w-full sm:w-auto"
              >
                {OFFICIAL_CHECKPOINTS.map(cp => (
                  <option key={cp.code} value={cp.code}>
                    {cp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-500 max-w-xs text-left sm:text-right">
            {activeCheckpointObj.location}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* 2. Scanner Gate (Kamera + Manual) & 4. Aktivitas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left: Camera Scanner & Manual Input */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#1E40AF]" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Pemindai Kamera QR
                  </h3>
                </div>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem Siaga
                </span>
              </div>
              <ModernScanner onScanResult={handleProcessScan} isProcessing={isProcessing} />
            </Card>

            {/* Manual NRP Search Alternative */}
            <Card className="p-4 sm:p-5">
              <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                Pencarian Manual (Alternatif Tanpa QR)
              </h4>
              <ManualSearchForm onManualCheckin={handleProcessScan} isProcessing={isProcessing} />
            </Card>

            {/* 3. Hasil Scan: Kartu Verifikasi Tamu Terakhir */}
            {verifyResult && verifyResult.guest && (
              <Card className="p-4 sm:p-5 border-2 border-emerald-500/80 bg-emerald-50/40 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                        Hasil Scan: {verifyResult.alreadyCheckedIn ? 'Sudah Pernah Hadir' : 'Berhasil Diverifikasi'}
                      </h3>
                      <span className="text-[11px] text-emerald-700">
                        {verifyResult.alreadyCheckedIn
                          ? `Tamu telah check-in sebelumnya pada ${verifyResult.previousTimestamp ? formatTimeID(verifyResult.previousTimestamp) + ' WIB' : 'hari ini'}`
                          : 'Kehadiran berhasil dicatat ke sistem database'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={verifyResult.guest.matra === 'AD' ? 'ad' : verifyResult.guest.matra === 'AL' ? 'al' : verifyResult.guest.matra === 'AU' ? 'au' : 'success'} size="sm">
                    {verifyResult.guest.matra || 'TNI'}
                  </Badge>
                </div>

                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Nama Lengkap & Pangkat</span>
                    <strong className="text-slate-900 font-semibold text-sm block">
                      {verifyResult.guest.gelar_depan ? `${verifyResult.guest.gelar_depan} ` : ''}
                      {verifyResult.guest.nama}
                      {verifyResult.guest.gelar_belakang ? `, ${verifyResult.guest.gelar_belakang}` : ''}
                    </strong>
                    <span className="text-slate-600 text-xs">{verifyResult.guest.pangkat} &bull; NRP {verifyResult.guest.nrp}</span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Jabatan & Instansi</span>
                    <strong className="text-slate-900 font-medium block truncate">
                      {verifyResult.guest.jabatan}
                    </strong>
                    <span className="text-slate-600 text-xs block truncate">{verifyResult.guest.satker || verifyResult.guest.satuan}</span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Alokasi Kursi Sidang</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {verifyResult.guest.seat_number || 'Belum Ditentukan'}
                    </span>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-slate-500 block text-[10px] uppercase tracking-wider">Status Validasi</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      HADIR &bull; Checkpoint {selectedCheckpoint}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right: Live Log Stream Ticker */}
          <div className="lg:col-span-6">
            <Card className="p-5 h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Aktivitas Kehadiran Terkini</span>
                </h3>
                <Button variant="ghost" size="sm" onClick={fetchLogsAndStats} className="text-xs text-slate-500 hover:text-slate-800 h-7 px-2">
                  <RotateCw className="w-3.5 h-3.5 mr-1" />
                  <span>Refresh</span>
                </Button>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-16">
                    Belum ada riwayat check-in yang tercatat hari ini.
                  </p>
                ) : (
                  recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900 font-semibold">{log.guest_nama}</strong>
                            <Badge variant={log.guest_matra === 'AD' ? 'ad' : log.guest_matra === 'AL' ? 'al' : log.guest_matra === 'AU' ? 'au' : 'slate'} size="sm">
                              {log.guest_matra}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {log.guest_pangkat} &bull; <span className="font-mono">NRP {log.guest_nrp}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-mono text-[10px] text-slate-500 block">
                          {formatTimeID(log.scanned_at)} WIB
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium">
                          {log.checkpoint_code}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Guest Verify Modal Popup */}
      <GuestVerifyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={verifyResult}
      />
    </div>
  );
}
