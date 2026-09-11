'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { MatraCompositionChart } from '@/components/monitoring/MatraCompositionChart';
import { PangkatCompositionChart } from '@/components/monitoring/PangkatCompositionChart';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Link } from 'next-view-transitions';
import { formatTimeID } from '@/lib/utils/formatters';
import { Guest, CheckinLog } from '@/types';
import {
  Users,
  CheckCircle2,
  Clock,
  Armchair,
  QrCode,
  ArrowRight,
  Shield,
  RotateCw,
  Building2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [recentLogs, setRecentLogs] = useState<CheckinLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
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
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#f8fafc]">
      <AdminHeader
        user={currentUser}
        title="Dashboard Eksekutif"
        subtitle="Ringkasan operasional dan analitik kehadiran Rapim TNI 2026"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Pusat Komando & Pemantauan Rapim TNI 2026
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gedung Ahmad Yani, Mabes TNI Cilangkap &bull; Status Sistem: <span className="text-emerald-600 font-semibold">Siaga Aktif</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link href="/admin/scanner" className="flex-1 sm:flex-initial">
              <Button variant="primary" size="sm" className="w-full text-xs font-semibold bg-[#1E40AF] hover:bg-blue-700 h-9 px-3">
                <QrCode className="w-3.5 h-3.5 mr-1.5" />
                <span>Buka Scanner Gate</span>
              </Button>
            </Link>
            <Link href="/admin/guests" className="flex-1 sm:flex-initial">
              <Button variant="outline" size="sm" className="w-full text-xs font-medium h-9 px-3 border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
                <Users className="w-3.5 h-3.5 mr-1.5" />
                <span>Data Peserta</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDashboardData}
              className="text-slate-500 hover:text-slate-800 h-9 w-9 p-0 flex items-center justify-center"
              title="Refresh Data"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 1. Executive Top KPI Overview */}
        <section aria-label="Statistik Eksekutif">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Undangan
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
                  {stats?.totalGuests || 0}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">Prajurit & Delegasi</span>
              </Card>

              <Card className="p-4 bg-white border border-emerald-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Telah Hadir
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600">
                  {stats?.presentGuests || 0}
                </div>
                <span className="text-xs text-emerald-600/80 mt-1 block">
                  {stats?.percentagePresent || 0}% Kehadiran Gate
                </span>
              </Card>

              <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Belum Hadir
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-700">
                  {stats?.absentGuests || 0}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">Menunggu di gerbang</span>
              </Card>

              <Card className="p-4 bg-white border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Kursi & Ruang
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Armchair className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-indigo-600">
                  {stats?.occupiedSeats || 0} <span className="text-sm font-normal text-slate-400">/ {stats?.totalSeats || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats?.totalSeats ? Math.min(Math.round((stats.occupiedSeats / stats.totalSeats) * 100), 100) : 0}%`
                    }}
                  />
                </div>
              </Card>
            </div>
          )}
        </section>

        {/* 2. Charts Section: Matra & Pangkat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            {loading || !stats ? (
              <CardSkeleton />
            ) : (
              <MatraCompositionChart
                matraCount={stats.matraCount || {}}
                totalGuests={stats.totalGuests || 0}
              />
            )}
          </div>
          <div className="lg:col-span-6">
            {loading || !stats ? (
              <CardSkeleton />
            ) : (
              <PangkatCompositionChart
                pangkatCount={stats.pangkatCount || {}}
                totalGuests={stats.totalGuests || 0}
              />
            )}
          </div>
        </div>

        {/* 3. Bottom Grid: Live Activity Stream & Seat/Akomodasi Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Recent Check-in Activity */}
          <div className="lg:col-span-7">
            <Card className="p-5 h-full flex flex-col bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Aktivitas Presensi Terkini
                  </h3>
                </div>
                <Link href="/admin/checkin" className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
                  <span>Lihat Semua Log</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[360px] pr-1">
                {recentLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">
                    Belum ada riwayat check-in yang tercatat.
                  </p>
                ) : (
                  recentLogs.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 truncate">
                            <strong className="text-slate-900 font-semibold truncate">{log.guest_nama}</strong>
                            <Badge variant={log.guest_matra === 'AD' ? 'ad' : log.guest_matra === 'AL' ? 'al' : log.guest_matra === 'AU' ? 'au' : 'slate'} size="sm">
                              {log.guest_matra}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {log.guest_pangkat} &bull; <span className="font-mono">NRP {log.guest_nrp}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-mono text-[10px] text-slate-500 block">
                          {formatTimeID(log.scanned_at)} WIB
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium block">
                          {log.checkpoint_code}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Wisma & Room Allocation Summary */}
          <div className="lg:col-span-5">
            <Card className="p-5 h-full flex flex-col bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Status Akomodasi & Wisma
                  </h3>
                </div>
                <Link href="/admin/allocation" className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
                  <span>Kelola Kamar</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3 flex-1">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">Kamar Ditempatkan</span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {stats?.accommodationAssigned || 0} / {stats?.accommodationNeeded || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.accommodationNeeded ? Math.min(Math.round((stats.accommodationAssigned / stats.accommodationNeeded) * 100), 100) : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Dari total prajurit yang membutuhkan fasilitas wisma dinas
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 rounded-lg border border-slate-100 bg-white">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Wisma Kartika</span>
                    <strong className="text-slate-800 font-semibold block mt-0.5">Area Utama</strong>
                    <span className="text-[11px] text-slate-500">Pati TNI AD</span>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-100 bg-white">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Wisma Soedirman</span>
                    <strong className="text-slate-800 font-semibold block mt-0.5">Sayap Timur</strong>
                    <span className="text-[11px] text-slate-500">Pati Mabes & K/L</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-800">
                  <p className="font-medium leading-relaxed">
                    Penempatan kamar dan kursi otomatis disematkan pada saat peserta menyelesaikan registrasi dinas.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

