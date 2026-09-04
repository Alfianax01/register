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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [registeredGuest, setRegisteredGuest] = useState<{ token: string; guest: any } | null>(null);

  const handleRegistrationSuccess = (token: string, guest: any) => {
    setRegisteredGuest({ token, guest });
  };

  return (
    <div className="w-full bg-[#f8fafc] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Official Event Header Section (Pemerintah/BUMN Standard) */}
        <header className="space-y-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            {/* Seal / Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>MARKAS BESAR TENTARA NASIONAL INDONESIA</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                Registrasi Tamu & Prajurit Undangan
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                Rapat Pimpinan (RAPIM) TNI Tahun 2026 &mdash; Sinergi Pengabdian Menuju Indonesia Maju
              </p>
            </div>
          </div>

          {/* Official Event Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                  Waktu Sidang
                </span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                  4 – 6 September 2026
                </span>
                <span className="text-[11px] text-slate-500">Pukul 07.30 WIB – Selesai</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                  Lokasi Acara
                </span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                  Gedung Ahmad Yani
                </span>
                <span className="text-[11px] text-slate-500">Mabes TNI Cilangkap, Jakarta</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                  Akomodasi & Wisma
                </span>
                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                  Wisma Soedirman & Laut
                </span>
                <span className="text-[11px] text-slate-500">Tersedia alokasi kamar</span>
              </div>
            </div>
          </div>
        </header>

        {/* Success Banner if registration completed */}
        {registeredGuest && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Pendaftaran Berhasil &bull; E-Ticket Diterbitkan
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Kartu tanda peserta resmi atas nama <strong>{registeredGuest.guest?.nama}</strong> ({registeredGuest.guest?.pangkat}) telah aktif.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => router.push(`/ticket/${registeredGuest.token}`)}
              className="w-full sm:w-auto text-xs font-semibold flex-shrink-0 h-[38px]"
            >
              <span>Buka E-Ticket Digital</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        )}

        {/* CENTERED REGISTRATION FORM (Max 4XL) */}
        <main>
          <Card className="p-6 sm:p-9 bg-white border border-slate-200 shadow-xs rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Formulir Registrasi Mandiri
                  </h2>
                  <Badge variant="primary" size="sm">
                    Online 2026
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Mohon isi formulir di bawah dengan data dinas yang valid untuk penerbitan E-Ticket dan alokasi tempat duduk sidang.
                </p>
              </div>

              <Link
                href="/ticket/my-ticket"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Sudah Mendaftar? Cari E-Ticket</span>
              </Link>
            </div>

            {/* Registration Form Component (100% Form Focus) */}
            <ModernRegistrationForm onSuccess={handleRegistrationSuccess} />
          </Card>
        </main>

        {/* Guidance & Protocol Information */}
        <section aria-label="Petunjuk Acara" className="p-5 rounded-xl bg-slate-100/70 border border-slate-200/80 space-y-3 text-xs text-slate-600">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <span>Petunjuk & Tata Tertib Peserta RAPIM TNI 2026:</span>
          </h3>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 text-[11px] leading-relaxed">
            <li>
              Prajurit TNI dan tamu undangan wajib membawa smartphone dengan <strong>E-Ticket / QR Code</strong> atau kartu cetak fisik untuk verifikasi di Gate Pemeriksaan Keamanan Ahmad Yani.
            </li>
            <li>
              Alokasi tempat duduk di ruang sidang paripurna ditentukan secara otomatis berdasarkan senioritas kepangkatan dan perwakilan matra (TNI AD, AL, AU, Mabes TNI).
            </li>
            <li>
              Bagi delegasi yang memerlukan akomodasi kamar inap, silakan centang opsi <em>Kebutuhan Akomodasi</em> pada formulir di atas.
            </li>
            <li>
              Pakaian dinas untuk sesi sidang pembukaan adalah <strong>PDU I (TNI)</strong> atau <strong>PSL / Batik Lengan Panjang</strong> bagi undangan sipil/kementerian.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
