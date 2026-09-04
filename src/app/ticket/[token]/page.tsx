'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MilitaryIdCard } from '@/components/ticket/MilitaryIdCard';
import { TicketActions } from '@/components/ticket/TicketActions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RotateCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TicketPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketData, setTicketData] = useState<{ guest: any; qr_code: string } | null>(null);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/ticket/${token}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'E-Ticket tidak ditemukan atau tautan salah.');
        setTicketData(null);
      } else {
        setTicketData(data);
      }
    } catch (err) {
      setError('Gagal memuat data E-Ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTicket();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin" />
        <p className="text-sm font-serif text-slate-300">Memuat data e-ticket kedinasan...</p>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 border-red-700/60 bg-red-950/20 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-950 border border-red-600 flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold text-slate-100">
            E-Ticket Tidak Ditemukan
          </h2>
          <p className="text-xs text-slate-300">
            {error || 'Token tautan undangan tidak valid dalam sistem.'}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/ticket/my-ticket">
              <Button variant="gold" size="md" className="w-full text-xs">
                Cari Berdasarkan NRP / Identitas
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="md" className="w-full text-xs">
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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between no-print">
        <Link href="/" className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Beranda Acara</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTicket}
          className="text-xs text-[#D4AF37]"
        >
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Segarkan Status</span>
        </Button>
      </div>

      {/* ID Card Display */}
      <MilitaryIdCard guest={guest} qrCodeUrl={qr_code} />

      {/* Actions (Download, Print, WhatsApp) */}
      <TicketActions guest={guest} qrCodeUrl={qr_code} />

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-[#0C1A14] border border-[#1E3B2F] text-xs text-slate-400 space-y-2 no-print">
        <h5 className="font-semibold text-slate-200 uppercase tracking-wide text-[11px] text-[#D4AF37]">
          Petunjuk Kehadiran Hari-H:
        </h5>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
          <li>Harap tiba di Gedung Ahmad Yani 30 menit sebelum sesi dimulai.</li>
          <li>Tunjukkan QR Code di atas kepada petugas scan di lobi utama atau gerbang gate.</li>
          <li>Nomor kursi Anda akan muncul secara otomatis saat pemindaian berhasil.</li>
        </ul>
      </div>
    </div>
  );
}

