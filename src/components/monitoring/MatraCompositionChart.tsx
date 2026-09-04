import React from 'react';
import { Card } from '@/components/ui/Card';
import { TniEmblem } from '@/components/emblems/TniEmblem';

interface MatraCompositionProps {
  matraCount: Record<string, number>;
  totalGuests: number;
}

export const MatraCompositionChart: React.FC<MatraCompositionProps> = ({ matraCount, totalGuests }) => {
  const items = [
    { key: 'AD', label: 'TNI Angkatan Darat', count: matraCount.AD || 0, color: 'bg-emerald-600', text: 'text-emerald-400' },
    { key: 'AL', label: 'TNI Angkatan Laut', count: matraCount.AL || 0, color: 'bg-blue-600', text: 'text-blue-400' },
    { key: 'AU', label: 'TNI Angkatan Udara', count: matraCount.AU || 0, color: 'bg-sky-500', text: 'text-sky-400' },
    { key: 'MABES', label: 'Mabes TNI / Balakpus', count: matraCount.MABES || 0, color: 'bg-amber-500', text: 'text-amber-400' },
    { key: 'NON_TNI', label: 'Kemhan / Tamu Negara', count: matraCount.NON_TNI || 0, color: 'bg-slate-500', text: 'text-slate-400' },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1E3B2F] pb-2">
        <h3 className="text-sm font-serif font-bold text-slate-100">
          Komposisi Matra & Kontingen
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
          Total: {totalGuests} Tamu
        </span>
      </div>

      <div className="space-y-3.5">
        {items.map(item => {
          const pct = totalGuests > 0 ? Math.round((item.count / totalGuests) * 100) : 0;
          return (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${item.text}`}>{item.label}</span>
                <span className="font-mono text-slate-300">
                  <strong>{item.count}</strong> ({pct}%)
                </span>
              </div>
              {/* Progress Track */}
              <div className="w-full h-2 rounded-full bg-[#050C08] overflow-hidden border border-[#173023]">
                <div
                  className={`h-full ${item.color} transition-all duration-500 rounded-full`}
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

