import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'ad' | 'al' | 'au' | 'gold' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className
}) => {
  const base = 'inline-flex items-center font-medium rounded-full border tracking-wide select-none';

  const variants = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    // Branch accents kept clean and subtle
    ad: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    al: 'bg-blue-50 text-blue-800 border-blue-200',
    au: 'bg-sky-50 text-sky-800 border-sky-200',
    gold: 'bg-amber-50 text-amber-900 border-amber-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-0.5'
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
};
