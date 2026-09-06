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

export default function HomePage() {

  return (
    <div className="w-full bg-[#f8fafc]">
      {/* =========================================================================
          1. HERO EVENT SECTION (Compact & Above the Fold)
          ========================================================================= */}
      <section className="relative pt-10 pb-12 sm:pt-16 sm:pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white to-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 sm:space-y-5">
          {/* Official Institution Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-blue-50 border border-blue-200 text-[#1E40AF] text-[12px] sm:text-[13px] font-medium tracking-wide">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E40AF]" />
            <span>MARKAS BESAR TENTARA NASIONAL INDONESIA</span>
          </div>

          {/* Main Title */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-[42px] font-bold tracking-tight text-[#0F172A] leading-tight">
              Rapat Pimpinan TNI Tahun 2026
            </h1>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-2xl mx-auto font-normal">
              Sistem Registrasi & Akreditasi Tamu Undangan Resmi untuk Perwira Tinggi, Perwira Menengah, Delegasi Kementerian/Instansi Negara, dan Tamu Kehormatan.
            </p>
          </div>

          {/* Primary Action Buttons (Directly Visible) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-[15px] font-medium bg-[#1E40AF] text-white hover:bg-[#1e3a8a] px-6 py-2.5 sm:py-3 rounded-lg shadow-sm transition-all"
            >
              <span>Daftar Peserta Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/ticket"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm sm:text-[15px] font-medium bg-white text-[#0F172A] hover:bg-slate-50 border border-slate-200 px-5 py-2.5 sm:py-3 rounded-lg shadow-xs transition-all"
            >
              <Search className="w-4 h-4 text-[#64748B]" />
              <span>Cari E-Ticket Terdaftar</span>
            </Link>
          </div>

          {/* Meta Info Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-[13px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>Pelaksanaan: 4 – 6 September 2026</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Gedung Ahmad Yani, Cilangkap</span>
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
