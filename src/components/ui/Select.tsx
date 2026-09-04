import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options = [], children, helperText, error, id, className, required, ...props }, ref) => {
    const selectId = id || props.name || Math.random().toString(36).substring(2, 7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            {label} {required && <span className="text-amber-400">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            className={twMerge(
              clsx(
                'block w-full rounded-lg bg-[#0F221A] text-slate-100 border text-sm min-h-[46px] px-3.5 pr-10 appearance-none transition-colors cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent',
                error
                  ? 'border-red-500/80 focus:ring-red-500'
                  : 'border-[#1E3B2F] hover:border-[#2D5A47]',
                className
              )
            )}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          >
            {children ? (
              children
            ) : (
              options.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#0B1712] text-slate-100 py-1">
                  {opt.label}
                </option>
              ))
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

