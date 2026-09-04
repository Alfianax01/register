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
      title: 'Total Tamu',
      value: stats.totalGuests,
      subtext: 'Prajurit & Delegasi',
      icon: Users,
      iconColor: 'text-slate-600',
      iconBg: 'bg-slate-100',
      valueColor: 'text-slate-900'
    },
    {
      title: 'Telah Hadir',
      value: stats.presentGuests,
      subtext: `${stats.percentagePresent}% Tingkat Kehadiran`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      valueColor: 'text-emerald-700'
    },
    {
      title: 'Belum Check-In',
      value: stats.absentGuests,
      subtext: 'Dalam Perjalanan / Belum Tiba',
      icon: Clock,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
      valueColor: 'text-amber-700'
    },
    {
      title: 'Kursi Terisi',
      value: `${stats.occupiedSeats} / ${stats.totalSeats}`,
      subtext: `${stats.totalSeats > 0 ? Math.round((stats.occupiedSeats / stats.totalSeats) * 100) : 0}% Kapasitas Sidang`,
      icon: Armchair,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      valueColor: 'text-blue-700'
    },
    {
      title: 'Kamar Terisi',
      value: `${stats.accommodationAssigned} / ${stats.accommodationNeeded}`,
      subtext: 'Dari Permintaan Menginap',
      icon: Bed,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      valueColor: 'text-indigo-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="p-4 bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide truncate">
                {card.title}
              </span>
              <div className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold font-mono ${card.valueColor}`}>
              {card.value}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {card.subtext}
            </span>
          </Card>
        );
      })}
    </div>
  );
};
