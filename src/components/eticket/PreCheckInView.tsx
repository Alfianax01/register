import React from 'react';
import { Clock } from 'lucide-react';

export const PreCheckInView: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#FFFBEB] border-l-4 border-[#F59E0B] border-t border-r border-b border-amber-200/80 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-[#B45309] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Clock className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[#78350F] tracking-wide">
            MENUNGGU VERIFIKASI KEHADIRAN
          </h4>
          <p className="text-xs sm:text-[13px] text-[#92400E] leading-relaxed">
            Silakan tunjukkan QR Code di atas kepada petugas saat kedatangan di Gate Gedung Ahmad Yani.
          </p>
          <p className="text-[11px] text-[#B45309] font-medium pt-1">
            💡 <em>Penetapan nomor kursi dan wisma kamar akan muncul secara otomatis di layar ini setelah verifikasi check-in gate.</em>
          </p>
        </div>
      </div>
    </div>
  );
};
