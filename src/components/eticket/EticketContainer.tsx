'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Guest, StatusKehadiran } from '@/types';
import { TicketCard } from './TicketCard';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { RotateCw, Printer, Download, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface EticketContainerProps {
  initialToken: string;
}

export const EticketContainer: React.FC<EticketContainerProps> = ({ initialToken }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [guest, setGuest] = useState<Guest | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [checkinDetails, setCheckinDetails] = useState<any>(null);

  // Status tracker untuk mendeteksi perubahan status real-time
  const prevStatusRef = useRef<string | null>(null);

  const fetchTicket = useCallback(async (isPolling = false) => {
    if (!initialToken) return;

    if (!isPolling) setRefreshing(true);

    try {
      const res = await fetch(`/api/ticket/${initialToken}`, {
        cache: 'no-store'
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (!isPolling) {
          setError(errData.error || 'E-Ticket tidak ditemukan.');
        }
        return;
      }

      const data = await res.json();
      const currentGuest = data.guest;

      // Deteksi transisi status dari REGISTRASI ke CHECK_IN
      const prevStatus = prevStatusRef.current;
      const currentStatus = currentGuest?.status_kehadiran;

      if (prevStatus === 'REGISTRASI' && currentStatus === 'CHECK_IN') {
        showToast('✅ Check-in berhasil! Kehadiran Anda telah terverifikasi di gerbang masuk.', {
          type: 'success',
          duration: 6000
        });
      }

      prevStatusRef.current = currentStatus;

      setGuest(currentGuest);
      setQrCodeUrl(data.qr_code || '');
      setCheckinDetails(currentGuest?.checkin_details || null);
      setError('');
    } catch {
      if (!isPolling) {
        setError('Gagal memuat data E-Ticket.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [initialToken, showToast]);

  // Initial Load
  useEffect(() => {
    fetchTicket(false);
  }, [fetchTicket]);

  // Polling Strategy: Setiap 5 detik jika masih REGISTRASI, berhenti saat CHECK_IN
  useEffect(() => {
    if (!guest || guest.status_kehadiran === 'CHECK_IN') {
      return; // Stop polling jika sudah CHECK-IN (data sudah final)
    }

    const intervalId = setInterval(() => {
      fetchTicket(true);
    }, 5000);

    // Refetch saat window focus
    const handleFocus = () => {
      fetchTicket(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [guest?.status_kehadiran, fetchTicket]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-9 h-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          Memuat data E-Ticket resmi...
        </p>
      </div>
    );
  }

  if (error || !guest) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">E-Ticket Tidak Ditemukan</h2>
            <p className="text-xs text-slate-500 mt-1">
              {error || 'Tautan atau token tiket yang Anda buka tidak terdaftar.'}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/ticket">
              <Button variant="primary" size="md" className="w-full text-xs">
                Cari Berdasarkan NRP
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="md" className="w-full text-xs">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActualCheckIn = guest.status_kehadiran === 'CHECK_IN';
  const effectiveStatus: StatusKehadiran = isActualCheckIn ? 'CHECK_IN' : 'REGISTRASI';
  const isEffectiveCheckIn = effectiveStatus === 'CHECK_IN';

  const effectiveCheckinDetails = checkinDetails || null;

  return (
    <div className="w-full max-w-[520px] mx-auto px-3 sm:px-4 py-6 space-y-5">
      {/* Top Nav Action (no-print) */}
      <div className="flex items-center justify-between text-xs no-print">
        <Link
          href="/"
          className="inline-flex items-center text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Beranda</span>
        </Link>

        <button
          onClick={() => fetchTicket(false)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800 font-medium transition-colors"
          title="Segarkan data tiket"
        >
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Memperbarui...' : 'Segarkan Status'}</span>
        </button>
      </div>

      {/* Single Unified Ticket Card (No layout shift, identical DOM structure) */}
      <TicketCard
        guest={guest}
        qrCodeUrl={qrCodeUrl}
        status={effectiveStatus}
        seat={guest.seat_number || guest.seat_assignment || guest.assignment?.seat_code || 'A-01'}
        gedung={guest.building || guest.assignment?.gedung || 'Gedung Ahmad Yani'}
        ruangan={guest.room || guest.assignment?.seat_area || 'Ruang Sidang Utama'}
        wisma={guest.wisma_name || guest.assignment?.wisma_name || (guest.butuh_akomodasi ? 'Wisma Kartika' : 'Tidak Menginap')}
        room={guest.room_number || guest.assignment?.room_code || (guest.butuh_akomodasi ? '101A' : '-')}
        checkinDetails={effectiveCheckinDetails}
      />

      {/* Action Buttons (no-print) */}
      <div className="flex items-center gap-2.5 no-print">
        <Button
          variant="outline"
          size="md"
          onClick={handlePrint}
          className="flex-1 text-xs gap-1.5 font-medium border-slate-200 hover:bg-slate-50 text-slate-700 bg-white shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>Cetak Halaman</span>
        </Button>

        <Link href={`/api/ticket/${initialToken}/pdf`} target="_blank" className="flex-1">
          <Button
            variant="primary"
            size="md"
            className="w-full text-xs gap-1.5 font-medium bg-[#1E3A8A] hover:bg-[#1E40AF] shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF</span>
          </Button>
        </Link>
      </div>

      {/* Footer Branding */}
      <p className="text-center text-xs text-slate-400 font-medium">
        Markas Besar Tentara Nasional Indonesia &bull; Sistem Terpadu RAPIM 2026
      </p>
    </div>
  );
};

