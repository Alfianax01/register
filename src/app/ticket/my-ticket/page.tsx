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
    <div className="min-h-[calc(100vh-56px)] bg-[#f8fafc] py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Kembali ke Halaman Registrasi</span>
          </Link>
        </div>

        {/* Search Card */}
        <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                Layanan Mandiri
              </Badge>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">
                Pencarian Tiket Resmi
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Cari E-Ticket Peserta
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sudah mendaftar sebelumnya? Masukkan salah satu identitas di bawah untuk mengunduh kembali QR Code dan informasi alokasi kursi/wisma Anda.
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
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={loading}
              className="w-full text-xs font-semibold h-[42px]"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              <span>Temukan E-Ticket Saya</span>
            </Button>
          </form>

          {/* Supported Criteria Indicators */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2.5">
              Kriteria Pencarian yang Didukung:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-slate-700">
                <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-[11px] font-medium">NRP / NIP Prajurit</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-[11px] font-medium">Nomor WhatsApp / HP</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span className="text-[11px] text-slate-700 font-medium">Alamat Email</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-slate-700">
                <QrCode className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-[11px] font-medium">QR Code ID / Token</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center">
            <span className="text-xs text-slate-500">Belum melakukan registrasi acara? </span>
            <Link href="/" className="text-xs font-semibold text-blue-600 hover:underline">
              Buka Formulir Pendaftaran &rarr;
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
