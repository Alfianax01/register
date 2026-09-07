import React from 'react';
import { CheckCircle2, MapPin, Clock, UserCheck } from 'lucide-react';

interface CheckInDetailsProps {
  details?: {
    gate: string;
    waktu: string;
    petugas: string;
  } | null;
}

export const CheckInDetails: React.FC<CheckInDetailsProps> = ({ details }) => {
  if (!details) return null;

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] shadow-xs space-y-3.5">
      {/* Header Banner */}
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-emerald-200/80">
        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-950">
            CHECK-IN BERHASIL TERVERIFIKASI
          </h4>
          <span className="text-[11px] text-emerald-700 font-medium">
            Tanda kehadiran fisik resmi di lokasi
          </span>
        </div>
      </div>

      {/* Grid Informasi Detail */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200/60 space-y-0.5">
          <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span>Gate Masuk</span>
          </span>
          <p className="font-bold text-slate-900 truncate">{details.gate || 'Gate Utama'}</p>
        </div>

        <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200/60 space-y-0.5">
          <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>Waktu Kehadiran</span>
          </span>
          <p className="font-bold text-slate-900 truncate">{details.waktu || 'WIB'}</p>
        </div>

        <div className="p-2.5 rounded-lg bg-white/80 border border-emerald-200/60 space-y-0.5">
          <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>Petugas Scanner</span>
          </span>
          <p className="font-bold text-slate-900 truncate">{details.petugas || 'Gate Scanner'}</p>
        </div>
      </div>
    </div>
  );
};

