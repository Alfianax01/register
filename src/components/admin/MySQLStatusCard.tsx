'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Database, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Server, Table, HardDrive } from 'lucide-react';

interface MySQLHealthResponse {
  status: 'HEALTHY' | 'UNHEALTHY' | 'NOT_CONFIGURED' | 'ERROR';
  connected: boolean;
  configured: boolean;
  host?: string;
  port?: number;
  user?: string;
  database?: string;
  tables?: string[];
  recordCount?: { guests: number; peserta: number };
  error?: string;
  code?: string;
  help?: string;
  timestamp?: string;
}

export function MySQLStatusCard() {
  const [health, setHealth] = useState<MySQLHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  const checkConnection = async (init = false) => {
    if (init) setInitLoading(true);
    else setLoading(true);

    try {
      const url = init ? '/api/health/mysql?init=true' : '/api/health/mysql';
      const res = await fetch(url, { cache: 'no-store' });
      const data: MySQLHealthResponse = await res.json();
      setHealth(data);
    } catch (err: any) {
      setHealth({
        status: 'ERROR',
        connected: false,
        configured: true,
        error: err?.message || 'Gagal menghubungi endpoint health check MySQL'
      });
    } finally {
      setLoading(false);
      setInitLoading(false);
    }
  };

  useEffect(() => {
    checkConnection(false);
  }, []);

  const isConnected = health?.connected === true;
  const isConfigured = health?.configured !== false;

  return (
    <Card className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700'
              : !isConfigured
              ? 'bg-amber-50 text-amber-700'
              : 'bg-rose-50 text-rose-700'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Integrasi Database phpMyAdmin (MySQL)
              </h2>
              {isConnected ? (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Terhubung
                </Badge>
              ) : !isConfigured ? (
                <Badge variant="warning" size="sm">
                  <AlertTriangle className="w-3 h-3 mr-1 inline" /> Belum Konfigurasi
                </Badge>
              ) : (
                <Badge variant="danger" size="sm">
                  <XCircle className="w-3 h-3 mr-1 inline" /> Terputus
                </Badge>
              )}
            </div>
            <span className="text-xs text-slate-500">
              Sinkronisasi data registrasi publik & admin ke database MySQL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkConnection(false)}
            disabled={loading || initLoading}
            className="text-xs h-8 gap-1 border-slate-200 hover:bg-slate-50"
            title="Cek Status Koneksi"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Cek Status</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => checkConnection(true)}
            disabled={loading || initLoading}
            className="text-xs h-8 gap-1 bg-slate-900 hover:bg-slate-800 text-white"
            title="Inisialisasi atau buat tabel rapim_tni jika belum ada"
          >
            <HardDrive className={`w-3.5 h-3.5 ${initLoading ? 'animate-spin' : ''}`} />
            <span>Init / Auto-Migrate</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" /> Host & Database
          </div>
          <div className="font-mono text-slate-800 break-all">
            {health?.host || '127.0.0.1'}:{health?.port || 3306}
          </div>
          <div className="text-slate-600">
            Database: <span className="font-semibold text-slate-900 font-mono">{health?.database || 'rapim_tni'}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-slate-400" /> Sinkronisasi Tabel (Dual-Sync)
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Tabel `guests`:</span>
            <span className="font-semibold font-mono text-slate-900">{health?.recordCount?.guests ?? '-'} baris</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Tabel `peserta`:</span>
            <span className="font-semibold font-mono text-slate-900">{health?.recordCount?.peserta ?? '-'} baris</span>
          </div>
        </div>
      </div>

      {health?.tables && health.tables.length > 0 && (
        <div className="text-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500">Tabel Terdeteksi di Database:</span>
          <div className="flex flex-wrap gap-1.5">
            {health.tables.map((tbl) => (
              <span key={tbl} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                {tbl}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Error & Diagnostic Guidance */}
      {!isConnected && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="flex items-start gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Penyebab MySQL Belum Terkoneksi:</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            {health?.error || 'Tidak dapat terhubung ke MySQL daemon.'}
          </p>
          {health?.help && (
            <div className="p-2.5 bg-white/70 rounded-lg text-amber-950 font-sans border border-amber-200/60 leading-relaxed">
              <strong>Solusi:</strong> {health.help}
            </div>
          )}
          <div className="text-[11px] text-amber-700 leading-normal pt-1 border-t border-amber-200/50">
            💡 <strong>Info Arsitektur:</strong> Sistem ini menggunakan <em>Dual-Layer Resilience</em>. Registrasi peserta <strong>tetap berhasil 100%</strong> tersimpan di storage primer JSON/Postgres lokal server Next.js meskipun MySQL belum aktif, dan otomatis sinkron saat MySQL kembali online.
          </div>
        </div>
      )}
    </Card>
  );
}

