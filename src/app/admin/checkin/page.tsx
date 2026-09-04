'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { QrScannerView } from '@/components/checkin/QrScannerView';
import { ManualSearchForm } from '@/components/checkin/ManualSearchForm';
import { GuestVerifyModal } from '@/components/checkin/GuestVerifyModal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { OFFICIAL_CHECKPOINTS } from '@/lib/constants/checkpoints';
import { formatTimeID, getMatraBadgeInfo } from '@/lib/utils/formatters';
import { Checkpoint, CheckinLog } from '@/types';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Users,
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
        title="Scanner & Presensi Check-In Hari-H"
        subtitle="Pemindaian identitas QR Code dan validasi kehadiran multi-checkpoint"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Summary Bar & Checkpoint Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Checkpoint Dropdown Selector */}
          <Card className="lg:col-span-8 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-[#D4AF37]/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-[#D4AF37]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Lokasi Pemindaian Aktif:
                </span>
                <select
                  value={selectedCheckpoint}
                  onChange={(e) => setSelectedCheckpoint(e.target.value)}
                  className="bg-[#0A1711] text-[#F5E296] font-serif font-bold text-sm border border-[#1E3B2F] rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                >
                  {OFFICIAL_CHECKPOINTS.map(cp => (
                    <option key={cp.code} value={cp.code} className="bg-[#0A1711] text-slate-100">
                      {cp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-xs text-right hidden sm:block">
              {activeCheckpointObj.location}
            </p>
          </Card>

          {/* Quick Counter */}
          <Card className="lg:col-span-4 p-4 flex items-center justify-around border-emerald-700/40 bg-emerald-950/20">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Telah Hadir</span>
              <span className="text-xl font-serif font-bold text-emerald-400 block">
                {stats.present} <span className="text-xs text-slate-400 font-normal">/ {stats.total}</span>
              </span>
            </div>
            <div className="h-8 w-px bg-[#1E3B2F]" />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Persentase</span>
              <span className="text-xl font-serif font-bold text-[#F5E296] block">
                {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
              </span>
            </div>
          </Card>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Work Area: Left Scanner, Right Manual + Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Camera Scanner */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3 border-b border-[#1E3B2F] pb-2">
                <h3 className="text-sm font-serif font-bold text-slate-100">
                  Pemindai Kamera QR Code
                </h3>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  SISTEM SIAGA
                </span>
              </div>
              <QrScannerView onScan={handleProcessScan} isProcessing={isProcessing} />
            </Card>

            {/* Manual NRP Search Alternative */}
            <Card className="p-5">
              <h4 className="text-xs font-serif font-bold text-slate-200 mb-2 uppercase tracking-wide">
                Pencarian Manual (Alternatif Tanpa QR)
              </h4>
              <ManualSearchForm onManualCheckin={handleProcessScan} isProcessing={isProcessing} />
            </Card>
          </div>

          {/* Right: Live Log Stream Ticker */}
          <div className="lg:col-span-6">
            <Card className="p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-[#1E3B2F] pb-2">
                <h3 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>Aktivitas Kehadiran Terkini</span>
                </h3>
                <Button variant="ghost" size="sm" onClick={fetchLogsAndStats} className="text-xs text-slate-400">
                  <RotateCw className="w-3.5 h-3.5 mr-1" />
                  <span>Refresh</span>
                </Button>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[520px] custom-scrollbar pr-1">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-12">
                    Belum ada riwayat check-in yang tercatat hari ini.
                  </p>
                ) : (
                  recentLogs.map((log) => {
                    const badge = getMatraBadgeInfo(log.guest_matra);
                    return (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-[#091711] border border-[#173325] hover:border-[#2D5A47] transition-all flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-100 font-semibold">{log.guest_nama}</strong>
                              <Badge variant={log.guest_matra === 'AD' ? 'ad' : log.guest_matra === 'AL' ? 'al' : log.guest_matra === 'AU' ? 'au' : 'gold'} size="sm">
                                {log.guest_matra}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-[#D4AF37]">
                              {log.guest_pangkat} &bull; <span className="font-mono">NRP {log.guest_nrp}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="font-mono text-[10px] text-slate-400 block">
                            {formatTimeID(log.scanned_at)} WIB
                          </span>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            {log.checkpoint_code}
                          </span>
                        </div>
                      </div>
                    );
                  })
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

