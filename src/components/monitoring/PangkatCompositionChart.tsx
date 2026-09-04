import React from 'react';
import { Card } from '@/components/ui/Card';

interface PangkatCompositionProps {
  pangkatCount: Record<string, number>;
  totalGuests: number;
}

export const PangkatCompositionChart: React.FC<PangkatCompositionProps> = ({ pangkatCount, totalGuests }) => {
  const items = [
    { label: 'Perwira Tinggi (PATI Bintang 4 s/d 1)', count: pangkatCount.PATI || 0, color: 'bg-blue-600', textColor: 'text-slate-900' },
    { label: 'Perwira Menengah (PAMEN Kolonel/Letkol/Mayor)', count: pangkatCount.PAMEN || 0, color: 'bg-emerald-500', textColor: 'text-slate-900' },
    { label: 'Perwira Pertama (PAMA Kapten/Lettu/Letda)', count: pangkatCount.PAMA || 0, color: 'bg-cyan-500', textColor: 'text-slate-900' },
    { label: 'Bintara & Tamtama Pendukung', count: pangkatCount.BINTARA_TAMTAMA || 0, color: 'bg-indigo-500', textColor: 'text-slate-900' },
    { label: 'Pejabat Sipil / Diplomatik / Asing', count: pangkatCount.SIPIL || 0, color: 'bg-slate-400', textColor: 'text-slate-900' },
  ];

  return (
    <Card className="p-5 space-y-4 bg-white border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Distribusi Golongan Kepangkatan
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          Hirarki Senioritas
        </span>
      </div>

      <div className="space-y-3.5">
        {items.map(item => {
          const pct = totalGuests > 0 ? Math.round((item.count / totalGuests) * 100) : 0;
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${item.textColor}`}>{item.label}</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  <strong>{item.count}</strong> ({pct}%)
                </span>
              </div>
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
