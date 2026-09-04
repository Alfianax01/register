'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ModernRegistrationForm } from '@/components/register/ModernRegistrationForm';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Shield, Search } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegistrationSuccess = (token: string) => {
    router.push(`/ticket/${token}`);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-[#f8fafc] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Quick Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Kembali ke Beranda Acara</span>
          </Link>

          <Link
            href="/ticket"
            className="inline-flex items-center text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-md transition-colors"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" />
            <span>Sudah Mendaftar? Cek Tiket</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-blue-50 border border-blue-200/80 text-blue-700 text-[12px] font-medium tracking-wide">
            <Shield className="w-3.5 h-3.5 text-blue-700" />
            <span>MARKAS BESAR TENTARA NASIONAL INDONESIA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Formulir Pendaftaran Resmi
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Silakan lengkapi data kedinasan, matra, dan kontak aktif Anda. E-Ticket beserta QR Code identitas resmi akan diterbitkan secara otomatis setelah verifikasi data selesai.
          </p>
        </div>

        {/* Form Container Card */}
        <Card className="p-5 sm:p-8 md:p-10 bg-white border border-slate-200/90 shadow-sm rounded-xl">
          <ModernRegistrationForm onSuccess={handleRegistrationSuccess} />
        </Card>
      </div>
    </div>
  );
}
