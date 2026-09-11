import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type CardVariant = 'default' | 'subtle' | 'elevated' | 'flat' | 'interactive' | 'gold-border' | 'glass';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  ...props
}) => {
  const base = 'rounded-xl border transition-all';

  const variants: Record<CardVariant, string> = {
    default: 'bg-white border-slate-200/90 shadow-card text-slate-900',
    subtle: 'bg-slate-50/80 border-slate-200/60 text-slate-900',
    elevated: 'bg-white border-slate-200 shadow-card-hover text-slate-900',
    flat: 'bg-white border-slate-200 text-slate-900',
    interactive: 'bg-white border-slate-200 shadow-card hover:shadow-card-hover hover:border-blue-300 cursor-pointer text-slate-900',
    'gold-border': 'bg-white border-blue-200 shadow-card text-slate-900',
    glass: 'bg-white/95 backdrop-blur-md border-slate-200 shadow-card text-slate-900'
  };

  return (
    <div className={twMerge(clsx(base, variants[variant] || variants.default, className))} {...props}>
      {children}
    </div>
  );
};
