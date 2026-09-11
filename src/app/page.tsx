import React from 'react';
import { Link } from 'next-view-transitions';
import {
  Calendar,
  MapPin,
  Shield,
  FileCheck2,
  Search,
  ArrowRight
} from 'lucide-react';
import { getSiteSettings } from '@/lib/settings/siteSettings';
import { HeroLogo } from '@/components/home/HeroLogo';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <div className="w-full flex-1 flex flex-col justify-center bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50">
      <section
        className="relative py-10 sm:py-16"
        style={settings.hero_banner ? {
          backgroundImage: `url(${settings.hero_banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : undefined}
      >
        {settings.hero_banner && (
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/75 to-white/95 pointer-events-none" />
        )}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">
          {/* Logo Hero Branding Container & Official Badge */}
          <div className="flex flex-col items-center gap-3.5 sm:gap-4 pb-1">
            <HeroLogo
              logoUrl={settings.hero_logo}
              altText={`Lambang Resmi ${settings.hero_title || 'TNI'}`}
            />

            {/* Official Institution Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-primary text-xs sm:text-sm font-bold tracking-wider shadow-2xs">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span>MARKAS BESAR TENTARA NASIONAL INDONESIA</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-3.5">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
              {settings.hero_title || 'Rapat Pimpinan TNI Tahun 2026'}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              {settings.hero_subtitle || 'Sistem Registrasi & Akreditasi Tamu Undangan Resmi untuk Perwira Tinggi, Perwira Menengah, Delegasi Kementerian/Instansi Negara, dan Tamu Kehormatan.'}
            </p>
            {settings.event_theme && (
              <p className="text-sm sm:text-base font-bold text-primary bg-blue-50/90 border border-blue-200/90 rounded-xl py-2 px-4 max-w-xl mx-auto shadow-2xs">
                &ldquo;{settings.event_theme}&rdquo;
              </p>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-base font-bold bg-primary text-white hover:bg-primary-hover px-7 py-3.5 min-h-[50px] rounded-xl shadow-card hover:shadow-card-hover transition-all"
            >
              <span>Daftar Peserta Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/cari-e-ticket"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-base font-bold bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 px-6 py-3.5 min-h-[50px] rounded-xl shadow-card hover:shadow-card-hover transition-all"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Cari E-Ticket Terdaftar</span>
            </Link>
          </div>

          {/* Meta Info Highlights */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Pelaksanaan: {settings.event_date || '4 – 5 September 2026'}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-success" />
              <span>{settings.event_location || 'Gedung Ahmad Yani, Mabes TNI Cilangkap'}</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-accent" />
              <span>Akreditasi QR Otomatis</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
