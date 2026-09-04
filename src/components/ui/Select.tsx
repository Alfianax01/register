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
    const selectId = id || props.name || Math.random().toString(36).substring(2, 8);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5 select-none">
            {label} {required && <span className="text-blue-600 font-bold">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            className={twMerge(
              clsx(
                'block w-full rounded-lg bg-white text-slate-900 border text-xs h-[42px] px-3 pr-8 appearance-none transition-colors cursor-pointer',
                'focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15',
                error
                  ? 'border-rose-500 text-rose-900 focus:border-rose-600'
                  : 'border-slate-200 hover:border-slate-300',
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
                <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                  {opt.label}
                </option>
              ))
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="mt-1 text-[11px] font-medium text-rose-600 animate-in fade-in duration-150">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-[11px] text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
