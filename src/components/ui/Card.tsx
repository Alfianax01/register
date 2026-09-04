import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gold-border' | 'elevated' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const base = 'rounded-xl border transition-all';

  const variants = {
    default: 'bg-[#0E2019]/90 border-[#1B3B2E] text-slate-100 shadow-md',
    'gold-border': 'bg-[#0E2019]/90 border-[#D4AF37]/50 shadow-lg shadow-amber-950/20 text-slate-100',
    elevated: 'bg-[#12271F] border-[#224A3B] shadow-xl text-slate-100',
    glass: 'bg-[#0C1B14]/80 backdrop-blur-md border-[#1F3D30] text-slate-100'
  };

  return (
    <div className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </div>
  );
};

