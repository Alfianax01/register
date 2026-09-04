import React from 'react';
import { MatraType } from '@/types';

interface EmblemProps {
  matra?: MatraType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TniEmblem: React.FC<EmblemProps> = ({ matra = 'MABES', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  // Beautiful stylized SVG emblems for Tri Dharma Eka Karma / Tri Matra
  if (matra === 'AD') {
    return (
      <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(27,94,57,0.5)]">
          <circle cx="50" cy="50" r="46" fill="#0E3B23" stroke="#D4AF37" strokeWidth="3" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#2B8754" strokeWidth="1.5" strokeDasharray="2 2" />
          {/* Star and sword */}
          <polygon points="50,15 54,28 67,28 56,36 60,49 50,41 40,49 44,36 33,28 46,28" fill="#D4AF37" />
          <path d="M50 38 L50 82" stroke="#FFF" strokeWidth="4" strokeLinecap="round" />
          <path d="M42 45 L58 45" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="84" r="3" fill="#D4AF37" />
          {/* Wings / Laurel */}
          <path d="M30 65 Q 22 50 35 40 Q 28 60 40 70" fill="#D4AF37" opacity="0.9" />
          <path d="M70 65 Q 78 50 65 40 Q 72 60 60 70" fill="#D4AF37" opacity="0.9" />
        </svg>
      </div>
    );
  }

  if (matra === 'AL') {
    return (
      <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(21,62,117,0.5)]">
          <circle cx="50" cy="50" r="46" fill="#0C274C" stroke="#D4AF37" strokeWidth="3" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#2058A3" strokeWidth="1.5" strokeDasharray="2 2" />
          {/* Star & Anchor */}
          <polygon points="50,14 53,24 64,24 55,30 58,40 50,34 42,40 45,30 36,24 47,24" fill="#D4AF37" />
          <circle cx="50" cy="38" r="5" fill="none" stroke="#FFF" strokeWidth="2.5" />
          <path d="M50 43 L50 78" stroke="#FFF" strokeWidth="4" />
          <path d="M38 52 L62 52" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M26 65 Q 50 88 74 65" fill="none" stroke="#D4AF37" strokeWidth="4.5" strokeLinecap="round" />
          <polygon points="26,62 23,68 30,68" fill="#D4AF37" />
          <polygon points="74,62 71,68 77,68" fill="#D4AF37" />
        </svg>
      </div>
    );
  }

  if (matra === 'AU') {
    return (
      <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_8px_rgba(27,107,147,0.5)]">
          <circle cx="50" cy="50" r="46" fill="#10435C" stroke="#D4AF37" strokeWidth="3" />
          <circle cx="50" cy="50" r="41" fill="none" stroke="#288FC4" strokeWidth="1.5" strokeDasharray="2 2" />
          {/* Eagle / Wings & Star */}
          <polygon points="50,14 53,24 64,24 55,30 58,40 50,34 42,40 45,30 36,24 47,24" fill="#D4AF37" />
          <path d="M50 36 L18 48 Q 36 55 45 68 L50 82 L55 68 Q 64 55 82 48 Z" fill="#D4AF37" />
          <circle cx="50" cy="54" r="7" fill="#0C2D45" stroke="#FFF" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // MABES TNI / TRI DHARMA EKA KARMA (All 3 stars + Garuda Shield)
  return (
    <div className={`relative flex items-center justify-center ${sizes[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]">
        <circle cx="50" cy="50" r="47" fill="#0A1812" stroke="#D4AF37" strokeWidth="3.5" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#C5A059" strokeWidth="1" strokeDasharray="2 3" />
        
        {/* Red and White Arch Header */}
        <path d="M 22 35 A 38 38 0 0 1 78 35" fill="none" stroke="#B91C1C" strokeWidth="3" />
        <path d="M 24 38 A 38 38 0 0 1 76 38" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />

        {/* 3 Stars representing Tri Matra */}
        <polygon points="50,15 52,21 58,21 53,25 55,31 50,27 45,31 47,25 42,21 48,21" fill="#FFD700" />
        <polygon points="35,21 37,26 42,26 38,29 40,34 35,31 31,34 33,29 29,26 34,26" fill="#FFD700" />
        <polygon points="65,21 67,26 72,26 68,29 70,34 65,31 61,34 63,29 59,26 64,26" fill="#FFD700" />

        {/* Center Tri Matra Insignia (Sword AD, Anchor AL, Wings AU) */}
        {/* AU Wings */}
        <path d="M50 48 L22 45 Q 38 58 48 64 L50 66 L52 64 Q 62 58 78 45 Z" fill="#D4AF37" opacity="0.9" />
        {/* AL Anchor */}
        <path d="M36 62 Q 50 78 64 62" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" />
        {/* AD Sword */}
        <line x1="50" y1="36" x2="50" y2="76" stroke="#FFF" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="43" y1="44" x2="57" y2="44" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="50" cy="78" r="2.5" fill="#D4AF37" />

        {/* Padi & Kapas Wreath around base */}
        <path d="M22 68 Q 28 85 50 87 Q 72 85 78 68" fill="none" stroke="#D4AF37" strokeWidth="2" strokeDasharray="2 3" />
      </svg>
    </div>
  );
};

