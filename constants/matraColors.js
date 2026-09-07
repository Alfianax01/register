// constants/matraColors.js
// SINGLE SOURCE OF TRUTH WARNA MATRA & INSTANSI RAPIM TNI 2026

export const MATRA_COLORS = {
  SIPIL:       { hex: '#C9A227', label: 'Emas'      },
  TNI_AD:      { hex: '#22A559', label: 'Hijau'     },
  TNI_AU:      { hex: '#2563EB', label: 'Biru'      },
  TNI_AL:      { hex: '#9CA3AF', label: 'Abu-abu'   },
  MABES:       { hex: '#9333EA', label: 'Ungu'      },
  KEMENTERIAN: { hex: '#E5E7EB', label: 'Putih'     },
};

export const DEFAULT_MATRA_COLOR = { hex: '#9CA3AF', label: 'Default' };

export const getMatraColor = (matra) => {
  if (!matra || typeof matra !== 'string') {
    return DEFAULT_MATRA_COLOR;
  }
  const clean = matra.trim().toUpperCase().replace(/\s+/g, '_');
  if (clean === 'AD' || clean === 'TNI_AD' || clean.includes('DARAT')) return MATRA_COLORS.TNI_AD;
  if (clean === 'AU' || clean === 'TNI_AU' || clean.includes('UDARA')) return MATRA_COLORS.TNI_AU;
  if (clean === 'AL' || clean === 'TNI_AL' || clean.includes('LAUT')) return MATRA_COLORS.TNI_AL;
  if (clean === 'SIPIL' || clean === 'NON_TNI' || clean.includes('KEMHAN') || clean === 'VIP') return MATRA_COLORS.SIPIL;
  if (clean.includes('KEMENTERIAN') || clean.includes('LEMBAGA') || clean === 'POLRI') return MATRA_COLORS.KEMENTERIAN;
  if (clean === 'MABES' || clean.includes('MABES')) return MATRA_COLORS.MABES;
  return MATRA_COLORS[clean] || DEFAULT_MATRA_COLOR;
};

export const safeMatraBg = (matra) => {
  const color = getMatraColor(matra);
  return color?.hex || DEFAULT_MATRA_COLOR.hex;
};

export const safeMatraBorder = (matra) => {
  if (!matra || typeof matra !== 'string') return '#64748B';
  const clean = matra.trim().toUpperCase();
  if (clean.includes('AD') || clean.includes('DARAT')) return '#187A41';
  if (clean.includes('AU') || clean.includes('UDARA')) return '#1D4ED8';
  if (clean.includes('AL') || clean.includes('LAUT')) return '#64748B';
  if (clean.includes('SIPIL') || clean.includes('NON_TNI') || clean.includes('VIP')) return '#A17D16';
  if (clean.includes('MABES')) return '#7E22CE';
  if (clean.includes('KEMEN')) return '#94A3B8';
  return '#64748B';
};

export default MATRA_COLORS;
