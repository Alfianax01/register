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

      // Berhasil login: redirect ke Direktori Peserta (/admin/guests)
      router.push('/admin/guests');
      router.refresh();
    } catch {
      setError('Gagal menghubungi server autentikasi.');
      setLoading(false);
    }
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
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
          <Card className="p-6 sm:p-8 rounded-2xl border-slate-200/90 shadow-card bg-white">
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
          </Card>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors min-h-[44px] py-2 px-3"
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

