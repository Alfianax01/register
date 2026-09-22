export type PresetThemeType = 
  | 'TNI_MERAH_EMAS'
  | 'TNI_HIJAU_AD'
  | 'TNI_BIRU_AU'
  | 'TNI_ABU_AL'
  | 'NETRAL_PEMERINTAHAN';

export interface ThemeColors {
  primary_color: string;     // Primary Red (#8B0000)
  secondary_color: string;   // Dark Red (#6B0000)
  gold_accent: string;       // Gold Accent (#B8860B)
  gold_light: string;        // Gold Light (#D4AF37)
  sidebar_color: string;     // Sidebar Background (#6B0000 atau #1F2937)
  navbar_color: string;      // Navbar Header (#8B0000 atau #111827)
  button_color: string;      // Button color (#9B6A35)
  accent_color: string;      // Accent Color (#B8860B)
  bg_color: string;          // Background (#F5F6F8)
  card_color: string;        // Card (#FFFFFF)
  text_primary: string;      // Text Primary (#1F2937)
  text_secondary: string;    // Text Secondary (#6B7280)
  border_color: string;      // Border (#E5E7EB)
}

export const THEME_PRESETS: Record<PresetThemeType, ThemeColors & { name: string; description: string }> = {
  TNI_MERAH_EMAS: {
    name: 'TNI Merah Emas (PUSINFOLAHTA TNI)',
    description: 'Warna komando resmi Mabes TNI & Pusinfolahta dengan nuansa merah maroon berwibawa dan aksen emas kemilau.',
    primary_color: '#8B0000',
    secondary_color: '#6B0000',
    gold_accent: '#B8860B',
    gold_light: '#D4AF37',
    sidebar_color: '#6B0000',
    navbar_color: '#8B0000',
    button_color: '#9B6A35',
    accent_color: '#B8860B',
    bg_color: '#F5F6F8',
    card_color: '#FFFFFF',
    text_primary: '#1F2937',
    text_secondary: '#6B7280',
    border_color: '#E5E7EB'
  },
  TNI_HIJAU_AD: {
    name: 'TNI Hijau AD (Kartika Eka Paksi)',
    description: 'Nuansa hijau militer Angkatan Darat yang kokoh, tangguh, dan disiplin.',
    primary_color: '#1E4D2B',
    secondary_color: '#13351C',
    gold_accent: '#C5A059',
    gold_light: '#E2C87A',
    sidebar_color: '#13351C',
    navbar_color: '#1E4D2B',
    button_color: '#7D6335',
    accent_color: '#C5A059',
    bg_color: '#F4F7F4',
    card_color: '#FFFFFF',
    text_primary: '#1A2E1F',
    text_secondary: '#5C6B5E',
    border_color: '#DCE4DD'
  },
  TNI_BIRU_AU: {
    name: 'TNI Biru AU (Swa Bhuwana Paksa)',
    description: 'Nuansa biru dirgantara Angkatan Udara yang modern, dinamis, dan presisi.',
    primary_color: '#0D3B66',
    secondary_color: '#072440',
    gold_accent: '#F4D06F',
    gold_light: '#FFE08A',
    sidebar_color: '#072440',
    navbar_color: '#0D3B66',
    button_color: '#8C6C38',
    accent_color: '#F4D06F',
    bg_color: '#F2F6FA',
    card_color: '#FFFFFF',
    text_primary: '#0F2537',
    text_secondary: '#5A6E7E',
    border_color: '#D9E3EC'
  },
  TNI_ABU_AL: {
    name: 'TNI Abu AL (Jalesveva Jayamahe)',
    description: 'Nuansa abu samudra dan navy Angkatan Laut yang berwibawa di lautan nusantara.',
    primary_color: '#2C3E50',
    secondary_color: '#1A252F',
    gold_accent: '#D4AF37',
    gold_light: '#F1D779',
    sidebar_color: '#1A252F',
    navbar_color: '#2C3E50',
    button_color: '#7B6E50',
    accent_color: '#D4AF37',
    bg_color: '#F5F7F9',
    card_color: '#FFFFFF',
    text_primary: '#1A252F',
    text_secondary: '#607282',
    border_color: '#DFE5EA'
  },
  NETRAL_PEMERINTAHAN: {
    name: 'Netral Pemerintahan (Kementerian / Lembaga)',
    description: 'Format kenegaraan formal bernuansa biru tua diplomatik dan emas perbawa.',
    primary_color: '#1A365D',
    secondary_color: '#102340',
    gold_accent: '#D69E2E',
    gold_light: '#ECC94B',
    sidebar_color: '#102340',
    navbar_color: '#1A365D',
    button_color: '#8C6E2E',
    accent_color: '#D69E2E',
    bg_color: '#F7FAFC',
    card_color: '#FFFFFF',
    text_primary: '#1A202C',
    text_secondary: '#718096',
    border_color: '#E2E8F0'
  }
};

export interface SiteSettings {
  // Identitas Website
  nama_sistem: string;
  subjudul: string;
  footer: string;

  // Hero & Event Details
  hero_title: string;
  hero_subtitle: string;
  event_theme: string;
  event_location: string;
  event_date: string;
  navbar_logo: string;
  hero_logo: string;
  logo_header: string;
  logo_sidebar: string;

  // Media Assets
  favicon: string;      // base64 data URI — ikon tab browser
  hero_banner: string;  // base64 data URI (terkompresi) — background hero section
  banner_login: string; // 1920x500 banner login

  // Skema Warna & Tema
  preset_theme?: PresetThemeType;
  theme_preset?: PresetThemeType;
  primary_color: string;
  secondary_color: string;
  gold_accent: string;
  gold_light: string;
  sidebar_color: string;
  navbar_color: string;
  button_color: string;
  accent_color: string;
  bg_color?: string;
  card_color?: string;
  text_primary?: string;
  text_secondary?: string;
  border_color?: string;

  // Form Registration Labels
  label_nama: string;
  label_negara?: string;
  label_matra: string;
  label_pangkat: string;
  label_nrp: string;
  label_korps?: string;
  label_satuan?: string;
  label_jabatan: string;
  label_satker: string;
  label_email: string;
  label_phone: string;
  label_kategori?: string;
  label_akomodasi: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  nama_sistem: 'PORTAL RAPIM TNI 2026',
  subjudul: 'Sistem Registrasi, Akreditasi, dan Tata Kelola Presensi Kedinasan',
  footer: '© 2026 Pusat Informasi Pengolahan Data Tentara Nasional Indonesia (PUSINFOLAHTA TNI). Hak Cipta Dilindungi Undang-Undang.',

  hero_title: 'Rapat Pimpinan TNI Tahun 2026',
  hero_subtitle: 'Sistem Registrasi & Akreditasi Tamu Undangan Resmi untuk Perwira Tinggi, Perwira Menengah, Delegasi Kementerian/Instansi Negara, dan Tamu Kehormatan.',
  event_theme: 'TNI Modern, Tangguh, dan Adaptif Menuju Indonesia Emas 2045',
  event_location: 'Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur',
  event_date: '4 – 5 September 2026',
  navbar_logo: '/images/logo-tni-rapim.png',
  hero_logo: '/images/logo-tni-rapim.png',
  logo_header: '/images/logo-tni-rapim.png',
  logo_sidebar: '/images/logo-tni-rapim.png',
  favicon: '/favicon.ico',
  hero_banner: '',
  banner_login: '',

  // Default Preset PUSINFOLAHTA TNI
  preset_theme: 'TNI_MERAH_EMAS',
  primary_color: '#8B0000',
  secondary_color: '#6B0000',
  gold_accent: '#B8860B',
  gold_light: '#D4AF37',
  sidebar_color: '#6B0000',
  navbar_color: '#8B0000',
  button_color: '#9B6A35',
  accent_color: '#B8860B',

  label_nama: 'Nama Lengkap & Gelar',
  label_negara: 'Negara',
  label_matra: 'Matra / Kategori',
  label_pangkat: 'Pangkat Kedinasan',
  label_nrp: 'NRP / NIP (Opsional)',
  label_jabatan: 'Kedinasan',
  label_satker: 'Satker / Kesatuan Asal',
  label_email: 'Alamat Email Kedinasan',
  label_phone: 'Nomor WhatsApp / HP Aktif',
  label_akomodasi: 'Kebutuhan Penginapan (Mess/Wisma)'
};

