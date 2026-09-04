import React from 'react';
import { Card } from '@/components/ui/Card';
import { Users, CheckCircle2, Clock, Armchair, Bed } from 'lucide-react';

interface StatOverviewProps {
  stats: {
    totalGuests: number;
    presentGuests: number;
    absentGuests: number;
    percentagePresent: number;
    accommodationNeeded: number;
    accommodationAssigned: number;
    totalSeats: number;
    occupiedSeats: number;
  };
}

export const StatOverviewCards: React.FC<StatOverviewProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Tamu Terdaftar',
      value: stats.totalGuests,
      subtext: 'Prajurit & Delegasi',
      icon: Users,
      color: 'text-slate-200',
      borderColor: 'border-[#1E3B2F]',
      bgColor: 'bg-[#0E2019]'
    },
    {
      title: 'Telah Hadir (Presensi)',
      value: stats.presentGuests,
      subtext: `${stats.percentagePresent}% Tingkat Kehadiran`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-600/50',
      bgColor: 'bg-emerald-950/40'
    },
    {
      title: 'Belum Check-In',
      value: stats.absentGuests,
      subtext: 'Dalam Perjalanan / Belum Tiba',
      icon: Clock,
      color: 'text-amber-400',
      borderColor: 'border-amber-600/50',
      bgColor: 'bg-amber-950/40'
    },
    {
      title: 'Kursi Paripurna Dialokasikan',
      value: `${stats.occupiedSeats} / ${stats.totalSeats}`,
      subtext: `${stats.totalSeats > 0 ? Math.round((stats.occupiedSeats / stats.totalSeats) * 100) : 0}% Terisi`,
      icon: Armchair,
      color: 'text-[#F5E296]',
      borderColor: 'border-amber-500/50',
      bgColor: 'bg-amber-950/30'
    },
    {
      title: 'Kamar Wisma Terisi',
      value: `${stats.accommodationAssigned} / ${stats.accommodationNeeded}`,
      subtext: 'Dari Permintaan Menginap',
      icon: Bed,
      color: 'text-cyan-300',
      borderColor: 'border-cyan-600/50',
      bgColor: 'bg-cyan-950/40'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`p-4 ${card.bgColor} ${card.borderColor} transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className={`text-2xl font-serif font-bold ${card.color}`}>
              {card.value}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              {card.subtext}
            </span>
          </Card>
        );
      })}
    </div>
  );
};

