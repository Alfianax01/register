export interface SatkerOption {
  id: string;
  name: string;
  matra: string[];
  satuans: string[];
}

export const SATKER_LIST: SatkerOption[] = [
  // MABES TNI
  {
    id: 'mabes_tni',
    name: 'Mabes TNI (Cilangkap)',
    matra: ['MABES', 'AD', 'AL', 'AU'],
    satuans: [
      'Staf Umum Mabes TNI (Sintel/Sops/Spers/Slog/Skomlek)',
      'Inspektorat Jenderal (Itjen TNI)',
      'Puspen TNI',
      'Paspampres',
      'Koopssus TNI',
      'Babinkum TNI',
      'Puskes TNI',
      'Pusziad / Satpamwal Mabes TNI'
    ]
  },
  // KEMHAN
  {
    id: 'kemhan_ri',
    name: 'Kementerian Pertahanan RI (Kemhan)',
    matra: ['MABES', 'AD', 'AL', 'AU', 'NON_TNI'],
    satuans: [
      'Setjen Kemhan',
      'Ditjen Strahan Kemhan',
      'Ditjen Renhan Kemhan',
      'Ditjen Pothan Kemhan',
      'Ditjen Kuathan Kemhan',
      'Balitbang Kemhan',
      'Unhan RI'
    ]
  },
  // TNI AD
  {
    id: 'mabes_ad',
    name: 'Mabes TNI AD (Jakarta Pusat)',
    matra: ['AD'],
    satuans: [
      'Staf Umum Kasad (Spers/Sops/Sintel/Slog/Srena)',
      'Itjenad',
      'Dispenad',
      'Ditziad',
      'Ditpalad',
      'Ditkesad'
    ]
  },
  {
    id: 'kostrad',
    name: 'Komando Cadangan Strategis AD (Kostrad)',
    matra: ['AD'],
    satuans: [
      'Makostrad',
      'Divisi Infanteri 1/Kostrad (Cilodong)',
      'Divisi Infanteri 2/Kostrad (Singosari)',
      'Divisi Infanteri 3/Kostrad (Pakatto)'
    ]
  },
  {
    id: 'kopassus',
    name: 'Komando Pasukan Khusus (Kopassus)',
    matra: ['AD'],
    satuans: [
      'Makopassus (Cijantung)',
      'Grup 1 Kopassus (Serang)',
      'Grup 2 Kopassus (Kandang Menjangan)',
      'Grup 3 Kopassus (Sandi Yudha)',
      'Sat-81 Gultor Kopassus'
    ]
  },
  {
    id: 'kodam_jaya',
    name: 'Kodam Jaya / Jayakarta',
    matra: ['AD'],
    satuans: ['Makodam Jaya', 'Korem 051/Wijayakarta', 'Korem 052/Wijayakrama', 'Brigif Mekanis 1 PIK/JS']
  },
  {
    id: 'kodam_3_siliwangi',
    name: 'Kodam III / Siliwangi',
    matra: ['AD'],
    satuans: ['Makodam III/Siliwangi', 'Korem 061/Suryakancana', 'Korem 062/Tarumanagara', 'Korem 063/Sunan Gunung Jati', 'Korem 064/Maulana Yusuf']
  },
  {
    id: 'kodam_lain',
    name: 'Kodam Kewilayahan Lainnya (I - XVIII)',
    matra: ['AD'],
    satuans: ['Kodam I/BB', 'Kodam II/SWJ', 'Kodam IV/Diponegoro', 'Kodam V/Brawijaya', 'Kodam VI/Mulawarman', 'Kodam IX/Udayana', 'Kodam XIV/Hasanuddin', 'Kodam XVII/Cenderawasih']
  },

  // TNI AL
  {
    id: 'mabes_al',
    name: 'Mabes TNI AL (Cilangkap)',
    matra: ['AL'],
    satuans: [
      'Staf Umum Kasal',
      'Itjenal',
      'Dispenal',
      'Dismatla',
      'Disminpersal'
    ]
  },
  {
    id: 'koarmada_ri',
    name: 'Komando Armada RI (Koarmada RI)',
    matra: ['AL'],
    satuans: [
      'Mako Koarmada RI',
      'Koarmada I (Tanjungpinang)',
      'Koarmada II (Surabaya)',
      'Koarmada III (Sorong)'
    ]
  },
  {
    id: 'korps_marinir',
    name: 'Korps Marinir TNI AL',
    matra: ['AL'],
    satuans: [
      'Mako Korps Marinir (Jakarta)',
      'Pasmar 1 (Jakarta)',
      'Pasmar 2 (Surabaya)',
      'Pasmar 3 (Sorong)',
      'Denjaka'
    ]
  },
  {
    id: 'kolinlamil',
    name: 'Kolinlamil & Pushidrosal',
    matra: ['AL'],
    satuans: ['Mako Kolinlamil', 'Mako Pushidrosal']
  },

  // TNI AU
  {
    id: 'mabes_au',
    name: 'Mabes TNI AU (Cilangkap)',
    matra: ['AU'],
    satuans: [
      'Staf Umum Kasau',
      'Itjenau',
      'Dispenau',
      'Disaeroau',
      'Dispersau'
    ]
  },
  {
    id: 'koopsudnas',
    name: 'Komando Operasi Udara Nasional (Koopsudnas)',
    matra: ['AU'],
    satuans: [
      'Mako Koopsudnas',
      'Koopsud I (Halim Perdanakusuma)',
      'Koopsud II (Makassar)',
      'Koopsud III (Biak)',
      'Kosek I - IV'
    ]
  },
  {
    id: 'kopasgat',
    name: 'Kopasgat TNI AU',
    matra: ['AU'],
    satuans: [
      'Mako Kopasgat (Bandung)',
      'Wing Komando I Kopasgat',
      'Wing Komando II Kopasgat',
      'Wing Komando III Kopasgat',
      'Satbravo 90 Kopasgat'
    ]
  },
  {
    id: 'kodiklatau',
    name: 'Kodiklatau & Koharmatau',
    matra: ['AU'],
    satuans: ['Mako Kodiklatau (Halim)', 'Mako Koharmatau (Bandung)']
  },

  // TAMU NON-TNI / DIPLOMATIK
  {
    id: 'kementerian_lembaga',
    name: 'Kementerian & Lembaga Negara RI',
    matra: ['NON_TNI'],
    satuans: [
      'Kemenko Polkam RI',
      'Kementerian Luar Negeri RI',
      'Sekretariat Negara / Seskab RI',
      'Polri (Mabes Polri)',
      'Badan Intelijen Negara (BIN)',
      'BSSN',
      'Komisi I DPR RI'
    ]
  },
  {
    id: 'korps_diplomatik',
    name: 'Korps Diplomatik / Kedutaan Besar Asing',
    matra: ['NON_TNI'],
    satuans: [
      'Kedutaan Besar Negara Sahabat (Atase Pertahanan)',
      'Organisasi Internasional (UN/ASEAN)',
      'Delegasi Militer Asing'
    ]
  }
];

export function getSatkersByMatra(matra: string): SatkerOption[] {
  return SATKER_LIST.filter(s => s.matra.includes(matra));
}

