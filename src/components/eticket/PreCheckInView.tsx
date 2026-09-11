import React from 'react';
import { Clock, Armchair, Building2 } from 'lucide-react';

export const PreCheckInView: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Kartu Status Penempatan Pra Check-In */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-center">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Armchair className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Nomor Kursi
          </span>
          <span className="text-base sm:text-lg font-bold text-amber-900 block mt-1">
            Belum Dialokasikan
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">
            Ditetapkan otomatis saat check-in
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-center">
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2">
            <Building2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Akomodasi
          </span>
          <span className="text-base sm:text-lg font-bold text-amber-900 block mt-1">
            Menunggu Check In
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">
            Wisma &amp; kamar disiapkan sistem
          </span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#FFFBEB] border-l-4 border-[#F59E0B] border-t border-r border-b border-amber-200/80 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-[#B45309] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#78350F] tracking-wide">
              MENUNGGU VERIFIKASI KEHADIRAN
            </h4>
            <p className="text-xs sm:text-sm text-[#92400E] leading-relaxed">
              Silakan tunjukkan QR Code di atas kepada petugas saat kedatangan di Gate Gedung Ahmad Yani.
            </p>
            <p className="text-xs text-[#B45309] font-medium pt-1">
              💡 <em>Penetapan nomor kursi dan wisma kamar akan muncul secara otomatis di layar ini setelah verifikasi check-in gate.</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

