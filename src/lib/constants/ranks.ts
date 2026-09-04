import { PangkatItem } from '@/types';

export const TNI_RANKS: PangkatItem[] = [
  // --- PERWIRA TINGGI (PATI) ---
  // Bintang 4 (Level 1)
  { id: 'jenderal', name: 'Jenderal TNI', level: 1, golongan: 'PATI', matra: ['AD', 'MABES'] },
  { id: 'laksamana', name: 'Laksamana TNI', level: 1, golongan: 'PATI', matra: ['AL', 'MABES'] },
  { id: 'marsekal', name: 'Marsekal TNI', level: 1, golongan: 'PATI', matra: ['AU', 'MABES'] },

  // Bintang 3 (Level 2)
  { id: 'letjen', name: 'Letnan Jenderal TNI', level: 2, golongan: 'PATI', matra: ['AD', 'MABES'] },
  { id: 'laksdya', name: 'Laksamana Madya TNI', level: 2, golongan: 'PATI', matra: ['AL', 'MABES'] },
  { id: 'marsdya', name: 'Marsekal Madya TNI', level: 2, golongan: 'PATI', matra: ['AU', 'MABES'] },

  // Bintang 2 (Level 3)
  { id: 'mayjen', name: 'Mayor Jenderal TNI', level: 3, golongan: 'PATI', matra: ['AD', 'MABES'] },
  { id: 'laksda', name: 'Laksamana Muda TNI', level: 3, golongan: 'PATI', matra: ['AL', 'MABES'] },
  { id: 'marsda', name: 'Marsekal Muda TNI', level: 3, golongan: 'PATI', matra: ['AU', 'MABES'] },

  // Bintang 1 (Level 4)
  { id: 'brigjen', name: 'Brigadir Jenderal TNI', level: 4, golongan: 'PATI', matra: ['AD', 'MABES'] },
  { id: 'laksma', name: 'Laksamana Pertama TNI', level: 4, golongan: 'PATI', matra: ['AL', 'MABES'] },
  { id: 'marsma', name: 'Marsekal Pertama TNI', level: 4, golongan: 'PATI', matra: ['AU', 'MABES'] },

  // --- PERWIRA MENENGAH (PAMEN) ---
  // Level 5
  { id: 'kolonel_ad', name: 'Kolonel (AD)', level: 5, golongan: 'PAMEN', matra: ['AD', 'MABES'] },
  { id: 'kolonel_al', name: 'Kolonel (AL)', level: 5, golongan: 'PAMEN', matra: ['AL', 'MABES'] },
  { id: 'kolonel_au', name: 'Kolonel (AU)', level: 5, golongan: 'PAMEN', matra: ['AU', 'MABES'] },

  // Level 6
  { id: 'letkol_ad', name: 'Letnan Kolonel (AD)', level: 6, golongan: 'PAMEN', matra: ['AD', 'MABES'] },
  { id: 'letkol_al', name: 'Letnan Kolonel (AL)', level: 6, golongan: 'PAMEN', matra: ['AL', 'MABES'] },
  { id: 'letkol_au', name: 'Letnan Kolonel (AU)', level: 6, golongan: 'PAMEN', matra: ['AU', 'MABES'] },

  // Level 7
  { id: 'mayor_ad', name: 'Mayor (AD)', level: 7, golongan: 'PAMEN', matra: ['AD', 'MABES'] },
  { id: 'mayor_al', name: 'Mayor (AL)', level: 7, golongan: 'PAMEN', matra: ['AL', 'MABES'] },
  { id: 'mayor_au', name: 'Mayor (AU)', level: 7, golongan: 'PAMEN', matra: ['AU', 'MABES'] },

  // --- PERWIRA PERTAMA (PAMA) ---
  // Level 8
  { id: 'kapten_ad', name: 'Kapten (AD)', level: 8, golongan: 'PAMA', matra: ['AD', 'MABES'] },
  { id: 'kapten_al', name: 'Kapten (AL)', level: 8, golongan: 'PAMA', matra: ['AL', 'MABES'] },
  { id: 'kapten_au', name: 'Kapten (AU)', level: 8, golongan: 'PAMA', matra: ['AU', 'MABES'] },

  // Level 9
  { id: 'lettu_ad', name: 'Letnan Satu (AD)', level: 9, golongan: 'PAMA', matra: ['AD', 'MABES'] },
  { id: 'lettu_al', name: 'Letnan Satu (AL)', level: 9, golongan: 'PAMA', matra: ['AL', 'MABES'] },
  { id: 'lettu_au', name: 'Letnan Satu (AU)', level: 9, golongan: 'PAMA', matra: ['AU', 'MABES'] },

  // Level 10
  { id: 'letda_ad', name: 'Letnan Dua (AD)', level: 10, golongan: 'PAMA', matra: ['AD', 'MABES'] },
  { id: 'letda_al', name: 'Letnan Dua (AL)', level: 10, golongan: 'PAMA', matra: ['AL', 'MABES'] },
  { id: 'letda_au', name: 'Letnan Dua (AU)', level: 10, golongan: 'PAMA', matra: ['AU', 'MABES'] },

  // --- BINTARA & TAMTAMA ---
  { id: 'bintara_ad', name: 'Bintara (Peltu/Pelda/Serma/Serka/Sertu/Serda AD)', level: 11, golongan: 'BINTARA', matra: ['AD', 'MABES'] },
  { id: 'bintara_al', name: 'Bintara (Peltu/Pelda/Serma/Serka/Sertu/Serda AL)', level: 11, golongan: 'BINTARA', matra: ['AL', 'MABES'] },
  { id: 'bintara_au', name: 'Bintara (Peltu/Pelda/Serma/Serka/Sertu/Serda AU)', level: 11, golongan: 'BINTARA', matra: ['AU', 'MABES'] },

  { id: 'tamtama_ad', name: 'Tamtama (Kopka/Koptu/Kopda/Praka/Pratu/Prada AD)', level: 12, golongan: 'TAMTAMA', matra: ['AD', 'MABES'] },
  { id: 'tamtama_al', name: 'Tamtama (Kopka/Koptu/Kopda/Praka/Pratu/Prada AL)', level: 12, golongan: 'TAMTAMA', matra: ['AL', 'MABES'] },
  { id: 'tamtama_au', name: 'Tamtama (Kopka/Koptu/Kopda/Praka/Pratu/Prada AU)', level: 12, golongan: 'TAMTAMA', matra: ['AU', 'MABES'] },

  // --- TAMU SIPIL / NON-TNI / DIPLOMATIK ---
  { id: 'menteri_pejabat', name: 'Menteri / Pejabat Setingkat Menteri', level: 1, golongan: 'SIPIL', matra: ['NON_TNI'] },
  { id: 'duta_besar', name: 'Duta Besar Luar Biasa & Berkuasa Penuh', level: 2, golongan: 'SIPIL', matra: ['NON_TNI'] },
  { id: 'atase_pertahanan', name: 'Atase Pertahanan (Military Attaché)', level: 4, golongan: 'SIPIL', matra: ['NON_TNI'] },
  { id: 'eselon1', name: 'Pejabat Eselon I / Pimpinan Tinggi Madya', level: 3, golongan: 'SIPIL', matra: ['NON_TNI'] },
  { id: 'eselon2', name: 'Pejabat Eselon II / Pimpinan Tinggi Pratama', level: 5, golongan: 'SIPIL', matra: ['NON_TNI'] },
  { id: 'undangan_sipil', name: 'Tamu Kehormatan / Akademisi / Umum', level: 8, golongan: 'SIPIL', matra: ['NON_TNI'] }
];

export function getRanksByMatra(matra: string): PangkatItem[] {
  return TNI_RANKS.filter(r => r.matra.includes(matra as any));
}

