export interface SiteSettings {
  // Hero & Event Details
  hero_title: string;
  hero_subtitle: string;
  event_theme: string;
  event_location: string;
  event_date: string;
  navbar_logo: string;
  hero_logo: string;

  // Media Assets
  favicon: string;      // base64 data URI — ikon tab browser
  hero_banner: string;  // base64 data URI (terkompresi) — background hero section

  // Form Registration Labels
  label_nama: string;
  label_matra: string;
  label_pangkat: string;
  label_nrp: string;
  label_jabatan: string;
  label_satker: string;
  label_email: string;
  label_phone: string;
  label_akomodasi: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero_title: 'Rapat Pimpinan TNI Tahun 2026',
  hero_subtitle: 'Sistem Registrasi & Akreditasi Tamu Undangan Resmi untuk Perwira Tinggi, Perwira Menengah, Delegasi Kementerian/Instansi Negara, dan Tamu Kehormatan.',
  event_theme: 'TNI Modern, Tangguh, dan Adaptif Menuju Indonesia Emas 2045',
  event_location: 'Gedung Ahmad Yani, Mabes TNI Cilangkap, Jakarta Timur',
  event_date: '4 – 5 September 2026',
  navbar_logo: '',
  hero_logo: '',
  favicon: '',
  hero_banner: '',

  label_nama: 'Nama Lengkap & Gelar',
  label_matra: 'Matra / Kategori',
  label_pangkat: 'Pangkat Kedinasan',
  label_nrp: 'NRP / NIP (Opsional)',
  label_jabatan: 'Jabatan Kedinasan',
  label_satker: 'Satker / Kesatuan Asal',
  label_email: 'Alamat Email Kedinasan',
  label_phone: 'Nomor WhatsApp / HP Aktif',
  label_akomodasi: 'Kebutuhan Penginapan (Mess/Wisma)'
};

