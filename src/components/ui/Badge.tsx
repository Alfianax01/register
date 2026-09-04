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
    success: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    ad: 'bg-emerald-50 text-[#16A34A] border-emerald-200',
    al: 'bg-blue-50 text-[#1E40AF] border-blue-200',
    au: 'bg-sky-50 text-sky-800 border-sky-200',
    gold: 'bg-blue-50 text-[#1E40AF] border-blue-200',
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
