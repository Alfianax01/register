'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Shield, Lock, User, KeyRound, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/settings';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    fetch('/api/settings/website')
      .then(res => res.json())
      .then(data => {
        if (data && data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      })
      .catch(() => {});
  }, []);

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
        setError(data.error || 'Kombinasi akun dinas atau kata sandi tidak valid.');
        setLoading(false);
        return;
      }

      // Berhasil login: redirect ke Direktori Peserta
      router.push('/admin/guests');
      router.refresh();
    } catch {
      setError('Gagal menghubungi server autentikasi.');
      setLoading(false);
    }
  };

  const bannerStyle = settings.banner_login
    ? { backgroundImage: `url(${settings.banner_login})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const logoSrc = settings.logo_header || settings.navbar_logo || '/images/logo-tni-rapim.png';

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col justify-between selection:bg-[#8B0000] selection:text-white font-sans">
      {/* ============================================================ */}
      {/* 1. HEADER BANNER MERAH MAROON & HEXAGON MILITER (PUSINFOLAHTA) */}
      {/* ============================================================ */}
      <header
        className="relative w-full bg-[#8B0000] text-white overflow-hidden border-b-4 border-[#B8860B] shadow-md"
        style={bannerStyle}
      >
        {/* Hexagon Pattern Overlay */}
        <div className="absolute inset-0 bg-pattern-hex opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#6B0000]/70 via-[#8B0000]/80 to-[#6B0000]/95 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-8 sm:py-10 flex flex-col items-center text-center z-10">
          {/* Logo TNI di Tengah */}
          <div className="mb-3.5 relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.35)] border-2 border-[#D4AF37] flex items-center justify-center transform transition-transform group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="Logo Mabes TNI"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#B8860B] text-white p-1 rounded-full border border-white">
              <Shield className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Teks Lembaga & Portal */}
          <span className="text-xs sm:text-sm font-extrabold text-[#D4AF37] tracking-[0.25em] uppercase drop-shadow-sm mb-1 block">
            TENTARA NASIONAL INDONESIA
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight uppercase drop-shadow-md">
            {settings.nama_sistem || 'PORTAL RAPIM TNI 2026'}
          </h1>
          <p className="text-xs sm:text-sm text-red-100/90 font-medium max-w-xl mt-1.5 leading-relaxed">
            {settings.subjudul || 'Sistem Informasi Presensi, Akreditasi, dan Tata Kelola Kedinasan'}
          </p>
        </div>

        {/* Pita Emas Garis Pembatas */}
        <div className="h-1 w-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B]" />
      </header>

      {/* ============================================================ */}
      {/* 2. FORM LOGIN (CARD PUTIH FORMAL MILITER)                     */}
      {/* ============================================================ */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md">
          <Card className="p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white">
            {/* Header Box Card */}
            <div className="text-center pb-5 mb-6 border-b border-[#E5E7EB]">
              <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] tracking-tight">
                Selamat Datang di
              </h2>
              <span className="text-sm sm:text-base font-extrabold text-[#8B0000] block mt-0.5 uppercase tracking-wide">
                {settings.nama_sistem || 'Portal RAPIM TNI 2026'}
              </span>
              <p className="text-xs text-[#6B7280] mt-1.5">
                Silakan masukkan akun dinas resmi untuk mengakses sistem.
              </p>
            </div>

            {/* Form Input */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                  Username Akun Dinas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan username akun dinas..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#1F2937] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox Show Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center text-xs text-[#4B5563] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#8B0000] border-gray-300 rounded focus:ring-[#8B0000]"
                  />
                  <span className="ml-2 font-medium">Tampilkan Password</span>
                </label>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tombol MASUK SISTEM (#9B6A35 / Hover #7B532A) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase text-white shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#9B6A35',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#7B532A')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#9B6A35')}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>MASUK SISTEM</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Kembali ke Beranda */}
            <div className="mt-6 pt-4 border-t border-[#E5E7EB] text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#8B0000] transition-colors py-1.5 px-3 rounded-md hover:bg-slate-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda Registrasi</span>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* ============================================================ */}
      {/* 3. FOOTER RESMI KEDINASAN                                    */}
      {/* ============================================================ */}
      <footer className="w-full bg-[#1F2937] text-slate-400 text-center py-4 px-4 text-xs border-t border-slate-700/50">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-semibold text-slate-300">
            {settings.footer || 'PUSAT INFORMASI PENGOLAHAN DATA TENTARA NASIONAL INDONESIA (PUSINFOLAHTA TNI)'}
          </p>
          <p className="text-[11px] text-slate-500">
            Sistem Otentikasi Keamanan Berlapis Tingkat Komando. Akses tanpa izin akan ditindaklanjuti sesuai hukum kedinasan militer.
          </p>
        </div>
      </footer>
    </div>
  );
}
