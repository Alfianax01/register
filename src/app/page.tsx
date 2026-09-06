import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Shield,
  FileCheck2,
  Search,
  ArrowRight,
  Clock,
  Shirt,
  Building2
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full flex-1 flex flex-col bg-[#f8fafc]">
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

      {/* =========================================================================
          2. KONTEN INFORMASI (Informasi & Ketentuan Acara)
          ========================================================================= */}
      <section className="py-12 sm:py-16 border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-semibold text-[#1E40AF] tracking-widest uppercase">
              Petunjuk Pelaksanaan
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Informasi & Ketentuan Acara
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
              Informasi penting seputar tata tertib kehadiran, jadwal gerbang, pakaian dinas, dan akomodasi wisma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Panel 1 */}
            <div className="p-5 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">
                Jadwal & Kedatangan
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Pemeriksaan barcode presensi dibuka mulai pukul <strong>06.30 WIB</strong>. Seluruh delegasi diharapkan telah menempati kursi sidang paling lambat pukul <strong>07.30 WIB</strong> sebelum sidang pembukaan resmi dimulai.
              </p>
            </div>

            {/* Panel 2 */}
            <div className="p-5 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">
                Lokasi & Akses Gerbang
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Bertempat di <strong>Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur</strong>. Akses kendaraan dinas dan tamu diarahkan melalui <strong>Gate Utama Hankam</strong> dengan menunjukkan E-Ticket QR Code.
              </p>
            </div>

            {/* Panel 3 */}
            <div className="p-5 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center">
                <Shirt className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">
                Ketentuan Pakaian Dinas
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Prajurit TNI aktif mengenakan <strong>PDU I</strong> untuk upacara pembukaan. Tamu undangan instansi sipil/kementerian mengenakan <strong>PSL / PSH</strong> atau <strong>Batik Nasional Lengan Panjang</strong>.
              </p>
            </div>

            {/* Panel 4 */}
            <div className="p-5 sm:p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 shadow-xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#0F172A]">
                Akomodasi & Wisma
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                Bagi delegasi perwira dari luar Garnisun Jakarta, panitia menyediakan fasilitas akomodasi di <strong>Wisma Soedirman</strong> dan <strong>Wisma Bahari</strong> yang dapat dipilih saat registrasi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
