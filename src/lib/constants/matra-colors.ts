// =============================================================================
// KONSTANTA PEWARNAAN MATRA & INSTANSI RAPIM TNI 2026
// =============================================================================

export type KategoriInstansi =
  | 'ANGKATAN_DARAT'
  | 'ANGKATAN_LAUT'
  | 'ANGKATAN_UDARA'
  | 'KEMENTERIAN';

export type WarnaKursiAlias = 'green' | 'blue' | 'gray' | 'white';

export interface MatraColorDefinition {
  alias: WarnaKursiAlias;
  label: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  badgeClass: string;
  cardClass: string;
}

export const MATRA_COLORS: Record<KategoriInstansi, MatraColorDefinition> = {
  ANGKATAN_DARAT: {
    alias: 'green',
    label: 'TNI Angkatan Darat',
    bgHex: '#1F7A3E',
    borderHex: '#176131',
    textHex: '#FFFFFF',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    cardClass: 'bg-[#1F7A3E] text-white border-[#176131]'
  },
  ANGKATAN_UDARA: {
    alias: 'blue',
    label: 'TNI Angkatan Udara',
    bgHex: '#2563EB',
    borderHex: '#1d4ed8',
    textHex: '#FFFFFF',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300 font-semibold',
    cardClass: 'bg-[#2563EB] text-white border-[#1d4ed8]'
  },
  ANGKATAN_LAUT: {
    alias: 'gray',
    label: 'TNI Angkatan Laut',
    bgHex: '#64748B',
    borderHex: '#475569',
    textHex: '#FFFFFF',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
    cardClass: 'bg-[#64748B] text-white border-[#475569]'
  },
  KEMENTERIAN: {
    alias: 'white',
    label: 'Kementerian / Lembaga',
    bgHex: '#FFFFFF',
    borderHex: '#CBD5E1',
    textHex: '#0F172A',
    badgeClass: 'bg-white text-slate-800 border-slate-300 font-semibold shadow-2xs',
    cardClass: 'bg-white text-slate-900 border-slate-300 font-semibold shadow-xs'
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

  // KEMHAN, NON_TNI, MABES, Instansi Sipil, Kementerian
  return 'KEMENTERIAN';
}

/**
 * Mendapatkan alias warna kursi ("green" | "blue" | "gray" | "white")
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
  if (lower === 'white') return MATRA_COLORS.KEMENTERIAN;

  const cat = getInstansiCategory(matraOrAlias);
  return MATRA_COLORS[cat];
}

