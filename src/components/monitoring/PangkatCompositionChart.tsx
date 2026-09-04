import React from 'react';
import { Card } from '@/components/ui/Card';

interface PangkatCompositionProps {
  pangkatCount: Record<string, number>;
  totalGuests: number;
}

export const PangkatCompositionChart: React.FC<PangkatCompositionProps> = ({ pangkatCount, totalGuests }) => {
  const items = [
    { label: 'Perwira Tinggi (PATI Bintang 4 s/d 1)', count: pangkatCount.PATI || 0, color: 'bg-[#D4AF37]', text: 'text-[#F5E296]' },
    { label: 'Perwira Menengah (PAMEN Kolonel/Letkol/Mayor)', count: pangkatCount.PAMEN || 0, color: 'bg-emerald-500', text: 'text-emerald-300' },
    { label: 'Perwira Pertama (PAMA Kapten/Lettu/Letda)', count: pangkatCount.PAMA || 0, color: 'bg-cyan-500', text: 'text-cyan-300' },
    { label: 'Bintara & Tamtama Pendukung', count: pangkatCount.BINTARA_TAMTAMA || 0, color: 'bg-indigo-500', text: 'text-indigo-300' },
    { label: 'Pejabat Sipil / Diplomatik / Asing', count: pangkatCount.SIPIL || 0, color: 'bg-slate-400', text: 'text-slate-300' },
  ];

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1E3B2F] pb-2">
        <h3 className="text-sm font-serif font-bold text-slate-100">
          Distribusi Golongan Kepangkatan
        </h3>
        <span className="text-[10px] text-slate-400 font-mono">
          Hirarki Senioritas
        </span>
      </div>

      <div className="space-y-3.5">
        {items.map(item => {
          const pct = totalGuests > 0 ? Math.round((item.count / totalGuests) * 100) : 0;
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${item.text}`}>{item.label}</span>
                <span className="font-mono text-slate-300">
                  <strong>{item.count}</strong> ({pct}%)
                </span>
              </div>
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

