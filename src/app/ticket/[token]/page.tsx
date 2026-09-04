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
        setError(data.error || 'E-Ticket tidak ditemukan.');
        setTicketData(null);
      } else {
        setTicketData(data);
      }
    } catch {
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
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Memuat kartu tanda peserta...</p>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              E-Ticket Tidak Ditemukan
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {error || 'Tautan atau token tiket yang Anda buka tidak valid.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/ticket/my-ticket">
              <Button variant="primary" size="md" className="w-full text-xs">
                Cari Berdasarkan NRP
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
      {/* Header Bar */}
      <div className="max-w-md mx-auto flex items-center justify-between no-print">
        <Link href="/" className="inline-flex items-center text-xs text-slate-500 hover:text-slate-900 font-medium">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Kembali</span>
        </Link>
        <button
          onClick={fetchTicket}
          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <RotateCw className="w-3 h-3 mr-1" />
          <span>Segarkan Status</span>
        </button>
      </div>

      {/* ID Card Display */}
      <MilitaryIdCard guest={guest} qrCodeUrl={qr_code} />

      {/* Actions */}
      <TicketActions guest={guest} qrCodeUrl={qr_code} />
    </div>
  );
}
