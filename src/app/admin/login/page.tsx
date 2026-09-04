'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { Lock, User, KeyRound, AlertCircle, ShieldAlert } from 'lucide-react';
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
      setError('Gagal menghubungi server keamanan.');
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-[#070E0B] flex flex-col items-center justify-center p-4 relative">
      {/* Flag bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 flex z-50">
        <div className="h-full w-1/2 bg-[#B91C1C]" />
        <div className="h-full w-1/2 bg-[#FFFFFF]" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <TniEmblem matra="MABES" size="lg" />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
            MARKAS BESAR TENTARA NASIONAL INDONESIA
          </span>
          <h1 className="text-2xl font-serif font-black text-slate-100">
            Portal Panitia RAPIM TNI 2026
          </h1>
          <p className="text-xs text-slate-400">
            Masukkan akun kredensial dinas untuk mengakses dashboard check-in dan manajemen acara.
          </p>
        </div>

        {/* Login Box */}
        <Card variant="gold-border" className="p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Nama Akun Dinas (Username)"
              required
              placeholder="Username panitia..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="username"
            />

            <Input
              label="Kata Sandi Otoritas (Password)"
              required
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4" />}
              autoComplete="current-password"
            />

            {error && (
              <div className="p-3.5 rounded-lg bg-red-950/80 border border-red-600 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="gold"
              size="lg"
              isLoading={loading}
              className="w-full text-xs font-bold mt-2"
            >
              <Lock className="w-4 h-4 mr-2" />
              <span>Masuk Sistem Keamanan</span>
            </Button>
          </form>

          {/* Testing helper accounts */}
          <div className="mt-6 pt-5 border-t border-[#1E3B2F] space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Kredensial Demo Pengujian (Pilih Cepat):
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('superadmin', 'tni2026prima')}
                className="text-left px-3 py-2 rounded-lg bg-[#0C1A14] hover:bg-[#132C20] border border-[#1B382A] text-slate-200 flex items-center justify-between text-[11px]"
              >
                <span><strong>Super Admin</strong> (Letkol Radityo)</span>
                <span className="font-mono text-[10px] text-[#D4AF37]">superadmin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('panitiagate', 'gatepass2026')}
                className="text-left px-3 py-2 rounded-lg bg-[#0C1A14] hover:bg-[#132C20] border border-[#1B382A] text-slate-200 flex items-center justify-between text-[11px]"
              >
                <span><strong>Panitia Gate / Check-In</strong> (Kapten Hendro)</span>
                <span className="font-mono text-[10px] text-emerald-400">panitiagate</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('panitiawisma', 'wismapass2026')}
                className="text-left px-3 py-2 rounded-lg bg-[#0C1A14] hover:bg-[#132C20] border border-[#1B382A] text-slate-200 flex items-center justify-between text-[11px]"
              >
                <span><strong>Panitia Akomodasi</strong> (Mayor Anita)</span>
                <span className="font-mono text-[10px] text-blue-400">panitiawisma</span>
              </button>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-[#F5E296] transition-colors">
            &larr; Kembali ke Portal Depan
          </Link>
        </div>
      </div>
    </div>
  );
}

