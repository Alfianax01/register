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
  const base = 'inline-flex items-center font-semibold rounded-md border select-none';

  const variants: Record<BadgeVariant, string> = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
    primary: 'bg-blue-50 text-primary border-blue-200',
    accent: 'bg-blue-50 text-accent border-blue-200',
    success: 'bg-emerald-50 text-success border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    ad: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30',
    al: 'bg-slate-200/50 text-slate-800 border-slate-300',
    au: 'bg-sky-500/10 text-sky-800 border-sky-500/30',
    gold: 'bg-amber-500/10 text-amber-900 border-amber-500/30',
    slate: 'bg-slate-100 text-slate-900 border-slate-200'
  };

  const sizes: Record<BadgeSize, string> = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1'
  };

  return (
    <span className={twMerge(clsx(base, variants[variant] || variants.neutral, sizes[size], className))}>
      {children}
    </span>
  );
};
