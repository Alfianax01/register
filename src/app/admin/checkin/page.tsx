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
  RotateCw
} from 'lucide-react';

export default function CheckinPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('GATE_UTAMA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentLogs, setRecentLogs] = useState<CheckinLog[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0 });

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
        setStats({
          total: statsData.stats.totalGuests,
          present: statsData.stats.presentGuests
        });
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

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Summary Bar & Checkpoint Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Checkpoint Dropdown Selector */}
          <Card className="lg:col-span-8 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">
                  Lokasi Checkpoint Aktif:
                </span>
                <select
                  value={selectedCheckpoint}
                  onChange={(e) => setSelectedCheckpoint(e.target.value)}
                  className="bg-white text-slate-900 font-semibold text-sm border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer mt-0.5"
                >
                  {OFFICIAL_CHECKPOINTS.map(cp => (
                    <option key={cp.code} value={cp.code}>
                      {cp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 max-w-xs text-right hidden sm:block">
              {activeCheckpointObj.location}
            </p>
          </Card>

          {/* Quick Counter */}
          <Card className="lg:col-span-4 p-4 flex items-center justify-around">
            <div className="text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Telah Hadir</span>
              <span className="text-xl font-bold font-mono text-emerald-600 block">
                {stats.present} <span className="text-xs text-slate-400 font-normal">/ {stats.total}</span>
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Persentase</span>
              <span className="text-xl font-bold font-mono text-slate-900 block">
                {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
              </span>
            </div>
          </Card>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Work Area: Left Scanner, Right Manual + Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Camera Scanner */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Pemindai Kamera QR
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem Siaga
                </span>
              </div>
              <ModernScanner onScanResult={handleProcessScan} isProcessing={isProcessing} />
            </Card>

            {/* Manual NRP Search Alternative */}
            <Card className="p-5">
              <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                Pencarian Manual (Alternatif Tanpa QR)
              </h4>
              <ManualSearchForm onManualCheckin={handleProcessScan} isProcessing={isProcessing} />
            </Card>
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
