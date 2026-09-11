'use client';

import React, { useState } from 'react';
import { TniEmblem } from '@/components/emblems/TniEmblem';

interface HeroLogoProps {
  logoUrl?: string;
  altText?: string;
  className?: string;
}

const STATIC_FALLBACK_LOGO = '/images/logo-tni-rapim.png';

export const HeroLogo: React.FC<HeroLogoProps> = ({
  logoUrl,
  altText = 'Lambang Resmi Markas Besar TNI',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const [triedStaticFallback, setTriedStaticFallback] = useState(false);

  React.useEffect(() => {
    setImgError(false);
    setTriedStaticFallback(false);
  }, [logoUrl]);

  const activeSrc = !imgError && logoUrl
    ? logoUrl
    : !triedStaticFallback
      ? STATIC_FALLBACK_LOGO
      : null;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative inline-flex items-center justify-center p-2 group transition-transform duration-300 hover:scale-[1.02]">
        {activeSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={activeSrc}
            alt={altText}
            onError={() => {
              console.warn('[HeroLogo] Gagal render gambar:', {
                failedSrc: activeSrc?.slice(0, 60),
                wasStatic: activeSrc === STATIC_FALLBACK_LOGO
              });
              if (!triedStaticFallback && activeSrc !== STATIC_FALLBACK_LOGO) {
                setTriedStaticFallback(true);
              } else {
                setImgError(true);
              }
            }}
            className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] lg:w-[220px] lg:h-[220px] object-contain drop-shadow-md group-hover:drop-shadow-xl transition-all duration-300 select-none block"
          />
        ) : (
          <div className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] lg:w-[220px] lg:h-[220px] flex items-center justify-center bg-transparent">
            <TniEmblem matra="MABES" size="lg" className="scale-150 sm:scale-[2] lg:scale-[2.5]" />
          </div>
        )}
      </div>
    </div>
  );
};
