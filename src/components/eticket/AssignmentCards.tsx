import React from 'react';
import { Assignment } from '@/types';
import { Armchair, Building2, Bed } from 'lucide-react';

interface AssignmentCardsProps {
  assignment?: Assignment | null;
}

export const AssignmentCards: React.FC<AssignmentCardsProps> = ({ assignment }) => {
  if (!assignment) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#1E3A8A]">
        <Armchair className="w-4 h-4 text-blue-700" />
        <span>PENEMPATAN PESERTA &amp; AKOMODASI</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. KARTU NOMOR KURSI */}
        <div className="p-4 rounded-xl bg-white border-2 border-slate-200 text-center hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Armchair className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-1">
              Nomor Kursi
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#1E3A8A] font-mono">
              {assignment.seat_code || 'A-01'}
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {assignment.seat_area || 'Area VVIP'}
          </div>
        </div>

        {/* 2. KARTU WISMA */}
        <div className="p-4 rounded-xl bg-white border-2 border-slate-200 text-center hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-1">
              Wisma
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {assignment.wisma_name || 'Wisma Garuda'}
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Akomodasi Resmi
          </div>
        </div>

        {/* 3. KARTU NOMOR KAMAR */}
        <div className="p-4 rounded-xl bg-white border-2 border-slate-200 text-center hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Bed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-1">
              Nomor Kamar
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-900 font-mono">
              {assignment.room_code || 'GAR-101'}
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {assignment.room_floor || 'Lantai 1'}
          </div>
        </div>
      </div>
    </div>
  );
};
