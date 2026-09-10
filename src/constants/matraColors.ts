// src/constants/matraColors.ts
// SINGLE SOURCE OF TRUTH WARNA MATRA & INSTANSI RAPIM TNI 2026

export const MATRA_COLORS = {
  SIPIL:       { hex: '#C9A227', label: 'Emas'      },
  TNI_AD:      { hex: '#22A559', label: 'Hijau'     },
  TNI_AU:      { hex: '#2563EB', label: 'Biru'      },
  TNI_AL:      { hex: '#9CA3AF', label: 'Abu-abu'   },
  MABES:       { hex: '#9333EA', label: 'Ungu'      },
  KEMENTERIAN: { hex: '#E5E7EB', label: 'Putih'     },
} as const;

export const DEFAULT_MATRA_COLOR = { hex: '#9CA3AF', label: 'Default' } as const;

export const MATRA_HEX = {
  SIPIL:       '#C9A227',
  TNI_AD:      '#22A559',
  TNI_AU:      '#2563EB',
  TNI_AL:      '#9CA3AF',
  MABES:       '#9333EA',
  KEMENTERIAN: '#E5E7EB',
} as const;

export type MatraColorKey = keyof typeof MATRA_COLORS;

export interface MatraColorSpec {
  key: MatraColorKey | 'DEFAULT';
  label: string;
  hex: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  bgTint: string; // 12% tint background
  borderTint: string; // 30% border
  badgeClass: string;
}

export const DEFAULT_MATRA_SPEC: MatraColorSpec = {
  key: 'DEFAULT',
  label: 'Default',
  hex: '#9CA3AF',
  bgHex: '#9CA3AF',
  borderHex: '#64748B',
  textHex: '#FFFFFF',
  bgTint: 'rgba(156, 163, 175, 0.12)',
  borderTint: 'rgba(156, 163, 175, 0.30)',
  badgeClass: 'bg-slate-100 text-slate-700 border-slate-300'
};

export const MATRA_COLOR_SPECS: Record<MatraColorKey, MatraColorSpec> = {
  SIPIL: {
    key: 'SIPIL',
    label: 'K/L (Kementerian/Lembaga)',
    hex: MATRA_COLORS.SIPIL.hex,
    bgHex: MATRA_COLORS.SIPIL.hex,
    borderHex: '#A17D16',
    textHex: '#FFFFFF',
    bgTint: 'rgba(201, 162, 39, 0.12)',
    borderTint: 'rgba(201, 162, 39, 0.30)',
    badgeClass: 'bg-[#C9A227]/10 text-[#8F6F12] border-[#C9A227]/30'
  },
  TNI_AD: {
    key: 'TNI_AD',
    label: 'TNI Angkatan Darat',
    hex: MATRA_COLORS.TNI_AD.hex,
    bgHex: MATRA_COLORS.TNI_AD.hex,
    borderHex: '#187A41',
    textHex: '#FFFFFF',
    bgTint: 'rgba(34, 165, 89, 0.12)',
    borderTint: 'rgba(34, 165, 89, 0.30)',
    badgeClass: 'bg-[#22A559]/10 text-[#156E3B] border-[#22A559]/30'
  },
  TNI_AU: {
    key: 'TNI_AU',
    label: 'TNI Angkatan Udara',
    hex: MATRA_COLORS.TNI_AU.hex,
    bgHex: MATRA_COLORS.TNI_AU.hex,
    borderHex: '#1D4ED8',
    textHex: '#FFFFFF',
    bgTint: 'rgba(37, 99, 235, 0.12)',
    borderTint: 'rgba(37, 99, 235, 0.30)',
    badgeClass: 'bg-[#2563EB]/10 text-[#1E40AF] border-[#2563EB]/30'
  },
  TNI_AL: {
    key: 'TNI_AL',
    label: 'TNI Angkatan Laut',
    hex: MATRA_COLORS.TNI_AL.hex,
    bgHex: MATRA_COLORS.TNI_AL.hex,
    borderHex: '#64748B',
    textHex: '#FFFFFF',
    bgTint: 'rgba(156, 163, 175, 0.12)',
    borderTint: 'rgba(156, 163, 175, 0.30)',
    badgeClass: 'bg-[#9CA3AF]/15 text-[#334155] border-[#9CA3AF]/40'
  },
  MABES: {
    key: 'MABES',
    label: 'Mabes TNI',
    hex: MATRA_COLORS.MABES.hex,
    bgHex: MATRA_COLORS.MABES.hex,
    borderHex: '#7E22CE',
    textHex: '#FFFFFF',
    bgTint: 'rgba(147, 51, 234, 0.12)',
    borderTint: 'rgba(147, 51, 234, 0.30)',
    badgeClass: 'bg-[#9333EA]/10 text-[#6B21A8] border-[#9333EA]/30'
  },
  KEMENTERIAN: {
    key: 'KEMENTERIAN',
    label: 'Kementerian / Lembaga',
    hex: MATRA_COLORS.KEMENTERIAN.hex,
    bgHex: MATRA_COLORS.KEMENTERIAN.hex,
    borderHex: '#94A3B8',
    textHex: '#0F172A',
    bgTint: 'rgba(229, 231, 235, 0.20)',
    borderTint: 'rgba(203, 213, 225, 0.50)',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300'
  }
};

export function normalizeMatraKey(matra?: unknown): MatraColorKey | null {
  if (!matra || typeof matra !== 'string') return null;
  const clean = matra.trim().toUpperCase().replace(/\s+/g, '_');
  if (clean === 'AD' || clean === 'TNI_AD' || clean.includes('DARAT')) return 'TNI_AD';
  if (clean === 'AU' || clean === 'TNI_AU' || clean.includes('UDARA')) return 'TNI_AU';
  if (clean === 'AL' || clean === 'TNI_AL' || clean.includes('LAUT')) return 'TNI_AL';
  if (clean === 'SIPIL' || clean === 'NON_TNI' || clean.includes('KEMHAN') || clean === 'VIP') return 'SIPIL';
  if (clean.includes('KEMENTERIAN') || clean.includes('LEMBAGA') || clean === 'POLRI') return 'KEMENTERIAN';
  if (clean === 'MABES' || clean.includes('MABES')) return 'MABES';
  if (clean in MATRA_COLOR_SPECS) return clean as MatraColorKey;
  return null;
}

export function getMatraColor(matra?: unknown): MatraColorSpec {
  if (!matra || typeof matra !== 'string') {
    return DEFAULT_MATRA_SPEC;
  }
  const key = normalizeMatraKey(matra);
  if (!key) return DEFAULT_MATRA_SPEC;
  return MATRA_COLOR_SPECS[key] || DEFAULT_MATRA_SPEC;
}

/**
 * Safe Background Color Accessor
 */
export function safeMatraBg(matra?: unknown): string {
  const spec = getMatraColor(matra);
  return spec?.hex || DEFAULT_MATRA_COLOR.hex;
}

/**
 * Safe Border Color Accessor
 */
export function safeMatraBorder(matra?: unknown): string {
  const spec = getMatraColor(matra);
  return spec?.borderHex || DEFAULT_MATRA_SPEC.borderHex;
}

/**
 * Safe 12% Tint Background Accessor
 */
export function safeMatraTintBg(matra?: unknown): string {
  const spec = getMatraColor(matra);
  return spec?.bgTint || DEFAULT_MATRA_SPEC.bgTint;
}

/**
 * Safe 30% Tint Border Accessor
 */
export function safeMatraTintBorder(matra?: unknown): string {
  const spec = getMatraColor(matra);
  return spec?.borderTint || DEFAULT_MATRA_SPEC.borderTint;
}
