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
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-0.5">
              Nomor Kursi
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#1E3A8A] font-mono">
              {assignment.seat_code || 'A-06'}
            </div>
            <div className="text-xs font-semibold text-slate-700 mt-1">
              Gedung: <span className="text-blue-700">{assignment.gedung || 'Ahmad Yani'}</span>
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-600 mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
            <span>Baris: <strong className="text-slate-900">{assignment.seat_row || (assignment.seat_code ? assignment.seat_code.split('-')[0] : 'A')}</strong></span>
            <span>&bull;</span>
            <span>Nomor: <strong className="text-slate-900">{assignment.seat_num || (assignment.seat_code ? assignment.seat_code.split('-')[1] : '06')}</strong></span>
          </div>
        </div>

        {/* 2. KARTU AKOMODASI WISMA */}
        <div className="p-4 rounded-xl bg-white border-2 border-slate-200 text-center hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-0.5">
              Akomodasi
            </span>
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {assignment.wisma_name || 'Wisma Sudirman'}
            </div>
          </div>
          <div className="text-[11px] font-medium text-emerald-700 mt-2 pt-2 border-t border-slate-100">
            Akomodasi Resmi Delegasi
          </div>
        </div>

        {/* 3. KARTU NOMOR KAMAR */}
        <div className="p-4 rounded-xl bg-white border-2 border-slate-200 text-center hover:border-[#1E3A8A] hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Bed className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block mb-0.5">
              Kamar
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-900 font-mono">
              {assignment.room_code || '203'}
            </div>
          </div>
          <div className="text-[11px] font-medium text-slate-600 mt-2 pt-2 border-t border-slate-100">
            {assignment.room_floor || 'Lantai 2'}
          </div>
        </div>
      </div>
    </div>
  );
};

