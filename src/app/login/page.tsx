'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, Lock, User, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
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
        setError(data.error || 'Kombinasi akun atau kata sandi tidak valid.');
        setLoading(false);
        return;
      }

      // Berhasil login: redirect ke /admin
      router.push('/admin');
      router.refresh();
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
    <>
      <Head>
        <title>Portal Masuk Dinas — RAPIM TNI 2026</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
        <div className="w-full max-w-md space-y-6">
          {/* Header Lembaga */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1E40AF] text-white mb-1 shadow-sm">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                MABES TENTARA NASIONAL INDONESIA
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Portal Panitia RAPIM TNI 2026
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Akses terbatas khusus panitia dan petugas lapangan berwenang untuk operasional presensi & penempatan.
            </p>
          </div>

          {/* Kotak Form Login */}
          <Card className="p-6 sm:p-7 shadow-xs border-slate-200/90 bg-white rounded-2xl">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Nama Akun Dinas (Username)"
                required
                placeholder="Masukkan username panitia..."
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
                className="w-full text-xs font-semibold h-[42px] mt-1 bg-[#1E40AF] hover:bg-blue-700"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                <span>Masuk ke Panel Admin</span>
              </Button>
            </form>

            {/* Quick Demo Helper */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Pilih Akun Dinas (Demo Quick-Fill):
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => fillCredentials('superadmin', 'tni2026prima')}
                  className="text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 text-slate-700 flex items-center justify-between text-xs transition-colors group"
                >
                  <div>
                    <span className="font-semibold block text-slate-900 group-hover:text-blue-700">Super Admin</span>
                    <span className="text-[11px] text-slate-500">Letkol Radityo (Akses Penuh)</span>
                  </div>
                  <span className="font-mono text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    superadmin
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('panitiagate', 'gatepass2026')}
                  className="text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 text-slate-700 flex items-center justify-between text-xs transition-colors group"
                >
                  <div>
                    <span className="font-semibold block text-slate-900 group-hover:text-emerald-700">Panitia Gate</span>
                    <span className="text-[11px] text-slate-500">Kapten Hendro (Presensi & Scanner)</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    panitiagate
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('panitiawisma', 'wismapass2026')}
                  className="text-left px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 text-slate-700 flex items-center justify-between text-xs transition-colors group"
                >
                  <div>
                    <span className="font-semibold block text-slate-900 group-hover:text-indigo-700">Panitia Akomodasi</span>
                    <span className="text-[11px] text-slate-500">Mayor Anita (Penempatan Kamar & Kursi)</span>
                  </div>
                  <span className="font-mono text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    panitiawisma
                  </span>
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
              <span>Kembali ke Beranda Publik</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

