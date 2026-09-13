'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { ModernScanner } from '@/components/scanner/ModernScanner';
import { ManualSearchForm } from '@/components/checkin/ManualSearchForm';
import { GuestVerifyModal } from '@/components/checkin/GuestVerifyModal';
import { Card } from '@/components/ui/Card';
import { OFFICIAL_CHECKPOINTS } from '@/lib/constants/checkpoints';
import {
  MapPin,
  AlertCircle,
  QrCode
} from 'lucide-react';

export default function CheckinPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('GATE_UTAMA');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
        }
      } catch {}
    };
    fetchUser();
  }, []);

  const handleProcessScan = async (scannedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      let cleanInput = scannedText.trim();
      if (cleanInput.includes('/ticket/')) {
        const parts = cleanInput.split('/ticket/');
        cleanInput = parts[parts.length - 1].split('?')[0].split('/')[0].trim();
      }

      const isUUID = /^[0-9a-fA-F-]{36}$/.test(cleanInput);

      const res = await fetch('/api/checkin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: cleanInput,
          nrp: !isUUID ? cleanInput : undefined,
          checkpoint_code: selectedCheckpoint
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Data tamu tidak valid');
        setIsProcessing(false);
        return;
      }

      setVerifyResult(data);
      setIsModalOpen(true);
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke basis data presensi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeCheckpointObj = OFFICIAL_CHECKPOINTS.find(c => c.code === selectedCheckpoint) || OFFICIAL_CHECKPOINTS[0];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
      <AdminHeader
        user={currentUser}
        title="Scan QR Gate"
        subtitle="Pemindaian cepat identitas QR Code prajurit dan validasi kehadiran per gate"
      />

      <div className="p-3.5 sm:p-6 max-w-4xl mx-auto w-full space-y-4 sm:space-y-5">
        {/* A. Lokasi Checkpoint Aktif */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor="checkpoint-select-gate" className="text-[11px] text-slate-500 font-semibold block uppercase tracking-wider">
                Lokasi Checkpoint Aktif:
              </label>
              <select
                id="checkpoint-select-gate"
                value={selectedCheckpoint}
                onChange={(e) => setSelectedCheckpoint(e.target.value)}
                className="bg-white text-slate-900 font-bold text-xs sm:text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer mt-1 w-full truncate"
              >
                {OFFICIAL_CHECKPOINTS.map(cp => (
                  <option key={cp.code} value={cp.code}>
                    {cp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {activeCheckpointObj.location && (
            <p className="text-[11px] sm:text-xs text-slate-500 sm:text-right px-1 sm:px-0 sm:max-w-xs font-medium">
              {activeCheckpointObj.location}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* B. Area Scanner QR (Full-Width) */}
        <Card className="p-3.5 sm:p-5 space-y-4 w-full border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Area Scanner QR
              </h3>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Scanner Siaga
            </span>
          </div>

          <ModernScanner onScanResult={handleProcessScan} isProcessing={isProcessing} />
        </Card>

        {/* Manual Fallback Option (Alternatif Tanpa Kamera) */}
        <Card className="p-3.5 sm:p-4 border border-slate-200">
          <h4 className="text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
            Pencarian Manual (Alternatif Tanpa QR)
          </h4>
          <ManualSearchForm onManualCheckin={handleProcessScan} isProcessing={isProcessing} />
        </Card>
      </div>

      {/* C. Compact Modal Result (Single Card) */}
      <GuestVerifyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        result={verifyResult}
      />
    </div>
  );
}
