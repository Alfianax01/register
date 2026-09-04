'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { StatOverviewCards } from '@/components/monitoring/StatOverviewCards';
import { MatraCompositionChart } from '@/components/monitoring/MatraCompositionChart';
import { PangkatCompositionChart } from '@/components/monitoring/PangkatCompositionChart';
import { OfficialReportPrint } from '@/components/monitoring/OfficialReportPrint';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatTimeID, getMatraBadgeInfo } from '@/lib/utils/formatters';
import { Guest, CheckinLog } from '@/types';
import {
  FileSpreadsheet,
  Printer,
  RotateCw,
  Clock,
  Radio
} from 'lucide-react';

export default function MonitoringPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [recentLogs, setRecentLogs] = useState<CheckinLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatsAndData = async () => {
    try {
      const [statsRes, guestsRes, logsRes, meRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/guests'),
        fetch('/api/checkin/logs?limit=8'),
        fetch('/api/auth/me')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (guestsRes.ok) {
        const guestsData = await guestsRes.json();
        setGuests(guestsData.guests || []);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setRecentLogs(logsData.logs || []);
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
    fetchStatsAndData();
    const interval = setInterval(fetchStatsAndData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    window.location.href = '/api/export';
  };

  const handlePrintOfficialReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="no-print">
        <AdminHeader
          user={currentUser}
          title="Dashboard Monitoring & Analitik Real-Time"
          subtitle="Pemantauan live presensi prajurit, sebaran matra, dan laporan kehadiran kedinasan"
        />
      </div>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 no-print">
        {/* Action Controls & Live Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              STREAM KEHADIRAN AKTIF (UPDATE TIAP 6 DETIK)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={handleExportCSV}
              className="text-xs"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-400" />
              <span>Ekspor Data Excel (CSV)</span>
            </Button>

            <Button
              variant="gold"
              size="md"
              onClick={handlePrintOfficialReport}
              className="text-xs font-bold shadow-md"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              <span>Cetak Laporan Resmi TNI</span>
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={fetchStatsAndData}
              className="text-xs"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Top KPI Cards */}
        {stats && <StatOverviewCards stats={stats} />}

        {/* Charts & Activity Ticker Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Matra Breakdown */}
          <div className="lg:col-span-4">
            {stats && (
              <MatraCompositionChart
                matraCount={stats.matraCount}
                totalGuests={stats.totalGuests}
              />
            )}
          </div>

          {/* Pangkat Breakdown */}
          <div className="lg:col-span-4">
            {stats && (
              <PangkatCompositionChart
                pangkatCount={stats.pangkatCount}
                totalGuests={stats.totalGuests}
              />
            )}
          </div>

          {/* Live Recent Check-in Feed */}
          <div className="lg:col-span-4">
            <Card className="p-5 h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-[#1E3B2F] pb-2 mb-3">
                <h3 className="text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Presensi Terkini</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Live</span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[290px] custom-scrollbar pr-1 text-xs">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-10">
                    Belum ada scan absensi.
                  </p>
                ) : (
                  recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-[#091711] border border-[#173022] flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <strong className="text-slate-100 font-semibold truncate block">
                          {log.guest_nama}
                        </strong>
                        <span className="text-[10px] text-[#D4AF37] block">
                          {log.guest_pangkat} ({log.guest_matra})
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0 font-mono text-[10px] text-slate-400">
                        {formatTimeID(log.scanned_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Printable Official Military Attendance Report */}
      <OfficialReportPrint guests={guests} />
    </div>
  );
}

