// src/constants/matraColors.ts
// SINGLE SOURCE OF TRUTH WARNA MATRA & INSTANSI RAPIM TNI 2026

export const MATRA_COLORS = {
  SIPIL:       '#C9A227', // Gold
  TNI_AD:      '#22A559', // Hijau
  TNI_AU:      '#2563EB', // Biru
  TNI_AL:      '#9CA3AF', // Abu-abu
  MABES:       '#9333EA', // Ungu
  KEMENTERIAN: '#E5E7EB', // Abu muda
  SIPIL:       { hex: '#C9A227', label: 'Emas'      },
  TNI_AD:      { hex: '#22A559', label: 'Hijau'     },
  TNI_AU:      { hex: '#2563EB', label: 'Biru'      },
  TNI_AL:      { hex: '#9CA3AF', label: 'Abu-abu'   },
  MABES:       { hex: '#9333EA', label: 'Ungu'      },
  KEMENTERIAN: { hex: '#E5E7EB', label: 'Putih'     },
} as const;

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
  key: MatraColorKey;
  label: string;
  hex: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  bgTint: string; // 12% tint background
  borderTint: string; // 30% border
  badgeClass: string;
}

export const MATRA_COLOR_SPECS: Record<MatraColorKey, MatraColorSpec> = {
  SIPIL: {
    key: 'SIPIL',
    label: 'Sipil / Non-TNI',
    hex: MATRA_COLORS.SIPIL,
    bgHex: MATRA_COLORS.SIPIL,
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
    hex: MATRA_COLORS.TNI_AD,
    bgHex: MATRA_COLORS.TNI_AD,
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
    hex: MATRA_COLORS.TNI_AU,
    bgHex: MATRA_COLORS.TNI_AU,
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
    hex: MATRA_COLORS.TNI_AL,
    bgHex: MATRA_COLORS.TNI_AL,
    hex: MATRA_COLORS.TNI_AL.hex,
    bgHex: MATRA_COLORS.TNI_AL.hex,
    borderHex: '#64748B',
    textHex: '#FFFFFF',
    bgTint: 'rgba(156, 163, 175, 0.15)',
    borderTint: 'rgba(156, 163, 175, 0.35)',
    badgeClass: 'bg-[#9CA3AF]/20 text-[#334155] border-[#9CA3AF]/40'
  },
  MABES: {
    key: 'MABES',
    label: 'Mabes TNI',
    hex: MATRA_COLORS.MABES,
    bgHex: MATRA_COLORS.MABES,
    hex: MATRA_COLORS.MABES.hex,
    bgHex: MATRA_COLORS.MABES.hex,
    borderHex: '#7E22CE',
    textHex: '#FFFFFF',
    bgTint: 'rgba(147, 51, 234, 0.12)',
    borderTint: 'rgba(147, 51, 234, 0.30)',
    badgeClass: 'bg-[#9333EA]/10 text-[#7E22CE] border-[#9333EA]/30'
  },
  KEMENTERIAN: {
    key: 'KEMENTERIAN',
    label: 'Kementerian / Lembaga',
    hex: MATRA_COLORS.KEMENTERIAN,
    bgHex: MATRA_COLORS.KEMENTERIAN,
    hex: MATRA_COLORS.KEMENTERIAN.hex,
    bgHex: MATRA_COLORS.KEMENTERIAN.hex,
    borderHex: '#CBD5E1',
    textHex: '#1E293B',
    bgTint: 'rgba(229, 231, 235, 0.40)',
    borderTint: 'rgba(203, 213, 225, 0.60)',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
  }
};

/**
 * Normalisasi nilai matra / institusi menjadi MatraColorKey
 */
export function normalizeMatraKey(input?: string): MatraColorKey {
  if (!input) return 'KEMENTERIAN';
  const clean = input.trim().toUpperCase();

  if (clean === 'AD' || clean.includes('DARAT') || clean === 'ANGKATAN_DARAT' || clean === 'TNI AD') {
    return 'TNI_AD';
  }
  if (clean === 'AU' || clean.includes('UDARA') || clean === 'ANGKATAN_UDARA' || clean === 'TNI AU') {
    return 'TNI_AU';
  }
  if (clean === 'AL' || clean.includes('LAUT') || clean === 'ANGKATAN_LAUT' || clean === 'TNI AL') {
    return 'TNI_AL';
  }
  if (clean.includes('MABES') || clean === 'MABES TNI' || clean === 'MABES_TNI') {
    return 'MABES';
  }
  if (clean.includes('SIPIL') || clean === 'NON_TNI' || clean === 'NON TNI' || clean === 'VIP') {
    return 'SIPIL';
  }
  if (clean.includes('KEMEN') || clean.includes('LEMBAGA') || clean.includes('POLRI')) {
    return 'KEMENTERIAN';
  }

  return 'KEMENTERIAN';
}

/**
 * Mendapatkan spesifikasi warna lengkap matra
 */
export function getMatraColor(input?: string): MatraColorSpec {
  const key = normalizeMatraKey(input);
  return MATRA_COLOR_SPECS[key];
}

/**
 * Mendapatkan hex warna matra langsung
 */
export function getMatraHex(input?: string): string {
  return getMatraColor(input).hex;
}

export default MATRA_COLORS;
