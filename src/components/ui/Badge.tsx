import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'ad' | 'al' | 'au' | 'gold' | 'slate';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className
}) => {
  const base = 'inline-flex items-center font-medium rounded-sm border select-none';

  const variants: Record<BadgeVariant, string> = {
    neutral: 'bg-slate-100 text-[#64748B] border-slate-200/80',
    primary: 'bg-blue-50 text-[#1E40AF] border-blue-200',
    accent: 'bg-blue-50 text-[#2563EB] border-blue-200',
    success: 'bg-emerald-50 text-[#22A559] border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    ad: 'bg-[#22A559]/10 text-[#156E3B] border-[#22A559]/30 font-semibold',
    al: 'bg-[#9CA3AF]/20 text-[#334155] border-[#9CA3AF]/40 font-semibold',
    au: 'bg-[#2563EB]/10 text-[#1D4ED8] border-[#2563EB]/30 font-semibold',
    gold: 'bg-[#C9A227]/10 text-[#8F6F12] border-[#C9A227]/30 font-semibold',
    slate: 'bg-slate-100 text-[#0F172A] border-slate-200'
  };

  const sizes: Record<BadgeSize, string> = {
    sm: 'text-[12px] px-2 py-0.5',
    md: 'text-[13px] px-2.5 py-1'
  };

  return (
    <span className={twMerge(clsx(base, variants[variant] || variants.neutral, sizes[size], className))}>
      {children}
    </span>
  );
};
