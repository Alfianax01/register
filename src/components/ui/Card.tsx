import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'flat' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const base = 'rounded-xl border transition-all';

  const variants = {
    default: 'bg-white border-slate-200 text-slate-900 shadow-card',
    subtle: 'bg-slate-50/50 border-slate-200/80 text-slate-900',
    flat: 'bg-white border-slate-200 text-slate-900',
    interactive: 'bg-white border-slate-200 text-slate-900 shadow-card hover:border-slate-300 hover:shadow-subtle cursor-pointer'
  };

  return (
    <div className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </div>
  );
};
