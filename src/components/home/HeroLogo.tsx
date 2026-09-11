'use client';

import React, { useState } from 'react';
import { TniEmblem } from '@/components/emblems/TniEmblem';

interface HeroLogoProps {
  logoUrl?: string;
  altText?: string;
  className?: string;
}

export const HeroLogo: React.FC<HeroLogoProps> = ({
  logoUrl,
  altText = 'Lambang Resmi Markas Besar TNI',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const hasValidLogo = Boolean(logoUrl && !imgError);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 lg:p-7 shadow-card hover:shadow-card-hover inline-flex items-center justify-center transition-all duration-300">
        {hasValidLogo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt={altText}
            onError={() => setImgError(true)}
            className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[140px] lg:h-[140px] object-contain bg-transparent block select-none"
          />
        ) : (
          <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[140px] lg:h-[140px] flex items-center justify-center bg-transparent">
            <TniEmblem matra="MABES" size="lg" className="scale-125 sm:scale-150 lg:scale-[2]" />
          </div>
        )}
      </div>
    </div>
  );
};
