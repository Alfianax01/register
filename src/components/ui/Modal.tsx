'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-[95vw] sm:max-w-sm',
    md: 'max-w-[95vw] sm:max-w-md',
    lg: 'max-w-[95vw] sm:max-w-lg',
    xl: 'max-w-[95vw] sm:max-w-xl',
    '2xl': 'max-w-[95vw] sm:max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Surface */}
      <div
        className={`relative w-full ${maxWidths[maxWidth]} rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors ml-auto flex-shrink-0"
            aria-label="Tutup dialog"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
