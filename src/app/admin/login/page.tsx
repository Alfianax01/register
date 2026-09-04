'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, Lock, User, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Autentikasi gagal.');
        setLoading(false);
        return;
      }

      // Route based on role
      if (data.user?.role === 'PANITIA_AKOMODASI') {
        router.push('/admin/placement');
      } else {
        router.push('/admin/checkin');
      }
    } catch {
      setError('Gagal menghubungi server autentikasi.');
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-md bg-[#1E40AF] text-white mb-2 shadow-sm">
            <Shield className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Portal Panitia RAPIM TNI 2026
          </h1>
          <p className="text-xs text-slate-500">
            Masuk dengan kredensial dinas untuk mengelola presensi dan penempatan acara.
          </p>
        </div>

        {/* Login Box */}
        <Card className="p-6 sm:p-7 shadow-xs">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Nama Akun Dinas (Username)"
              required
              placeholder="Username panitia..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              autoComplete="username"
            />

            <Input
              label="Kata Sandi (Password)"
              required
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full text-xs font-semibold h-[42px] mt-1"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              <span>Masuk Sistem</span>
            </Button>
          </form>

          {/* Testing helper accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-medium text-slate-500 block">
              Pilih Akun Demo Cepat:
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('superadmin', 'tni2026prima')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 flex items-center justify-between text-xs transition-colors"
              >
                <span><strong>Super Admin</strong> (Letkol Radityo)</span>
                <span className="font-mono text-[11px] text-blue-600 font-medium">superadmin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('panitiagate', 'gatepass2026')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 flex items-center justify-between text-xs transition-colors"
              >
                <span><strong>Panitia Gate</strong> (Kapten Hendro)</span>
                <span className="font-mono text-[11px] text-emerald-600 font-medium">panitiagate</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('panitiawisma', 'wismapass2026')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 flex items-center justify-between text-xs transition-colors"
              >
                <span><strong>Panitia Akomodasi</strong> (Mayor Anita)</span>
                <span className="font-mono text-[11px] text-indigo-600 font-medium">panitiawisma</span>
              </button>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Halaman Registrasi</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
