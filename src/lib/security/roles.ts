import { Role, Permission, PermissionCode } from '@/types';

export const ALL_PERMISSIONS: Permission[] = [
  {
    id: 'perm_dashboard',
    code: 'DASHBOARD',
    name: 'Dashboard Utama',
    category: 'OPERASIONAL',
    description: 'Melihat ringkasan statistik, grafik kehadiran, dan rangkuman status acara'
  },
  {
    id: 'perm_guests',
    code: 'GUESTS',
    name: 'Data Peserta',
    category: 'OPERASIONAL',
    description: 'Melihat, mencari, memfilter, dan mengelola direktori tamu/peserta'
  },
  {
    id: 'perm_seats',
    code: 'SEATS',
    name: 'Penempatan Kursi & Wisma',
    category: 'OPERASIONAL',
    description: 'Mengatur alokasi kursi ruang pleno, kamar wisma penginapan, dan denah layout'
  },
  {
    id: 'perm_scanner',
    code: 'SCANNER',
    name: 'Scan QR Gate',
    category: 'OPERASIONAL',
    description: 'Mengoperasikan scanner kamera/barcode scanner di gerbang masuk check-in'
  },
  {
    id: 'perm_monitoring',
    code: 'MONITORING',
    name: 'Monitoring Presensi',
    category: 'OPERASIONAL',
    description: 'Memantau arus kedatangan real-time per gerbang dan checkpoint'
  },
  {
    id: 'perm_cms',
    code: 'CMS',
    name: 'Management Website',
    category: 'MANAJEMEN',
    description: 'Mengubah identitas, logo, banner login, warna tema sistem, dan teks website'
  },
  {
    id: 'perm_auth',
    code: 'AUTH',
    name: 'User Authorization',
    category: 'MANAJEMEN',
    description: 'Mengatur peran dinas (roles), hak akses menu, dan akun admin pengguna'
  },
  {
    id: 'perm_export_pdf',
    code: 'EXPORT_PDF',
    name: 'Export PDF',
    category: 'LAPORAN',
    description: 'Mengunduh laporan presensi, data peserta, dan kartu undangan dalam format PDF'
  },
  {
    id: 'perm_export_excel',
    code: 'EXPORT_EXCEL',
    name: 'Export Excel',
    category: 'LAPORAN',
    description: 'Mengunduh rekapitulasi data lengkap peserta dalam format spreadsheet Excel'
  }
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'role_superadmin',
    name: 'Super Admin',
    description: 'Akses penuh ke seluruh sistem, tata kelola website, laporan, dan otorisasi pengguna.',
    is_system: true,
    permissions: [
      'DASHBOARD',
      'GUESTS',
      'SEATS',
      'SCANNER',
      'MONITORING',
      'CMS',
      'AUTH',
      'EXPORT_PDF',
      'EXPORT_EXCEL'
    ],
    created_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_event',
    name: 'Admin Event',
    description: 'Koordinator acara utama dengan wewenang mengelola data peserta, denah kursi, akomodasi, serta unduhan laporan.',
    is_system: true,
    permissions: [
      'DASHBOARD',
      'GUESTS',
      'SEATS',
      'MONITORING',
      'EXPORT_PDF',
      'EXPORT_EXCEL'
    ],
    created_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_registrasi',
    name: 'Admin Registrasi',
    description: 'Petugas sekretariat yang mengelola pendaftaran peserta, validasi data, dan rekap data.',
    is_system: true,
    permissions: [
      'DASHBOARD',
      'GUESTS',
      'EXPORT_PDF',
      'EXPORT_EXCEL'
    ],
    created_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_checkin',
    name: 'Admin Check-In',
    description: 'Penanggung jawab pos gerbang dan registrasi ulang di lokasi kegiatan.',
    is_system: true,
    permissions: [
      'DASHBOARD',
      'SCANNER',
      'MONITORING'
    ],
    created_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_scanner',
    name: 'Operator Scanner',
    description: 'Petugas teknis di pintu gerbang yang melakukan pemindaian barcode e-ticket tamu.',
    is_system: true,
    permissions: [
      'SCANNER'
    ],
    created_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Akses khusus pimpinan atau tamu kehormatan untuk memantau ringkasan statistik dan kehadiran.',
    is_system: true,
    permissions: [
      'DASHBOARD',
      'MONITORING'
    ],
    created_at: '2026-01-01T00:00:00.000Z'
  }
];

