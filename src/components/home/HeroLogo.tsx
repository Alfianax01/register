'use client';

import React, { useState } from 'react';
import { TniEmblem } from '@/components/emblems/TniEmblem';

interface HeroLogoProps {
  logoUrl?: string;
  altText?: string;
  className?: string;
}

/**
 * Hero Logo Container Khusus Standar Institusi Resmi:
 * - Container: background putih bersih, border 1px #e2e8f0, border-radius 24px, padding 16px, shadow ringan
 * - Responsive: Desktop 96px, Tablet 72px, Mobile 64px
 * - object-fit: contain (tidak pernah dicrop)
 * - Fallback: placeholder logo default resmi TNI jika image gagal dimuat atau belum diatur
 */
export const HeroLogo: React.FC<HeroLogoProps> = ({
  logoUrl,
  altText = 'Lambang Resmi Markas Besar TNI',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  // Jika URL berubah, reset error state
  React.useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const hasValidLogo = Boolean(logoUrl && !imgError);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Container Khusus Logo */}
      <div
        className="bg-white border border-[#e2e8f0] rounded-[24px] p-[16px] shadow-sm inline-flex items-center justify-center transition-all duration-300 hover:shadow-md"
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
          borderRadius: '24px',
          padding: '16px'
        }}
      >
        {hasValidLogo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt={altText}
            onError={() => setImgError(true)}
            className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] lg:w-[96px] lg:h-[96px] object-contain bg-transparent block select-none"
            style={{ objectFit: 'contain', backgroundColor: 'transparent' }}
          />
        ) : (
          <div className="w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] lg:w-[96px] lg:h-[96px] flex items-center justify-center bg-transparent">
            <TniEmblem matra="MABES" size="lg" className="scale-110 sm:scale-125 lg:scale-150" />
          </div>
        )}
      </div>
    </div>
  );
};

