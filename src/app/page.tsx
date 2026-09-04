'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModernRegistrationForm } from '@/components/register/ModernRegistrationForm';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Shield,
  FileCheck2,
  Search,
  Building2,
  ChevronDown,
  Clock,
  Shirt,
  HelpCircle,
  ArrowDown
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [registeredGuest, setRegisteredGuest] = useState<{ token: string; guest: any } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleRegistrationSuccess = (token: string, guest: any) => {
    setRegisteredGuest({ token, guest });
    // Checklist #4: Immediate redirect to official ticket & participant credentials
    router.push(`/ticket/${token}`);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Bagaimana cara memperoleh E-Ticket setelah melakukan registrasi?',
      a: 'Setelah data pendaftaran Anda dinyatakan lengkap dan dikirimkan, sistem akan otomatis menerbitkan E-Ticket digital lengkap dengan QR Code unik dan alokasi tempat duduk. Anda dapat langsung mengunduh tiket dalam format kartu digital atau memeriksanya kembali kapan saja melalui menu "Cari E-Ticket".'
    },
    {
      q: 'Bagaimana penentuan tempat duduk (kursi) dan kamar wisma dilakukan?',
      a: 'Penataan tata letak kursi sidang paripurna diatur secara terstruktur oleh panitia berpedoman pada hierarki senioritas kepangkatan prajurit (PATI, Kolonel, Letkol/Mayor, dsb) serta perwakilan matra dinas. Akomodasi wisma (Wisma Soedirman / Wisma Bahari) akan diprioritaskan bagi delegasi undangan resmi dari luar wilayah Garnisun Jakarta.'
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
          1. HERO EVENT SECTION
          ========================================================================= */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white to-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Official Institution Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-blue-50 border border-blue-200 text-[#1E40AF] text-[13px] font-medium tracking-wide">
            <Shield className="w-4 h-4 text-[#1E40AF]" />
            <span>MARKAS BESAR TENTARA NASIONAL INDONESIA</span>
          </div>

          {/* Main Title Scale (H1: 40-44px) */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-[34px] sm:text-[42px] md:text-[44px] font-bold tracking-tight text-[#0F172A] leading-tight">
              Rapat Pimpinan TNI Tahun 2026
            </h1>
            <p className="text-[16px] md:text-[17px] text-[#475569] leading-relaxed max-w-2xl mx-auto font-normal">
              Sistem Registrasi & Akreditasi Tamu Undangan Resmi untuk Perwira Tinggi, Perwira Menengah, Delegasi Kementerian/Instansi Negara, dan Tamu Kehormatan.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#form-registrasi"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-[15px] font-medium bg-[#1E40AF] text-white hover:bg-[#1e3a8a] px-7 py-3 rounded-md shadow-sm transition-all"
            >
              <span>Isi Formulir Pendaftaran</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <Link
              href="/ticket/my-ticket"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-[15px] font-medium bg-white text-[#0F172A] hover:bg-slate-50 border border-slate-200/90 px-6 py-3 rounded-md shadow-xs transition-all"
            >
              <Search className="w-4 h-4 text-[#64748B]" />
              <span>Cari E-Ticket Terdaftar</span>
            </Link>
          </div>

          {/* Subtle Key Highlight Badge */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#1E40AF]" />
              <span>Pelaksanaan: 4 – 6 September 2026</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#16A34A]" />
              <span>Gedung Ahmad Yani, Mabes TNI Cilangkap</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#2563EB]" />
              <span>Akreditasi Terverifikasi Otomatis</span>
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. INFORMASI ACARA (Event Details Section)
          ========================================================================= */}
      <section className="py-16 md:py-24 border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Section Header */}
          <div className="text-center space-y-2">
            <span className="text-[12px] font-semibold text-[#1E40AF] tracking-widest uppercase">
              Petunjuk Pelaksanaan
            </span>
            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0F172A] tracking-tight">
              Informasi & Ketentuan Acara
            </h2>
            <p className="text-[15px] text-[#64748B] max-w-2xl mx-auto font-normal">
              Informasi esensial terkait jadwal persidangan, lokasi gerbang masuk, akomodasi wisma, dan tata tertib kehadiran.
            </p>
          </div>

          {/* Wide Information Grid (Clean 4 Panels, Enterprise Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panel 1: Waktu & Agenda */}
            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-[#1E40AF] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#0F172A]">
                Jadwal & Agenda Sidang
              </h3>
              <p className="text-[14px] text-[#475569] leading-relaxed">
                Pemeriksaan presensi gerbang dibuka mulai pukul <strong>06.30 WIB</strong>. Seluruh prajurit dan tamu undangan diharapkan telah menempati kursi sidang selambat-lambatnya pukul <strong>07.30 WIB</strong> sebelum sidang pembukaan resmi dimulai.
              </p>
            </div>

            {/* Panel 2: Lokasi & Akses Gerbang */}
            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-md bg-emerald-50 text-[#16A34A] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#0F172A]">
                Lokasi & Akses Masuk Gerbang
              </h3>
              <p className="text-[14px] text-[#475569] leading-relaxed">
                Bertempat di <strong>Gedung Ahmad Yani, Markas Besar TNI Cilangkap, Jakarta Timur</strong>. Akses kendaraan dinas dan tamu VIP diarahkan melalui <strong>Gate Utama Hankam</strong> dengan menunjukkan QR Code akreditasi resmi.
              </p>
            </div>

            {/* Panel 3: Ketentuan Pakaian Dinas */}
            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-md bg-slate-100 text-[#0F172A] flex items-center justify-center">
                <Shirt className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#0F172A]">
                Ketentuan Pakaian Dinas (Dress Code)
              </h3>
              <p className="text-[14px] text-[#475569] leading-relaxed">
                Prajurit TNI aktif mengenakan <strong>PDU I</strong> untuk sidang pleno pembukaan. Tamu undangan instansi sipil/kementerian mengenakan <strong>PSL / PSH</strong> atau <strong>Batik Nasional Lengan Panjang</strong>.
              </p>
            </div>

            {/* Panel 4: Akomodasi Wisma */}
            <div className="p-6 rounded-lg bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-md bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-semibold text-[#0F172A]">
                Akomodasi & Fasilitas Wisma
              </h3>
              <p className="text-[14px] text-[#475569] leading-relaxed">
                Bagi perwira dan delegasi dari luar Kodam Jaya/Garnisun Jakarta, panitia menyediakan fasilitas menginap di <strong>Wisma Soedirman</strong> dan <strong>Wisma Bahari</strong> yang dapat dipilih pada saat mengisi formulir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FORM REGISTRASI (Dominant Core Element)
          ========================================================================= */}
      <section id="form-registrasi" className="py-16 md:py-24 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Section Heading */}
          <div className="text-center space-y-2">
            <span className="text-[12px] font-semibold text-[#1E40AF] tracking-widest uppercase">
              Formulir Pendaftaran Resmi
            </span>
            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0F172A] tracking-tight">
              Registrasi Peserta RAPIM TNI 2026
            </h2>
            <p className="text-[15px] text-[#64748B] max-w-xl mx-auto font-normal">
              Pastikan seluruh isian data kedinasan, matra, dan nomor kontak aktif diisi dengan benar untuk penerbitan E-Ticket resmi.
            </p>
          </div>

          {/* Success Banner if newly registered */}
          {registeredGuest && (
            <div className="p-5 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-md bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[16px] font-semibold text-emerald-950">
                    Pendaftaran Berhasil Terverifikasi
                  </p>
                  <p className="text-[13px] text-emerald-800 mt-0.5">
                    Kartu peserta resmi atas nama <strong>{registeredGuest.guest?.nama}</strong> telah terbit dan siap digunakan.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => router.push(`/ticket/${registeredGuest.token}`)}
                className="w-full sm:w-auto text-[14px] font-medium h-[44px]"
              >
                <span>Buka E-Ticket Digital</span>
                <ExternalLink className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}

          {/* Main Card Container with Form Focus */}
          <Card className="p-7 sm:p-10 bg-white border border-slate-200/90 shadow-md rounded-lg space-y-8">
            <ModernRegistrationForm onSuccess={handleRegistrationSuccess} />
          </Card>
        </div>
      </section>

      {/* =========================================================================
          4. FAQ SECTION (Pertanyaan yang Sering Diajukan)
          ========================================================================= */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[12px] font-semibold text-[#1E40AF] tracking-widest uppercase">
              Bantuan & Panduan
            </span>
            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#0F172A] tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-[15px] text-[#64748B] max-w-xl mx-auto font-normal">
              Rangkuman jawaban pertanyaan umum seputar teknis registrasi dan kehadiran acara.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-md border border-slate-200/80 bg-white overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-[15px] font-medium text-[#0F172A]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#1E40AF]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-[14px] text-[#475569] leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
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
