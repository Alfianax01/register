'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Upload, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export type ScannerStatus = 'requesting' | 'active' | 'not_found' | 'detecting' | 'success';

interface ModernScannerProps {
  onScanResult: (tokenOrData: string) => void;
  isProcessing?: boolean;
}

export const ModernScanner: React.FC<ModernScannerProps> = ({
  onScanResult,
  isProcessing = false
}) => {
  const [status, setStatus] = useState<ScannerStatus>('requesting');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerInstanceRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // High-precision clean audio feedback using Web Audio API
  const playPing = useCallback((success: boolean = true) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {}
  }, []);

  // Initialize Camera automatically on mount
  const startScanner = useCallback(async () => {
    setStatus('requesting');
    setErrorMessage('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      // Stop existing instance if running
      if (scannerInstanceRef.current) {
        try {
          await scannerInstanceRef.current.stop();
          scannerInstanceRef.current.clear();
        } catch {}
      }

      const html5QrCode = new Html5Qrcode('interactive-scanner-viewport');
      scannerInstanceRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.75);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0
        },
        (decodedText) => {
          if (!isProcessing) {
            playPing(true);
            setStatus('success');
            setLastScanned(decodedText);
            onScanResult(decodedText);

            // Revert to detecting status after 2 seconds
            setTimeout(() => {
              setStatus('detecting');
            }, 2000);
          }
        },
        () => {
          // Scanner is actively searching, QR not detected yet
          setStatus((prev) => (prev === 'success' ? 'success' : 'detecting'));
        }
      );

      setStatus('detecting');
    } catch (err: any) {
      console.warn('Camera error:', err);
      setStatus('not_found');
      setErrorMessage(
        err?.message?.includes('Permission') || err?.name === 'NotAllowedError'
          ? 'Izin kamera diblokir. Harap izinkan akses kamera di browser Anda atau gunakan upload gambar di bawah.'
          : 'Kamera tidak ditemukan pada perangkat ini. Gunakan fitur upload gambar QR sebagai alternatif.'
      );
    }
  }, [isProcessing, onScanResult, playPing]);

  const stopScanner = useCallback(async () => {
    if (scannerInstanceRef.current) {
      try {
        await scannerInstanceRef.current.stop();
        scannerInstanceRef.current.clear();
      } catch {}
      scannerInstanceRef.current = null;
    }
  }, []);

  // Auto-start camera when page loads
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  // Handle image file upload fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      // Create temporary instance to decode image
      const html5QrCode = new Html5Qrcode('file-qr-decoder-hidden');
      const decodedResult = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      playPing(true);
      setStatus('success');
      setLastScanned(decodedResult);
      onScanResult(decodedResult);

      setTimeout(() => {
        setStatus('detecting');
      }, 2500);
    } catch (err) {
      playPing(false);
      setErrorMessage('QR Code tidak terdeteksi pada gambar yang diunggah. Pastikan gambar jelas dan tidak buram.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full flex flex-col space-y-3.5">
      {/* Hidden container for file decoding */}
      <div id="file-qr-decoder-hidden" className="hidden" />

      {/* Top Status Pill Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {status === 'success' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              QR Berhasil Dibaca
            </span>
          ) : status === 'detecting' || status === 'active' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Kamera Aktif &bull; Memindai
            </span>
          ) : status === 'requesting' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
              Menginisialisasi Kamera...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              Kamera Tidak Aktif
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={startScanner}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
          title="Segarkan koneksi kamera"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reload</span>
        </button>
      </div>

      {/* Main Scanner Viewport Frame */}
      <div className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-200/80 shadow-subtle flex items-center justify-center">
        {/* Real video render div for Html5Qrcode */}
        <div id="interactive-scanner-viewport" className="w-full h-full object-cover" />

        {/* Reticle / High-Tech Bounding Box */}
        {(status === 'detecting' || status === 'active' || status === 'success') && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className={`w-[68%] h-[68%] rounded-xl transition-all duration-150 relative border-2 ${
                status === 'success'
                  ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'border-blue-500/80'
              }`}
            >
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-white -mt-0.5 -ml-0.5 rounded-tl-xs" />
              <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-white -mt-0.5 -mr-0.5 rounded-tr-xs" />
              <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-white -mb-0.5 -ml-0.5 rounded-bl-xs" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-white -mb-0.5 -mr-0.5 rounded-br-xs" />

              {/* Laser line when detecting */}
              {status === 'detecting' && (
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scanner-laser shadow-[0_0_8px_#60a5fa]" />
              )}
            </div>
          </div>
        )}

        {/* Camera Permission / Not Found Overlay */}
        {status === 'not_found' && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <CameraOff className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Kamera Tidak Tersedia</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                {errorMessage || 'Pastikan izin akses kamera diberikan atau gunakan opsi unggah berkas QR.'}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={startScanner}
              className="text-xs mt-1"
            >
              <Camera className="w-3.5 h-3.5 mr-1" />
              <span>Coba Hubungkan Ulang</span>
            </Button>
          </div>
        )}

        {/* Global isProcessing Loading State */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-20">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-700">Memverifikasi Data QR...</span>
          </div>
        )}
      </div>

      {/* Fallback File Upload Area */}
      <div className="pt-1">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
          id="qr-image-upload-input"
        />

        <label
          htmlFor="qr-image-upload-input"
          className="w-full border border-dashed border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70 rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer text-xs text-slate-600 transition-colors select-none"
        >
          {isUploading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span className="font-medium text-slate-700">Menganalisis Gambar QR...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Atau <strong className="text-blue-600 font-semibold hover:underline">unggah foto QR</strong> (PNG/JPG)
              </span>
            </>
          )}
        </label>
      </div>

      {/* Helpful Guidance */}
      <p className="text-[11px] text-slate-400 text-center leading-normal">
        Arahkan kamera ke QR Code e-ticket prajurit. Data akan otomatis terisi ke form sebelah kanan.
      </p>
    </div>
  );
};

