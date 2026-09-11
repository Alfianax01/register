'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { StatOverviewCards } from '@/components/monitoring/StatOverviewCards';
import { MatraCompositionChart } from '@/components/monitoring/MatraCompositionChart';
import { PangkatCompositionChart } from '@/components/monitoring/PangkatCompositionChart';
import { OfficialReportPrint } from '@/components/monitoring/OfficialReportPrint';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { formatTimeID } from '@/lib/utils/formatters';
import { Guest, CheckinLog } from '@/types';
import {
  FileSpreadsheet,
  FileText,
  Printer,
  RotateCw,
  Radio,
  Loader2,
  Database
} from 'lucide-react';

export default function MonitoringPage() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [recentLogs, setRecentLogs] = useState<CheckinLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

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

  const handleExport = async (format: 'excel' | 'pdf') => {
    const isExcel = format === 'excel';
    if (isExcel) setExportingExcel(true);
    else setExportingPdf(true);

    try {
      const endpoint = isExcel ? '/api/export' : '/api/export/pdf';
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

  const handlePrintOfficialReport = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="no-print">
        <AdminHeader
          user={currentUser}
          title="Monitoring & Analitik Real-Time"
          subtitle="Pemantauan live presensi prajurit, sebaran matra, dan laporan kehadiran kedinasan"
        />
      </div>

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6 no-print">
        {/* Action Controls & Live Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Stream Kehadiran Aktif (Sinkron 6 Detik)</span>
            </div>
            <a 
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-medium transition-colors border border-slate-200"
              title="Status Integrasi MySQL phpMyAdmin"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Status MySQL phpMyAdmin</span>
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={() => handleExport('excel')}
              disabled={exportingExcel || loading}
              className="text-xs h-[38px] gap-1.5 text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
              title="Ekspor Spreadsheet (.xlsx) Resmi"
            >
              {exportingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              )}
              <span>{exportingExcel ? 'Membuat laporan...' : 'Ekspor Excel'}</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => handleExport('pdf')}
              disabled={exportingPdf || loading}
              className="text-xs h-[38px] gap-1.5 text-slate-700 bg-white border-slate-200 hover:bg-slate-50"
              title="Unduh Lembar Presensi Resmi PDF (Landscape)"
            >
              {exportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
              ) : (
                <FileText className="w-4 h-4 text-rose-600" />
              )}
              <span>{exportingPdf ? 'Membuat laporan...' : 'Cetak PDF'}</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handlePrintOfficialReport}
              className="text-xs font-semibold h-[38px]"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              <span>Cetak Laporan</span>
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={fetchStatsAndData}
              className="text-xs h-[38px] px-2.5 text-slate-500 hover:text-slate-800"
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
            <Card className="p-5 h-full flex flex-col bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>Presensi Terkini</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">Live</span>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[290px] pr-1 text-xs">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">
                    Belum ada scan absensi.
                  </p>
                ) : (
                  recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:border-slate-300 transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <strong className="text-slate-900 font-medium truncate block">
                          {log.guest_nama}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">
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
