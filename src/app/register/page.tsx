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
    <div className="min-h-[calc(100vh-76px)] bg-[#f8fafc] py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Breadcrumb & Quick Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Kembali ke Beranda Acara</span>
          </Link>

          <Link
            href="/ticket"
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-primary hover:text-blue-800 bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 px-4 py-2 min-h-[44px] rounded-xl transition-colors shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" />
            <span>Sudah Mendaftar? Cek Tiket</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-2.5 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-primary text-xs font-bold tracking-wider shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>MARKAS BESAR TENTARA NASIONAL INDONESIA</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Form Registrasi Peserta RAPIM TNI
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Silakan lengkapi data kedinasan, matra, dan kontak aktif Anda. E-Ticket beserta QR Code identitas resmi akan diterbitkan secara otomatis setelah verifikasi data selesai.
          </p>
        </div>

        {/* Form Container Card */}
        <Card className="p-6 sm:p-8 md:p-10 bg-white border border-slate-200/90 shadow-card rounded-2xl">
          <ModernRegistrationForm onSuccess={handleRegistrationSuccess} />
        </Card>
      </div>
    </div>
  );
}
