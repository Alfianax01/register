'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModernScanner } from '@/components/scanner/ModernScanner';
import { ModernRegistrationForm } from '@/components/register/ModernRegistrationForm';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  QrCode,
  Sparkles,
  ArrowRight,
  Shield,
  Calendar,
  MapPin,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [scannedGuestData, setScannedGuestData] = useState<any>(null);
  const [isVerifyingScan, setIsVerifyingScan] = useState<boolean>(false);
  const [registeredGuest, setRegisteredGuest] = useState<{ token: string; guest: any } | null>(null);

  // When scanner detects a QR code
  const handleScanResult = async (decodedText: string) => {
    setIsVerifyingScan(true);
    const trimmed = decodedText.trim();

    try {
      // 1. Try resolving token against existing guests in DB
      const res = await fetch(`/api/ticket/${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        setScannedGuestData(data.guest);
        showToast('Tamu Ditemukan', {
          type: 'success',
          message: `${data.guest.pangkat} ${data.guest.nama} terverifikasi dalam basis data.`
        });
        setIsVerifyingScan(false);
        return;
      }

      // 2. Try searching by NRP or ID
      const searchRes = await fetch(`/api/guests?q=${encodeURIComponent(trimmed)}`);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.guests && searchData.guests.length > 0) {
          const guest = searchData.guests[0];
          setScannedGuestData(guest);
          showToast('Data NRP Ditemukan', {
            type: 'success',
            message: `Data untuk NRP ${guest.nrp} dimuat ke formulir.`
          });
          setIsVerifyingScan(false);
          return;
        }
      }

      // 3. Fallback: treat as raw NRP/code to prefill form
      setScannedGuestData({ nrp: trimmed });
      showToast('Kode QR Terbaca', {
        type: 'info',
        message: `Nilai "${trimmed}" telah diisikan ke kolom NRP/Identitas.`
      });
    } catch {
      setScannedGuestData({ nrp: trimmed });
    } finally {
      setIsVerifyingScan(false);
    }
  };

  const handleRegistrationSuccess = (token: string, guest: any) => {
    setRegisteredGuest({ token, guest });
  };

  return (
    <div className="w-full py-8 sm:py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Top Header & Context */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm">
                Sistem Terpadu 2026
              </Badge>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">
                Gedung Ahmad Yani, Mabes TNI Cilangkap
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Registrasi & Check-In Mandiri
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Pindai kartu QR Code Anda pada pemindai di sebelah kiri atau lengkapi formulir registrasi online di sebelah kanan.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>4 – 6 September 2026</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-xs">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>TNI PRIMA</span>
            </div>
          </div>
        </div>

        {/* Success Banner if newly registered */}
        {registeredGuest && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-950">
                  Registrasi Selesai: E-Ticket Diterbitkan
                </p>
                <p className="text-[11px] text-emerald-700">
                  Kartu tanda peserta atas nama {registeredGuest.guest?.nama || 'Prajurit'} siap digunakan untuk absensi hari-H.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push(`/ticket/${registeredGuest.token}`)}
                className="w-full sm:w-auto text-xs font-semibold"
              >
                <span>Buka E-Ticket Digital</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* MAIN 2-COLUMN SPLIT LAYOUT (Max 1200px) */}
        <section aria-label="Sistem Pemindaian dan Pendaftaran" className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* LEFT COLUMN: Modern Scanner (5 Cols on Desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                      Pemindai QR & Barcode
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Deteksi otomatis kamera ponsel atau webcam
                    </p>
                  </div>
                </div>
              </div>

              {/* The high-precision scanner */}
              <ModernScanner
                onScanResult={handleScanResult}
                isProcessing={isVerifyingScan}
              />
            </Card>

            {/* Quick Helper Card */}
            <Card variant="subtle" className="p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-800">
                Punya Kartu Undangan Fisik?
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Arahkan QR code cetak ke kamera di atas. Sistem akan membaca nomor identitas Anda dan langsung mengisikan data dinas ke formulir.
              </p>
            </Card>
          </div>

          {/* RIGHT COLUMN: Registration Form (7 Cols on Desktop) */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Formulir Registrasi Tamu Undangan
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lengkapi identitas kedinasan untuk alokasi tempat duduk dan wisma.
                  </p>
                </div>
                <Badge variant="neutral" size="sm">
                  Online
                </Badge>
              </div>

              {/* Registration Form with auto-fill hook */}
              <ModernRegistrationForm
                scannedData={scannedGuestData}
                onSuccess={handleRegistrationSuccess}
              />
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
