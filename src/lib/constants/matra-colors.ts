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
    bgHex: '#1B5E39',
    borderHex: '#14462a',
    textHex: '#FFFFFF',
    badgeClass: 'bg-emerald-900 text-emerald-200 border-emerald-700',
    cardClass: 'bg-[#1B5E39] text-white border-[#14462a]'
  },
  ANGKATAN_UDARA: {
    alias: 'blue',
    label: 'TNI Angkatan Udara',
    bgHex: '#1B6B93',
    borderHex: '#144f6d',
    textHex: '#FFFFFF',
    badgeClass: 'bg-sky-900 text-sky-200 border-sky-700',
    cardClass: 'bg-[#1B6B93] text-white border-[#144f6d]'
  },
  ANGKATAN_LAUT: {
    alias: 'gray',
    label: 'TNI Angkatan Laut',
    bgHex: '#6B7280',
    borderHex: '#4b5563',
    textHex: '#FFFFFF',
    badgeClass: 'bg-slate-700 text-slate-200 border-slate-600',
    cardClass: 'bg-[#6B7280] text-white border-[#4b5563]'
  },
  KEMENTERIAN: {
    alias: 'white',
    label: 'Kementerian / Lembaga',
    bgHex: '#FFFFFF',
    borderHex: '#94A3B8',
    textHex: '#0F172A',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-400',
    cardClass: 'bg-white text-slate-900 border-slate-400 font-semibold shadow-xs'
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

