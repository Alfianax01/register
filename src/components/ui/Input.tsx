import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, id, className, required, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(2, 8);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-[14px] font-medium text-slate-700 select-none">
            {label} {required && <span className="text-[#1E40AF] font-bold">*</span>}
          </label>
        )}
        <div className="relative rounded-md">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={twMerge(
              clsx(
                'block w-full rounded-md bg-white text-slate-900 border text-[15px] h-[50px] transition-colors',
                'placeholder:text-slate-400',
                'focus:outline-none focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/15 shadow-sm',
                leftIcon ? 'pl-10' : 'pl-3.5',
                rightIcon ? 'pr-10' : 'pr-3.5',
                error
                  ? 'border-rose-500 text-rose-900 focus:border-rose-600 focus:ring-rose-500/15'
                  : 'border-slate-200 hover:border-slate-300',
                className
              )
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-[13px] text-rose-600 font-medium animate-in fade-in duration-150">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-desc`} className="text-[13px] text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
