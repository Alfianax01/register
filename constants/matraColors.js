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

export const getMatraColor = (matra) => {
  if (!matra) return MATRA_COLORS.MABES;
  const rawKey = String(matra).toUpperCase().trim();
  const key = rawKey.replace(/\s+/g, '_');
  if (key === 'AD' || key === 'ANGKATAN_DARAT') return MATRA_COLORS.TNI_AD;
  if (key === 'AL' || key === 'ANGKATAN_LAUT') return MATRA_COLORS.TNI_AL;
  if (key === 'AU' || key === 'ANGKATAN_UDARA') return MATRA_COLORS.TNI_AU;
  if (key === 'NON_TNI' || key === 'VIP') return MATRA_COLORS.SIPIL;
  return MATRA_COLORS[key] || MATRA_COLORS.MABES;
};

export default MATRA_COLORS;
