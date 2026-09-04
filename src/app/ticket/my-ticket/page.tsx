'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Search, Award, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MyTicketPage() {
  const router = useRouter();
  const [nrp, setNrp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nrp.trim()) {
      setError('Masukkan NRP atau nomor identitas terdaftar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/guests?q=${encodeURIComponent(nrp.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.guests || data.guests.length === 0) {
        setError('Data prajurit dengan NRP tersebut tidak ditemukan.');
        setLoading(false);
        return;
      }

      const guest = data.guests[0];
      router.push(`/ticket/${guest.qr_token}`);
    } catch {
      setError('Terjadi kendala saat memeriksa data.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <h1 className="text-base font-semibold text-slate-900">
            Cari E-Ticket Saya
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Masukkan Nomor Registrasi Prajurit (NRP) atau NIP yang Anda gunakan saat mendaftar.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            label="NRP Prajurit / Identitas"
            placeholder="Contoh: 519284 / 1102941"
            value={nrp}
            onChange={(e) => setNrp(e.target.value)}
            leftIcon={<Award className="w-4 h-4" />}
            required
            autoFocus
          />

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button variant="primary" size="md" type="submit" isLoading={loading} className="w-full text-xs font-semibold">
            <Search className="w-3.5 h-3.5 mr-1.5" />
            <span>Cari E-Ticket</span>
          </Button>

          <div className="pt-2 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">Belum terdaftar? </span>
            <Link href="/" className="text-xs font-semibold text-blue-600 hover:underline">
              Buka Form Registrasi &rarr;
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
