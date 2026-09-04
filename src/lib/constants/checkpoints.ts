import { Checkpoint } from '@/types';

export const OFFICIAL_CHECKPOINTS: Checkpoint[] = [
  {
    id: 'cp_gate_utama',
    code: 'GATE_UTAMA',
    name: 'Gate 1: Pintu Masuk Utama (Absensi Awal)',
    description: 'Pemeriksaan identitas dan pencatatan kehadiran pertama di gerbang venue',
    location: 'Lobi Utama Gedung Ahmad Yani'
  },
  {
    id: 'cp_pleno_vip',
    code: 'PLENO_VIP',
    name: 'Gate 2: Ruang Sidang Pleno & Jalur VIP/VVIP',
    description: 'Verifikasi akses masuk ke dalam ruang sidang paripurna / aula kehormatan',
    location: 'Pintu Masuk Ruang Sidang Paripurna'
  },
  {
    id: 'cp_sesi_khusus',
    code: 'SESI_KHUSUS',
    name: 'Gate 3: Sesi Tertutup / Paparan Khusus',
    description: 'Pemeriksaan prajurit dan perwira untuk sesi materi strategis berklasifikasi rahasia',
    location: 'Ruang Rapat Graha Purna Yudha'
  },
  {
    id: 'cp_konsumsi',
    code: 'KONSUMSI',
    name: 'Gate 4: Jamuan Makan & Pengambilan Goodie Bag',
    description: 'Pencatatan pengambilan jatah jamuan resmi dan kelengkapan materi rapim',
    location: 'Area Dining Hall & Logistik'
  }
];

