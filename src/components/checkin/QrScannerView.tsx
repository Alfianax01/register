'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QrScannerViewProps {
  onScan: (decodedText: string) => void;
  isProcessing: boolean;
}

export const QrScannerView: React.FC<QrScannerViewProps> = ({ onScan, isProcessing }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const scannerRef = useRef<any>(null);

  // Play audio chime using Web Audio API synthesis (100% reliable, zero asset dependencies)
  const playSound = (type: 'success' | 'warning') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        // High military double confirmation chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.1); // E6
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        // Low warning beep
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.setValueAtTime(240, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {}
  };

  const startCamera = async () => {
    setErrorMsg('');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader-viewport');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          if (!isProcessing) {
            playSound('success');
            onScan(decodedText);
          }
        },
        () => {}
      );

      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setErrorMsg('Kamera tidak dapat diakses atau diblokir oleh peramban. Anda dapat menggunakan pencarian manual NRP.');
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="w-full rounded-2xl bg-[#091811] border border-[#1E3B2F] p-4 flex flex-col items-center">
      {/* Viewport Box */}
      <div className="relative w-full max-w-sm aspect-square bg-[#050C08] rounded-xl border-2 border-[#D4AF37]/40 overflow-hidden flex items-center justify-center">
        <div id="qr-reader-viewport" className="w-full h-full" />

        {/* Scan Target Overlay when camera active */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 border-2 border-[#D4AF37] rounded-xl relative">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#F5E296] -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#F5E296] -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#F5E296] -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#F5E296] -mb-1 -mr-1" />
              {/* Laser Scanline */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scanline shadow-[0_0_8px_#34d399]" />
            </div>
          </div>
        )}

        {/* Inactive Camera Placeholder */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#070E0B]/90">
            <div className="w-14 h-14 rounded-full bg-[#0F261C] border border-[#1E3B2F] flex items-center justify-center text-[#D4AF37]">
              <Camera className="w-7 h-7" />
            </div>
            <p className="text-xs text-slate-300 font-serif">
              Kamera Siaga Pemindaian QR Code
            </p>
            <p className="text-[10px] text-slate-400 max-w-xs">
              Klik tombol di bawah untuk mengaktifkan kamera smartphone atau webcam meja registrasi.
            </p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 z-20">
            <div className="w-8 h-8 rounded-full border-3 border-[#D4AF37] border-t-transparent animate-spin" />
            <span className="text-xs text-[#F5E296] font-mono">Memverifikasi Data Prajurit...</span>
          </div>
        )}
      </div>

      {/* Camera Controls */}
      <div className="mt-4 w-full flex items-center justify-between gap-3 max-w-sm">
        {!cameraActive ? (
          <Button variant="gold" size="md" onClick={startCamera} className="flex-1 text-xs font-bold">
            <Camera className="w-4 h-4 mr-1.5" />
            <span>Aktifkan Kamera Scanner</span>
          </Button>
        ) : (
          <Button variant="danger" size="md" onClick={stopCamera} className="flex-1 text-xs">
            <CameraOff className="w-4 h-4 mr-1.5" />
            <span>Matikan Kamera</span>
          </Button>
        )}

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2.5 rounded-lg border text-xs transition-colors ${
            soundEnabled
              ? 'bg-[#122A1E] text-emerald-400 border-emerald-600/50'
              : 'bg-[#0E1F18] text-slate-500 border-[#1E3B2F]'
          }`}
          title={soundEnabled ? 'Audio Chime Aktif' : 'Audio Chime Dimatikan'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {errorMsg && (
        <p className="mt-3 text-[11px] text-amber-300 text-center max-w-sm">
          {errorMsg}
        </p>
      )}
    </div>
  );
};

