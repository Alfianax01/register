'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Shield, Server, Database, KeyRound, Clock, UserCheck } from 'lucide-react';
import { useAdmin } from '@/components/layout/AdminContext';

export default function AdminSettingsPage() {
  const adminCtx = useAdmin();
  const user = adminCtx?.currentUser;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="space-y-1 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Administrasi Sistem
          </span>
          <Badge variant="primary" size="sm">
            v1.0.0
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pengaturan & Status Sistem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Konfigurasi parameter operasional dan informasi akun dinas yang aktif.
        </p>
      </div>

      {/* Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile Card */}
        <Card className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E40AF] flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Profil Akun Bertugas
              </h2>
              <span className="text-xs text-slate-500">
                Identitas sesi login petugas dinas
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Nama Petugas</span>
              <span className="font-semibold text-slate-900">{user?.nama || 'Petugas Dinas'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Username</span>
              <span className="font-mono text-slate-800">{user?.username || '-'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Hak Akses (Role)</span>
              <Badge variant="primary" size="sm">{user?.role || 'SUPER_ADMIN'}</Badge>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Masa Berlaku Sesi</span>
              <span className="text-slate-700">8 Jam (HMAC Signed)</span>
            </div>
          </div>
        </Card>

        {/* Security & System Info */}
        <Card className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Integritas Keamanan Sistem
              </h2>
              <span className="text-xs text-slate-500">
                Standar enkripsi dan persistensi
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Mode Rute Admin</span>
              <span className="text-emerald-700 font-semibold">Stealth 404 Rewrite Active</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Enkripsi Token Sesi</span>
              <span className="font-mono text-slate-800">HMAC-SHA256 (Web Crypto)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-500 font-medium">Basis Data Utama</span>
              <span className="text-slate-700">PostgreSQL (Dual-Layer Sync)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Serverless Runtime</span>
              <span className="text-slate-700">Next.js 14 App Router</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

