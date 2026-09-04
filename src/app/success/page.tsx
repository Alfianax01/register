'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MilitaryIdCard } from '@/components/ticket/MilitaryIdCard';
import { TicketActions } from '@/components/ticket/TicketActions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, RotateCw, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryToken = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState<{ guest: any; qr_code: string } | null>(null);
  const [activeToken, setActiveToken] = useState<string>('');

  useEffect(() => {
    let token = queryToken;
    if (!token && typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('tni_registration_success');
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed.token;
        }
        if (!token) {
          token = localStorage.getItem('latest_registered_token');
        }
      } catch {}
    }

    if (token) {
      setActiveToken(token);
      fetchTicket(token);
    } else {
      setLoading(false);
    }
  }, [queryToken]);

  const fetchTicket = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch('/api/ticket/' + encodeURIComponent(token));
      const data = await res.json();
      if (res.ok) {
        setTicketData(data);
      }
    } catch (err) {
      console.error('Fetch ticket error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Menerbitkan kartu tanda peserta resmi...</p>
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#1E40AF]">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Temukan E-Ticket Anda
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan Nomor HP, Email, atau NRP untuk menampilkan kartu tanda peserta Anda.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/ticket/my-ticket">
              <Button variant="primary" size="md" className="w-full text-xs">
                Cari E-Ticket
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="md" className="w-full text-xs">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { guest, qr_code } = ticketData;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="max-w-md mx-auto flex items-center justify-between no-print">
        <Link href="/" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900 font-medium">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Kembali ke Beranda</span>
        </Link>
        <button
          onClick={() => fetchTicket(activeToken)}
          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <RotateCw className="w-3 h-3 mr-1" />
          <span>Segarkan Data</span>
        </button>
      </div>

      <div className="max-w-md mx-auto p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3 shadow-xs no-print">
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="space-y-0.5">
          <h2 className="text-[14px] font-semibold text-emerald-950">
            Pendaftaran Berhasil Terverifikasi
          </h2>
          <p className="text-[12px] text-emerald-800 leading-relaxed">
            Kartu peserta resmi atas nama <strong>{guest.nama}</strong> telah terbit. Simpan QR Code di bawah ini untuk ditunjukkan di gerbang masuk.
          </p>
        </div>
      </div>

      <MilitaryIdCard guest={guest} qrCodeUrl={qr_code} />
      <TicketActions guest={guest} qrCodeUrl={qr_code} />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
