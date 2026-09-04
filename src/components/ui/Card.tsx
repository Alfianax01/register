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
  const base = 'rounded-lg border transition-all';

  const variants: Record<CardVariant, string> = {
    default: 'bg-white border-slate-200/80 text-[#0F172A] shadow-sm',
    subtle: 'bg-slate-50/70 border-slate-200/60 text-[#0F172A]',
    elevated: 'bg-white border-slate-200/80 text-[#0F172A] shadow-md',
    flat: 'bg-white border-slate-200 text-[#0F172A]',
    interactive: 'bg-white border-slate-200/80 text-[#0F172A] shadow-sm hover:shadow-md hover:border-slate-300 cursor-pointer',
    'gold-border': 'bg-white border-slate-200/80 text-[#0F172A] shadow-sm',
    glass: 'bg-white/95 backdrop-blur-md border-slate-200 text-[#0F172A] shadow-sm'
  };

  return (
    <div className={twMerge(clsx(base, variants[variant] || variants.default, className))} {...props}>
      {children}
    </div>
  );
};
