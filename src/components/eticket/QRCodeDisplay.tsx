import React from 'react';
import { Check } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  isCheckIn: boolean;
  token?: string;
  nama?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCodeUrl,
  isCheckIn,
  token,
  nama
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-3 my-4">
      <div
        className={`relative w-[210px] h-[210px] p-2 bg-white rounded-xl border-2 ${
          isCheckIn ? 'border-slate-300' : 'border-dashed border-slate-300 shadow-sm'
        } flex items-center justify-center overflow-hidden transition-all duration-300`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrCodeUrl}
          alt={`QR Code ${nama || 'Peserta'}`}
          className={`w-[190px] h-[190px] object-contain transition-all duration-300 ${
            isCheckIn ? 'opacity-40 grayscale blur-[0.3px]' : 'opacity-100'
          }`}
        />

        {/* Overlay saat sudah check in */}
        {isCheckIn && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-center">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md mb-1.5">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white font-bold text-xs tracking-wider border border-white/20 shadow-lg">
              SUDAH DIGUNAKAN
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 inline-block">
          ID: {token ? `${token.substring(0, 18)}...` : 'TNI-QR-CODE'}
        </span>
        <p className="text-[12px] text-slate-500 max-w-[320px] mx-auto">
          {isCheckIn
            ? 'QR Code telah berhasil diverifikasi oleh petugas Gate.'
            : 'Tunjukkan QR Code ini kepada petugas saat kedatangan di lokasi acara.'}
        </p>
      </div>
    </div>
  );
};

