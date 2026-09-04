import React from 'react';
import Link from 'next/link';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Calendar,
  MapPin,
  Shield,
  QrCode,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bed,
  Lock
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-20">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[140px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[160px]" />
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Tri-Matra Emblem Cluster */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <TniEmblem matra="AD" size="md" className="hidden sm:flex hover:scale-110 transition-transform" />
          <TniEmblem matra="MABES" size="xl" className="scale-110 drop-shadow-[0_4px_25px_rgba(212,175,55,0.4)]" />
          <TniEmblem matra="AL" size="md" className="hidden sm:flex hover:scale-110 transition-transform" />
          <TniEmblem matra="AU" size="md" className="hidden sm:flex hover:scale-110 transition-transform" />
        </div>

        {/* Institution Badges */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#133023] border border-[#D4AF37]/50 text-[#F5E296] text-xs font-semibold tracking-widest uppercase mb-4 shadow-lg shadow-amber-950/20">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>MARKAS BESAR TENTARA NASIONAL INDONESIA</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
          RAPAT PIMPINAN TNI <br />
          <span className="text-gold-gradient">TAHUN 2026</span>
        </h1>

        {/* Theme */}
        <div className="mt-6 max-w-3xl mx-auto p-4 rounded-xl bg-[#0C1E17]/90 border border-[#1E4334] shadow-inner">
          <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mb-1">
            TEMA RAPIM TNI 2026
          </p>
          <p className="text-sm sm:text-base font-serif italic text-slate-200">
            &ldquo;TNI PRIMA: Profesional, Responsif, Integratif, Modern, dan Adaptif Siap Mendukung Stabilitas Pertahanan Nasional Menuju Indonesia Maju&rdquo;
          </p>
        </div>

        {/* Key Event Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-[#0F261D] px-3.5 py-2 rounded-lg border border-[#1D4736]">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>4 – 6 September 2026</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0F261D] px-3.5 py-2 rounded-lg border border-[#1D4736]">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>Gedung Ahmad Yani, Mabes TNI Cilangkap</span>
          </div>
          <div className="flex items-center gap-2 bg-[#0F261D] px-3.5 py-2 rounded-lg border border-[#1D4736]">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <span>PDU I / PDH / PSL</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button variant="gold" size="lg" className="w-full sm:w-auto shadow-xl">
              <span>Registrasi Undangan</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/ticket/my-ticket" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <QrCode className="w-4 h-4 mr-2 text-[#D4AF37]" />
              <span>Cek E-Ticket Saya</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* SYSTEM FLOW (ALUR PENGGUNA) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#163124]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Alur E-Registrasi & Presensi Hari-H
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Mekanisme digital satu pintu untuk memudahkan kehadiran prajurit dan tamu kehormatan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <Card className="p-6 relative group hover:border-[#D4AF37]/60 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold flex items-center justify-center text-sm mb-4">
              01
            </div>
            <h3 className="font-serif font-bold text-base text-slate-100 mb-2">
              Isi Data Registrasi
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tamu mengisi formulir online resmi dengan NRP, Matra (AD, AL, AU, Kemhan/Sipil), Pangkat, Satuan, dan kebutuhan akomodasi.
            </p>
          </Card>

          {/* Step 2 */}
          <Card className="p-6 relative group hover:border-[#D4AF37]/60 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-600 text-amber-300 font-bold flex items-center justify-center text-sm mb-4">
              02
            </div>
            <h3 className="font-serif font-bold text-base text-slate-100 mb-2">
              Terbitkan E-Ticket QR
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem men-generate token acak terenkripsi (UUID v4) dan kartu identitas digital yang dapat diunduh atau disimpan ke ponsel.
            </p>
          </Card>

          {/* Step 3 */}
          <Card className="p-6 relative group hover:border-[#D4AF37]/60 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-600 text-blue-300 font-bold flex items-center justify-center text-sm mb-4">
              03
            </div>
            <h3 className="font-serif font-bold text-base text-slate-100 mb-2">
              Check-In Hari-H
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tiba di Gedung Ahmad Yani, panitia gate memindai QR Code di gerbang masuk, ruang pleno VIP, sesi tertutup, dan konsumsi.
            </p>
          </Card>

          {/* Step 4 */}
          <Card className="p-6 relative group hover:border-[#D4AF37]/60 transition-all">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-600 text-cyan-300 font-bold flex items-center justify-center text-sm mb-4">
              04
            </div>
            <h3 className="font-serif font-bold text-base text-slate-100 mb-2">
              Penempatan Kursi & Wisma
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nomor kursi sidang paripurna (Grup A-F) dan alokasi kamar wisma penginapan diperbarui otomatis dan dapat dilihat langsung di e-ticket.
            </p>
          </Card>
        </div>
      </section>

      {/* MATRA IDENTITY HIGHLIGHTS */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#163124]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AD */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0F2A1C] to-[#08170F] border border-emerald-700/50 shadow-lg flex flex-col items-center text-center">
            <TniEmblem matra="AD" size="lg" className="mb-3" />
            <h4 className="font-serif font-bold text-emerald-300 text-lg">TNI ANGKATAN DARAT</h4>
            <p className="text-[11px] font-mono text-[#D4AF37] mb-2 tracking-widest">KARTIKA EKA PAKSI</p>
            <p className="text-xs text-slate-300">
              Kostrad, Kopassus, Kodam I s/d XVIII, dan Badan Pelaksana Pusat TNI AD.
            </p>
          </div>

          {/* AL */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0E2442] to-[#071324] border border-blue-700/50 shadow-lg flex flex-col items-center text-center">
            <TniEmblem matra="AL" size="lg" className="mb-3" />
            <h4 className="font-serif font-bold text-blue-300 text-lg">TNI ANGKATAN LAUT</h4>
            <p className="text-[11px] font-mono text-[#D4AF37] mb-2 tracking-widest">JALESVEVA JAYAMAHE</p>
            <p className="text-xs text-slate-300">
              Koarmada RI (I, II, III), Korps Marinir, Kolinlamil, dan Balakpus TNI AL.
            </p>
          </div>

          {/* AU */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#11354A] to-[#081B26] border border-sky-600/50 shadow-lg flex flex-col items-center text-center">
            <TniEmblem matra="AU" size="lg" className="mb-3" />
            <h4 className="font-serif font-bold text-sky-300 text-lg">TNI ANGKATAN UDARA</h4>
            <p className="text-[11px] font-mono text-[#D4AF37] mb-2 tracking-widest">SWA BHUWANA PAKSA</p>
            <p className="text-xs text-slate-300">
              Koopsudnas, Wing Udara, Kopasgat, Koharmatau, dan Jajaran Pangkalan Udara.
            </p>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS & ADMIN PORTAL ENTRY */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
        <div className="rounded-2xl bg-gradient-to-r from-[#0C1E17] via-[#10291F] to-[#0C1E17] border border-[#D4AF37]/50 p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-950/70 border border-amber-500/50 text-amber-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Akses Khusus Panitia & Petugas Lapangan</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Portal Manajemen Acara & Scanner Gate
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Masuk ke dashboard panitia untuk melakukan pemindaian QR Code di meja registrasi, pengaturan denah kursi paripurna, dan alokasi kamar wisma.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="/admin/login">
              <Button variant="gold" size="lg" className="shadow-lg">
                <Lock className="w-4 h-4 mr-2" />
                <span>Masuk Dashboard Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

