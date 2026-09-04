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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2';

  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[#1E40AF] text-white hover:bg-[#1e3a8a] active:bg-[#172554] shadow-sm',
    accent: 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-sm',
    gold: 'bg-[#1E40AF] text-white hover:bg-[#1e3a8a] shadow-sm', // alias
    ad: 'bg-[#16A34A] text-white hover:bg-[#15803d] shadow-sm',
    al: 'bg-[#1E40AF] text-white hover:bg-[#1e3a8a] shadow-sm',
    au: 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-sm',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80',
    outline: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'text-[13px] px-3 py-1.5 min-h-[38px] gap-1.5',
    md: 'text-[15px] px-5 py-2.5 min-h-[48px] gap-2',
    lg: 'text-[16px] px-6 py-3 min-h-[52px] gap-2.5'
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
