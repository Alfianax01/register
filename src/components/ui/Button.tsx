import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ad' | 'al' | 'au' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'gold',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#070E0B]';

  const variants = {
    gold: 'bg-gradient-to-r from-[#D4AF37] via-[#F5E296] to-[#B99427] text-slate-950 font-semibold hover:brightness-110 shadow-lg shadow-amber-900/20 active:scale-[0.98]',
    ad: 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white hover:bg-emerald-600 border border-emerald-600/50 shadow-md shadow-emerald-950/50',
    al: 'bg-gradient-to-r from-blue-900 to-blue-800 text-white hover:bg-blue-700 border border-blue-600/50 shadow-md shadow-blue-950/50',
    au: 'bg-gradient-to-r from-sky-800 to-cyan-700 text-white hover:bg-sky-600 border border-sky-500/50 shadow-md shadow-sky-950/50',
    outline: 'border border-[#D4AF37]/50 text-[#F5E296] hover:bg-[#D4AF37]/10 active:bg-[#D4AF37]/20',
    ghost: 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
    danger: 'bg-red-800 text-white hover:bg-red-700 border border-red-600/50'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[50px] font-semibold'
  };

  return (
    <button
      className={twMerge(clsx(baseClasses, variants[variant], sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Memproses...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

