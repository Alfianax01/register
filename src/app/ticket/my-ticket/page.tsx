'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TniEmblem } from '@/components/emblems/TniEmblem';
import { Search, Award, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function MyTicketPage() {
  const router = useRouter();
  const [nrp, setNrp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nrp.trim()) {
      setError('Mohon masukkan NRP atau nomor identitas terdaftar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/guests?q=${encodeURIComponent(nrp.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.guests || data.guests.length === 0) {
        setError('Data prajurit / tamu dengan NRP tersebut tidak ditemukan. Silakan lakukan registrasi terlebih dahulu.');
        setLoading(false);
        return;
      }

      // Found guest! Redirect to their ticket
      const guest = data.guests[0];
      router.push(`/ticket/${guest.qr_token}`);
    } catch (err) {
      setError('Terjadi kendala saat memeriksa data.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <TniEmblem matra="MABES" size="lg" />
        </div>
        <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest block mb-1">
          PENCARIAN KARTU TANDA PESERTA
        </span>
        <h1 className="text-2xl font-serif font-black text-slate-100">
          Cari E-Ticket Saya
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Masukkan NRP Prajurit atau nomor identitas yang telah Anda daftarkan.
        </p>
      </div>

      <Card variant="gold-border" className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <Input
            label="NRP Prajurit / Nomor Identitas"
            placeholder="Contoh: 519284 / 1102941"
            value={nrp}
            onChange={(e) => setNrp(e.target.value)}
            leftIcon={<Award className="w-4 h-4" />}
            required
            autoFocus
          />

          {error && (
            <div className="p-3.5 rounded-lg bg-red-950/80 border border-red-600 text-red-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button variant="gold" size="lg" type="submit" isLoading={loading} className="w-full text-xs">
            <Search className="w-4 h-4 mr-2" />
            <span>Cari E-Ticket</span>
          </Button>

          <div className="pt-4 border-t border-[#1E3B2F] text-center">
            <span className="text-xs text-slate-400">Belum melakukan pendaftaran? </span>
            <Link href="/register" className="text-xs font-semibold text-[#F5E296] hover:underline">
              Daftar Sekarang &rarr;
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

