// =============================================================================
// KONSTANTA PEWARNAAN MATRA & INSTANSI RAPIM TNI 2026
// Single source of truth diimpor dari @/constants/matraColors
// =============================================================================

import {
  MATRA_COLORS as OFFICIAL_MATRA_COLORS,
  MATRA_COLOR_SPECS,
  normalizeMatraKey,
  MatraColorKey,
  MatraColorSpec
} from '@/constants/matraColors';

export { OFFICIAL_MATRA_COLORS, MATRA_COLOR_SPECS, normalizeMatraKey };
export type { MatraColorKey, MatraColorSpec };

export type KategoriInstansi =
  | 'ANGKATAN_DARAT'
  | 'ANGKATAN_LAUT'
  | 'ANGKATAN_UDARA'
  | 'MABES'
  | 'SIPIL'
  | 'KEMENTERIAN';

export type WarnaKursiAlias = 'green' | 'blue' | 'gray' | 'purple' | 'gold' | 'white';

export interface MatraColorDefinition {
  alias: WarnaKursiAlias;
  label: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  bgTint: string;
  borderTint: string;
  badgeClass: string;
  cardClass: string;
}

export const MATRA_COLORS: Record<KategoriInstansi, MatraColorDefinition> = {
  ANGKATAN_DARAT: {
    alias: 'green',
    label: 'TNI Angkatan Darat',
    bgHex: OFFICIAL_MATRA_COLORS.TNI_AD.hex, // #22A559
    borderHex: '#187A41',
    textHex: '#FFFFFF',
    bgTint: 'rgba(34, 165, 89, 0.12)',
    borderTint: 'rgba(34, 165, 89, 0.30)',
    badgeClass: 'bg-[#22A559]/10 text-[#156E3B] border-[#22A559]/30 font-semibold',
    cardClass: 'bg-[#22A559] text-white border-[#187A41]'
  },
  ANGKATAN_UDARA: {
    alias: 'blue',
    label: 'TNI Angkatan Udara',
    bgHex: OFFICIAL_MATRA_COLORS.TNI_AU.hex, // #2563EB
    borderHex: '#1D4ED8',
    textHex: '#FFFFFF',
    bgTint: 'rgba(37, 99, 235, 0.12)',
    borderTint: 'rgba(37, 99, 235, 0.30)',
    badgeClass: 'bg-[#2563EB]/10 text-[#1E40AF] border-[#2563EB]/30 font-semibold',
    cardClass: 'bg-[#2563EB] text-white border-[#1D4ED8]'
  },
  ANGKATAN_LAUT: {
    alias: 'gray',
    label: 'TNI Angkatan Laut',
    bgHex: OFFICIAL_MATRA_COLORS.TNI_AL.hex, // #9CA3AF
    borderHex: '#64748B',
    textHex: '#FFFFFF',
    bgTint: 'rgba(156, 163, 175, 0.15)',
    borderTint: 'rgba(156, 163, 175, 0.35)',
    badgeClass: 'bg-[#9CA3AF]/20 text-[#334155] border-[#9CA3AF]/40 font-semibold',
    cardClass: 'bg-[#9CA3AF] text-white border-[#64748B]'
  },
  MABES: {
    alias: 'purple',
    label: 'Mabes TNI',
    bgHex: OFFICIAL_MATRA_COLORS.MABES.hex, // #9333EA
    borderHex: '#7E22CE',
    textHex: '#FFFFFF',
    bgTint: 'rgba(147, 51, 234, 0.12)',
    borderTint: 'rgba(147, 51, 234, 0.30)',
    badgeClass: 'bg-[#9333EA]/10 text-[#7E22CE] border-[#9333EA]/30 font-semibold',
    cardClass: 'bg-[#9333EA] text-white border-[#7E22CE]'
  },
  SIPIL: {
    alias: 'gold',
    label: 'K/L (Kementerian/Lembaga)',
    bgHex: OFFICIAL_MATRA_COLORS.SIPIL.hex, // #C9A227
    borderHex: '#A17D16',
    textHex: '#FFFFFF',
    bgTint: 'rgba(201, 162, 39, 0.12)',
    borderTint: 'rgba(201, 162, 39, 0.30)',
    badgeClass: 'bg-[#C9A227]/10 text-[#8F6F12] border-[#C9A227]/30 font-semibold',
    cardClass: 'bg-[#C9A227] text-white border-[#A17D16]'
  },
  KEMENTERIAN: {
    alias: 'white',
    label: 'Kementerian / Lembaga',
    bgHex: OFFICIAL_MATRA_COLORS.KEMENTERIAN.hex, // #E5E7EB
    borderHex: '#CBD5E1',
    textHex: '#0F172A',
    bgTint: 'rgba(229, 231, 235, 0.40)',
    borderTint: 'rgba(203, 213, 225, 0.60)',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold shadow-2xs',
    cardClass: 'bg-[#E5E7EB] text-slate-900 border-slate-300 font-semibold shadow-xs'
  }
};

/**
 * Normalisasi nilai matra/satker/instansi menjadi KategoriInstansi standar
 */
export function getInstansiCategory(matraOrInput?: string): KategoriInstansi {
  if (!matraOrInput) return 'KEMENTERIAN';
  const clean = matraOrInput.trim().toUpperCase();

  if (clean === 'AD' || clean.includes('DARAT') || clean === 'ANGKATAN_DARAT' || clean === 'TNI AD') {
    return 'ANGKATAN_DARAT';
  }
  if (clean === 'AU' || clean.includes('UDARA') || clean === 'ANGKATAN_UDARA' || clean === 'TNI AU') {
    return 'ANGKATAN_UDARA';
  }
  if (clean === 'AL' || clean.includes('LAUT') || clean === 'ANGKATAN_LAUT' || clean === 'TNI AL') {
    return 'ANGKATAN_LAUT';
  }
  if (clean.includes('MABES') || clean === 'MABES TNI' || clean === 'MABES_TNI') {
    return 'MABES';
  }
  if (clean.includes('SIPIL') || clean === 'NON_TNI' || clean === 'NON TNI' || clean === 'VIP') {
    return 'SIPIL';
  }

  return 'KEMENTERIAN';
}

/**
 * Mendapatkan alias warna kursi ("green" | "blue" | "gray" | "purple" | "gold" | "white")
 */
export function getSeatColorAlias(matraOrInput?: string): WarnaKursiAlias {
  const cat = getInstansiCategory(matraOrInput);
  return MATRA_COLORS[cat].alias;
}

/**
 * Mendapatkan definisi warna berdasarkan alias atau kategori
 */
export function getMatraColor(matraOrAlias?: string): MatraColorDefinition {
  if (!matraOrAlias) return MATRA_COLORS.KEMENTERIAN;

  const lower = matraOrAlias.trim().toLowerCase();
  if (lower === 'green') return MATRA_COLORS.ANGKATAN_DARAT;
  if (lower === 'blue') return MATRA_COLORS.ANGKATAN_UDARA;
  if (lower === 'gray' || lower === 'grey') return MATRA_COLORS.ANGKATAN_LAUT;
  if (lower === 'purple') return MATRA_COLORS.MABES;
  if (lower === 'gold' || lower === 'amber' || lower === 'yellow') return MATRA_COLORS.SIPIL;
  if (lower === 'white') return MATRA_COLORS.KEMENTERIAN;

  const cat = getInstansiCategory(matraOrAlias);
  return MATRA_COLORS[cat];
}
