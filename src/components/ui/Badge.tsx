import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'ad' | 'al' | 'au' | 'success' | 'warning' | 'danger' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className
}) => {
  const base = 'inline-flex items-center font-semibold rounded-full border tracking-wide uppercase';

  const variants = {
    gold: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
    ad: 'bg-emerald-950 text-emerald-300 border-emerald-600',
    al: 'bg-blue-950 text-blue-300 border-blue-600',
    au: 'bg-cyan-950 text-cyan-300 border-cyan-500',
    success: 'bg-emerald-900/80 text-emerald-200 border-emerald-500',
    warning: 'bg-amber-900/80 text-amber-200 border-amber-500',
    danger: 'bg-red-950/90 text-red-300 border-red-600',
    slate: 'bg-slate-900 text-slate-300 border-slate-700'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
};

