import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Shield,
  FileCheck2,
  Search,
  ArrowRight
} from 'lucide-react';
import { getSiteSettings } from '@/lib/settings/siteSettings';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <div className="w-full flex-1 flex flex-col justify-center bg-gradient-to-b from-white to-[#f8fafc]">
      {/* =========================================================================
          HERO EVENT SECTION (Satu-Satunya Konten di Landing Page)
          ========================================================================= */}
      <section className="relative py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
          {/* Logo Hero Jika Ada */}
          {settings.hero_logo && (
            <div className="flex justify-center pb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.hero_logo}
                alt="Logo Hero"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl"
              />
            </div>
          )}

          {/* Official Institution Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-blue-50 border border-blue-200 text-[#1E40AF] text-[12px] sm:text-[13px] font-medium tracking-wide">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E40AF]" />
            <span>MARKAS BESAR TENTARA NASIONAL INDONESIA</span>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F172A] leading-tight">
              {settings.hero_title || 'Rapat Pimpinan TNI Tahun 2026'}
            </h1>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-2xl mx-auto font-normal">
              {settings.hero_subtitle || 'Sistem Registrasi & Akreditasi Tamu Undangan Resmi untuk Perwira Tinggi, Perwira Menengah, Delegasi Kementerian/Instansi Negara, dan Tamu Kehormatan.'}
            </p>
            {settings.event_theme && (
              <p className="text-xs sm:text-sm font-semibold text-blue-900 bg-blue-50/80 border border-blue-200/80 rounded-lg py-1.5 px-3 max-w-xl mx-auto">
                &ldquo;{settings.event_theme}&rdquo;
              </p>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-[15px] font-medium bg-[#1E40AF] text-white hover:bg-[#1e3a8a] px-6 py-3 rounded-lg shadow-sm transition-all"
            >
              <span>Daftar Peserta Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/cari-e-ticket"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-[15px] font-medium bg-white text-[#0F172A] hover:bg-slate-50 border border-slate-200 px-5 py-3 rounded-lg shadow-xs transition-all"
            >
              <Search className="w-4 h-4 text-[#64748B]" />
              <span>Cari E-Ticket Terdaftar</span>
            </Link>
          </div>

          {/* Meta Info Highlights */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-[13px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>Pelaksanaan: {settings.event_date || '4 – 5 September 2026'}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{settings.event_location || 'Gedung Ahmad Yani, Mabes TNI Cilangkap'}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Akreditasi QR Otomatis</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
