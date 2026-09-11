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
      title: 'Belum Hadir',
      value: stats.absentGuests,
      subtext: 'Menunggu Kehadiran',
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
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isLastOdd = idx === cards.length - 1 && cards.length % 2 !== 0;
        return (
          <Card
            key={card.title}
            className={`p-4 sm:p-5 bg-white border border-slate-200/90 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 ${
              isLastOdd ? 'col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.title}
              </span>
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${card.iconColor}`} />
              </div>
            </div>
            <div className={`text-xl sm:text-2xl font-bold font-mono ${card.valueColor}`}>
              {card.value}
            </div>
            <span className="text-xs text-slate-500 mt-1.5 block truncate">
              {card.subtext}
            </span>
          </Card>
        );
      })}
    </div>
  );
};
