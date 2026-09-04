'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
  Calendar,
  MapPin,
  Shield,
  FileCheck2,
  Search,
  Building2,
  ChevronDown,
  Clock,
  Shirt,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const timelineAgenda = [
    {
      time: '06.30 – 07.30 WIB',
      title: 'Registrasi & Pemindaian QR Gate Masuk',
      desc: 'Pemeriksaan keamanan dan validasi QR Code E-Ticket di Gate Utama Hankam Gedung Ahmad Yani.',
      tag: 'Check-In Gate'
    },
    {
      time: '08.00 – 09.15 WIB',
      title: 'Upacara Pembukaan RAPIM TNI 2026',
      desc: 'Penghormatan, laporan panitia pelaksana, dan lagu kebangsaan Indonesia Raya di Ruang Sidang Paripurna.',
      tag: 'Pleno Pembuka'
    },
    {
      time: '09.30 – 12.00 WIB',
      title: 'Sidang Pleno I: Kebijakan Strategis Pertahanan',
      desc: 'Penyampaian paparan evaluasi pelaksanaan operasi dan pembinaan kekuatan TNI oleh Kasum TNI dan Asisten Panglima.',
      tag: 'Sidang Pleno'
    },
    {
      time: '12.00 – 13.30 WIB',
      title: 'Istirahat, Sholat & Santap Siang (Ishoma)',
      desc: 'Fasilitas ramah tamah dan jamuan makan siang resmi bertempat di Ruang Kartika & Dining Hall.',
      tag: 'Ishoma'
    },
    {
      time: '13.30 – 15.30 WIB',
      title: 'Sidang Pleno II & Pengarahan Khusus Panglima TNI',
      desc: 'Arah kebijakan prioritas serta tindak lanjut kesiapan alutsista dan pengamanan nasional.',
      tag: 'Pengarahan'
    },
    {
      time: '15.30 – 16.00 WIB',
      title: 'Penyerahan Direktif & Penutupan Resmi',
      desc: 'Penyerahan naskah direktif pelaksanaan RAPIM TNI 2026 kepada para Kepala Staf Angkatan dilanjutkan penutupan.',
      tag: 'Penutupan'
    }
  ];

  const faqs = [
    {
      q: 'Bagaimana cara memperoleh E-Ticket setelah melakukan registrasi?',
      a: 'Setelah data pendaftaran Anda dikirimkan, sistem akan otomatis menerbitkan E-Ticket digital lengkap dengan QR Code unik dan alokasi tempat duduk. Anda dapat langsung mengunduh tiket dalam format kartu digital atau memeriksanya kembali kapan saja melalui menu "Cari E-Ticket".'
    },
    {
      q: 'Bagaimana penentuan tempat duduk (kursi) dan kamar wisma dilakukan?',
      a: 'Penataan tata letak kursi sidang paripurna diatur secara terstruktur oleh panitia berpedoman pada hierarki senioritas kepangkatan prajurit (Pati Bintang 4, 3, 2, 1, Kolonel, dsb) serta perwakilan matra dinas. Akomodasi wisma (Wisma Soedirman / Wisma Bahari) diprioritaskan bagi delegasi undangan resmi dari luar wilayah Garnisun Jakarta.'
    },
    {
      q: 'Apa saja dokumen atau identitas yang harus dipersiapkan saat verifikasi hari-H?',
      a: 'Pada saat tiba di Gerbang Pemeriksaan Keamanan Gedung Ahmad Yani Mabes TNI Cilangkap, peserta cukup menunjukkan tampilan QR Code E-Ticket pada smartphone atau cetak fisik kartu peserta kepada petugas scanner gate untuk validasi presensi instan.'
    },
    {
      q: 'Apakah peserta diperbolehkan mengubah data kedinasan setelah mendaftar?',
      a: 'Apabila terdapat perubahan pangkat, satker, atau ralat nomor kontak kedinasan, silakan hubungi Meja Bantuan Sekretariat Panitia RAPIM TNI di lokasi registrasi atau ajukan permohonan melalui verifikator panitia dengan menyebutkan NRP resmi Anda.'
    },
    {
      q: 'Bagaimana ketentuan seragam dan pakaian dinas selama kegiatan berlangsung?',
      a: 'Pakaian dinas upacara pembukaan dan sidang pleno utama adalah PDU I bagi prajurit TNI aktif, PSH / PSL bagi pejabat kementerian dan lembaga negara, serta Pakaian Nasional (Batik Lengan Panjang) bagi tamu kehormatan sipil.'
    }
  ];

  return (
    <div className="w-full bg-[#f8fafc]">
      {/* =========================================================================
          1. HERO EVENT SECTION (Compact & Above the Fold)
          ========================================================================= */}
      <section className="relative pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-slate-200/80 bg-gradient-to-b from-white to-[#f8fafc]">
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
          2. INFORMASI ACARA (Event Key Details)
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

      {/* =========================================================================
          3. TIMELINE AGENDA ACARA
          ========================================================================= */}
      <section className="py-12 sm:py-16 border-b border-slate-200/80 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-semibold text-[#1E40AF] tracking-widest uppercase">
              Susunan Kegiatan
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Timeline Agenda Resmi
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
              Rangkaian jadwal persidangan dan pengarahan pimpinan selama acara berlangsung.
            </p>
          </div>

          <div className="relative border-l border-blue-200 ml-4 sm:ml-6 space-y-6 sm:space-y-8 pl-6">
            {timelineAgenda.map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline Pin Node */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#1E40AF] group-hover:bg-[#1E40AF] transition-colors" />

                <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#1E40AF] bg-blue-50 px-2.5 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#0F172A]">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. REGISTRATION CTA BANNER
          ========================================================================= */}
      <section className="py-10 sm:py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Card className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-[#1E3A8A] text-white rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-200 font-medium">
                <UserCheck className="w-3.5 h-3.5" />
                Registrasi Peserta Terbuka
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Siap Menghadiri RAPIM TNI 2026?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                Daftarkan diri Anda untuk mendapatkan nomor registrasi resmi, QR Code E-Ticket, dan penetapan tempat duduk.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors text-center"
              >
                <span>Mulai Registrasi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ticket"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-lg border border-white/20 transition-colors text-center"
              >
                <span>Cari E-Ticket</span>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* =========================================================================
          5. FAQ SECTION
          ========================================================================= */}
      <section className="py-12 sm:py-16 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-1.5">
            <span className="text-[11px] font-semibold text-[#1E40AF] tracking-widest uppercase">
              Bantuan & Panduan
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto">
              Rangkuman jawaban pertanyaan umum seputar teknis pendaftaran, validasi QR, dan kehadiran acara.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 focus:outline-none"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-[#0F172A]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#1E40AF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
