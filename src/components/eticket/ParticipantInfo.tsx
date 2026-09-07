import React from 'react';
import { Guest } from '@/types';
import { Shield, Award, Briefcase, Building2 } from 'lucide-react';

interface ParticipantInfoProps {
  guest: Guest;
}

export const ParticipantInfo: React.FC<ParticipantInfoProps> = ({ guest }) => {
  const getMatraBadge = (matra?: string) => {
    switch (matra) {
      case 'AD':
        return { bg: 'bg-[#1F7A3E]', text: 'text-white', label: 'TNI AD' };
      case 'AU':
        return { bg: 'bg-[#2563EB]', text: 'text-white', label: 'TNI AU' };
      case 'AL':
        return { bg: 'bg-[#475569]', text: 'text-white', label: 'TNI AL' };
      case 'MABES':
        return { bg: 'bg-amber-700', text: 'text-white', label: 'Mabes TNI' };
      default:
        return { bg: 'bg-slate-700', text: 'text-white', label: 'Kementerian / Sipil' };
    }
  };

  const matraBadge = getMatraBadge(guest.matra);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-4">
      {/* Nama Lengkap & Matra */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3.5">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Nama Lengkap
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mt-0.5 break-words">
            {guest.nama}
          </h3>
          {guest.nrp && guest.nrp !== '-' && (
            <span className="font-mono text-xs text-slate-600 font-medium block mt-0.5">
              NRP: {guest.nrp}
            </span>
          )}
        </div>

        <span
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase flex-shrink-0 shadow-xs ${matraBadge.bg} ${matraBadge.text}`}
        >
          {matraBadge.label}
        </span>
      </div>

      {/* Grid Informasi Kedinasan */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <span className="text-slate-500 font-medium text-[11px] uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Pangkat</span>
          </span>
          <p className="font-semibold text-slate-900 truncate">{guest.pangkat || '-'}</p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-500 font-medium text-[11px] uppercase flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Matra</span>
          </span>
          <p className="font-semibold text-slate-900 truncate">{matraBadge.label}</p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-500 font-medium text-[11px] uppercase flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Kesatuan / Satker</span>
          </span>
          <p className="font-semibold text-slate-900 truncate">{guest.satker || guest.satuan || '-'}</p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-500 font-medium text-[11px] uppercase flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
            <span>Jabatan Dinas</span>
          </span>
          <p className="font-semibold text-slate-900 truncate">{guest.jabatan || '-'}</p>
        </div>
      </div>
    </div>
  );
};

