import React from 'react';
import { Check } from 'lucide-react';

interface ProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: { title: string; subtitle: string }[];
}

export const RegistrationProgress: React.FC<ProgressProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full mb-8">
      <nav aria-label="Progres Pendaftaran">
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isDone = currentStep > stepNum;
            const isActive = currentStep === stepNum;

            return (
              <li key={step.title} className="flex-1 relative flex flex-col items-center group">
                {/* Connecting Line */}
                {index !== 0 && (
                  <div
                    className={`absolute top-4 -left-1/2 w-full h-0.5 -translate-y-1/2 z-0 transition-colors ${
                      currentStep >= stepNum ? 'bg-[#D4AF37]' : 'bg-[#1D3B2F]'
                    }`}
                  />
                )}

                {/* Step Circle */}
                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-[#D4AF37] text-slate-950 ring-4 ring-[#D4AF37]/20 shadow-md'
                      : isActive
                      ? 'bg-[#15442E] text-[#F5E296] border-2 border-[#D4AF37] ring-4 ring-[#D4AF37]/30 shadow-lg'
                      : 'bg-[#0F221A] text-slate-500 border border-[#1E3B2F]'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
                </div>

                {/* Labels */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-[11px] font-bold tracking-wide uppercase ${
                      isActive ? 'text-[#F5E296]' : isDone ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-500">
                    {step.subtitle}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

