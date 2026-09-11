import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold' | 'ad' | 'al' | 'au';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover active:bg-blue-950 shadow-card',
    accent: 'bg-accent text-white hover:bg-blue-700 shadow-card',
    gold: 'bg-primary text-white hover:bg-primary-hover shadow-card',
    ad: 'bg-success text-white hover:bg-emerald-700 shadow-card',
    al: 'bg-primary text-white hover:bg-primary-hover shadow-card',
    au: 'bg-accent text-white hover:bg-blue-700 shadow-card',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80',
    outline: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-card',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-card'
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'text-sm px-3.5 py-2 min-h-[44px] gap-2',
    md: 'text-base px-5 py-2.5 min-h-[48px] gap-2.5',
    lg: 'text-base sm:text-lg px-6 py-3.5 min-h-[52px] gap-3'
  };

  return (
    <button
      className={twMerge(clsx(baseClasses, variants[variant] || variants.primary, sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{loadingText || 'Memuat...'}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
