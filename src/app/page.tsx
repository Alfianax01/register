import React from 'react';
import { Link } from 'next-view-transitions';
import {
  Calendar,
  MapPin,
  Shield,
  FileCheck2,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Award
} from 'lucide-react';
import { getSiteSettings } from '@/lib/settings/siteSettings';
import { HeroLogo } from '@/components/home/HeroLogo';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <div className="w-full flex-1 flex flex-col justify-center bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50">
      <section
        className="relative py-14 sm:py-24"
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
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7 sm:space-y-8">
          {/* Logo Hero Branding Container & Official Badge */}
          <div className="flex flex-col items-center gap-5 sm:gap-6 pb-1">
            <HeroLogo
              logoUrl={settings.hero_logo}
              altText={`Lambang Resmi ${settings.hero_title || 'TNI'}`}
            />

            {/* Official Institution Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/80 text-primary text-xs sm:text-sm font-bold tracking-wider shadow-2xs">
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

      {/* 2. Rundown Agenda Kedinasan */}
      <section className="py-12 sm:py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#1E40AF] uppercase tracking-widest block">
              JADWAL &amp; SUSUNAN ACARA
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Rundown Sidang Rapim TNI 2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Agenda resmi Rapat Pimpinan Tentara Nasional Indonesia di Gedung Ahmad Yani
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hari ke-1 */}
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs">
                    H1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Hari Pertama: Sidang Pembukaan</h3>
                    <span className="text-xs text-slate-500 font-medium">Jumat, 4 September 2026</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                  Sidang Utama
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="font-mono font-bold text-[#1E40AF] w-24 flex-shrink-0">07.00 – 08.30</span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Registrasi &amp; Presensi QR Gate</strong>
                    <span className="text-slate-500 text-[11px]">Validasi identitas perwira di pintu masuk Gedung Ahmad Yani</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="font-mono font-bold text-[#1E40AF] w-24 flex-shrink-0">08.30 – 10.00</span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Pengarahan Utama Panglima TNI</strong>
                    <span className="text-slate-500 text-[11px]">Amanat pembukaan Rapim TNI dan penegasan doktrin pertahanan</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="font-mono font-bold text-[#1E40AF] w-24 flex-shrink-0">10.00 – 12.00</span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Paparan Staf Umum Mabes TNI</strong>
                    <span className="text-slate-500 text-[11px]">Laporan strategis Asintel, Asops, dan Asrenum Panglima TNI</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="font-mono font-bold text-[#1E40AF] w-24 flex-shrink-0">13.30 – 16.30</span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Sidang Paripurna Matra</strong>
                    <span className="text-slate-500 text-[11px]">Pembahasan kesiapan operasional TNI AD, TNI AL, dan TNI AU</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Hari ke-2 */}
            <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    H2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Hari Kedua: Perumusan Kebijakan</h3>
                    <span className="text-xs text-slate-500 font-medium">Sabtu, 5 September 2026</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Perumusan
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="font-mono font-bold text-emerald-700 w-24 flex-shrink-0">08.00 – 10.00</span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Sidang Komisi Gabungan</strong>
                    <span className="text-slate-500 text-[11px]">Rapat terfokus komisi operasi, logistik, personel, dan anggaran</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="font-mono font-bold text-emerald-700 w-24 flex-shrink-0">10.00 – 12.00</span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Perumusan Pokok Kebijakan 2026</strong>
                    <span className="text-slate-500 text-[11px]">Sinkronisasi pokok-pokok kebijakan pertahanan nasional</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="font-mono font-bold text-emerald-700 w-24 flex-shrink-0">13.30 – 15.00</span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Upacara Penutupan Resmi</strong>
                    <span className="text-slate-500 text-[11px]">Pernyataan pers bersama dan penyerahan naskah hasil sidang</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-100">
                  <span className="font-mono font-bold text-emerald-700 w-24 flex-shrink-0">15.00 – Selesai</span>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Ramah Tamah &amp; Pelepasan Delegasi</strong>
                    <span className="text-slate-500 text-[11px]">Foto bersama dan kepulangan kontingen delegasi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Ketentuan & Tata Tertib Kehadiran */}
      <section className="py-12 sm:py-16 bg-[#f8fafc] border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-[#1E40AF] uppercase tracking-widest block">
              KEDISIPLINAN &amp; KETERTIBAN
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Tata Tertib &amp; Panduan Kehadiran
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Kewajiban kepatuhan dinas militer bagi seluruh perwira dan delegasi resmi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pakaian Dinas Resmi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prajurit TNI wajib mengenakan Pakaian Dinas Harian (PDH) resmi lengkap dengan lencana dan tanda pangkat. Delegasi sipil mengenakan PSL / Batik resmi.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Wajib Scan QR E-Ticket</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap peserta wajib menunjukkan E-Ticket QR pada petugas gerbang masuk (Gate 1 / Gate 2) paling lambat 30 menit sebelum sidang dimulai.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Kerahasiaan &amp; Keamanan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ruang Sidang Utama berstatus rahasia. Dilarang membawa senjata dinas pribadi dan perangkat rekam audio-visual ke dalam ruang sidang pleno.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Fasilitas Akomodasi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prajurit dan delegasi luar Jakarta berhak atas akomodasi di Wisma Kartika atau Wisma Soedirman yang telah dialokasikan pada saat pendaftaran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sekretariat Panitia */}
      <section className="py-8 bg-white border-t border-slate-200/80 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-2 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            Sekretariat Panitia Penyelenggara RAPIM TNI 2026
          </p>
          <p>
            Gedung Ahmad Yani, Markas Besar Tentara Nasional Indonesia, Cilangkap, Jakarta Timur 13870
          </p>
          <p className="text-slate-400 text-[11px]">
            Layanan Bantuan Teknis: panitia.rapim@tni.mil.id &bull; Hotline Dinas: (021) 8459-5555
          </p>
        </div>
      </section>
    </div>
  );
}
