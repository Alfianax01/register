import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: 'TEREGISTRASI' | 'CHECK-IN' | 'REGISTRASI' | 'CHECK_IN' | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const isCheckIn = status === 'CHECK_IN' || status === 'CHECK-IN' || status === 'HADIR';

  if (isCheckIn) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm tracking-wide shadow-xs ${className}`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
        <span>CHECK-IN BERHASIL</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs sm:text-sm tracking-wide shadow-xs ${className}`}
    >
      <Clock className="w-4 h-4 text-amber-600 stroke-[2.5]" />
      <span>TEREGISTRASI</span>
    </div>
  );
};
