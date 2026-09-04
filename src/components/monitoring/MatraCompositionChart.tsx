import React from 'react';
import { Card } from '@/components/ui/Card';

interface MatraCompositionProps {
  matraCount: Record<string, number>;
  totalGuests: number;
}

export const MatraCompositionChart: React.FC<MatraCompositionProps> = ({ matraCount, totalGuests }) => {
  const items = [
    { key: 'AD', label: 'TNI Angkatan Darat', count: matraCount.AD || 0, color: 'bg-emerald-600', textColor: 'text-slate-900' },
    { key: 'AL', label: 'TNI Angkatan Laut', count: matraCount.AL || 0, color: 'bg-blue-600', textColor: 'text-slate-900' },
    { key: 'AU', label: 'TNI Angkatan Udara', count: matraCount.AU || 0, color: 'bg-sky-500', textColor: 'text-slate-900' },
    { key: 'MABES', label: 'Mabes TNI / Balakpus', count: matraCount.MABES || 0, color: 'bg-amber-500', textColor: 'text-slate-900' },
    { key: 'NON_TNI', label: 'Kemhan / Tamu Negara', count: matraCount.NON_TNI || 0, color: 'bg-slate-500', textColor: 'text-slate-900' },
  ];

  return (
    <Card className="p-5 space-y-4 bg-white border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Komposisi Matra & Kontingen
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          Total: {totalGuests} Tamu
        </span>
      </div>

      <div className="space-y-3.5">
        {items.map(item => {
          const pct = totalGuests > 0 ? Math.round((item.count / totalGuests) * 100) : 0;
          return (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${item.textColor}`}>{item.label}</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  <strong>{item.count}</strong> ({pct}%)
                </span>
              </div>
              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-300 rounded-full`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
