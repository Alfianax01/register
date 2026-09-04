'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, AlertCircle, ArrowLeft, Phone, Mail, Award, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function MyTicketPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setError('Masukkan NRP, No. HP, Email, atau QR Code ID Anda');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/guests?q=${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();

      if (!res.ok || !data.guests || data.guests.length === 0) {
        setError('Data tamu atau prajurit tidak ditemukan. Pastikan nomor HP, email, atau NRP yang Anda masukkan sesuai.');
        setLoading(false);
        return;
      }

      // If exact token or single match, go straight to ticket
      const guest = data.guests[0];
      router.push(`/ticket/${guest.qr_token}`);
    } catch {
      setError('Terjadi kendala saat memeriksa data. Silakan coba beberapa saat lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f8fafc] py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-[14px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Kembali ke Halaman Pendaftaran</span>
          </Link>
        </div>

        {/* Search Card */}
        <Card className="p-7 sm:p-9 bg-white border border-slate-200/90 shadow-md rounded-lg space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                Layanan Mandiri
              </Badge>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-[13px] text-[#64748B] font-medium">
                Pencarian Tiket Peserta
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
              Cari E-Ticket Peserta
            </h1>
            <p className="text-[14px] text-[#475569] leading-relaxed">
              Masukkan salah satu identitas di bawah untuk mengunduh kembali QR Code dan informasi alokasi kursi atau wisma Anda.
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Identitas Pendaftaran (NRP / No. HP / Email / QR ID)"
              placeholder="Contoh: 1102941, 08123456789, atau nama@tni.mil.id"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              required
              autoFocus
            />

            {error && (
              <div className="p-3.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={loading}
              className="w-full text-[15px] font-medium h-[50px]"
            >
              <Search className="w-4 h-4 mr-2" />
              <span>Temukan E-Ticket Saya</span>
            </Button>
          </form>

          {/* Supported Criteria Indicators */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wide mb-3">
              Kriteria Pencarian yang Didukung:
            </p>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-[#0F172A]">
                <Award className="w-4 h-4 text-[#1E40AF] flex-shrink-0" />
                <span className="text-[13px] font-medium">NRP / NIP Prajurit</span>
              </div>
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-[#0F172A]">
                <Phone className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                <span className="text-[13px] font-medium">Nomor WhatsApp / HP</span>
              </div>
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-[#0F172A]">
                <Mail className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                <span className="text-[13px] font-medium">Alamat Email</span>
              </div>
              <div className="p-3 rounded-sm bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-[#0F172A]">
                <QrCode className="w-4 h-4 text-slate-700 flex-shrink-0" />
                <span className="text-[13px] font-medium">QR Code ID / Token</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[13px] text-[#64748B]">Belum melakukan registrasi acara? </span>
            <Link href="/" className="text-[13px] font-semibold text-[#1E40AF] hover:underline">
              Buka Formulir Pendaftaran &rarr;
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
