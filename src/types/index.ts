export type MatraType = 'AD' | 'AL' | 'AU' | 'MABES' | 'NON_TNI';

export type PangkatGolongan = 'PATI' | 'PAMEN' | 'PAMA' | 'BINTARA' | 'TAMTAMA' | 'SIPIL';

export interface PangkatItem {
  id: string;
  name: string;
  level: number; // 1 = highest (Jenderal/Laksamana/Marsekal)
  golongan: PangkatGolongan;
  matra: MatraType[];
}

export interface Guest {
  id: string;
  nrp: string;
  nama: string;
  gelar_depan?: string;
  gelar_belakang?: string;
  matra: MatraType;
  pangkat: string;
  pangkat_level: number;
  jabatan: string;
  satker: string;
  satuan: string;
  negara_instansi: string;
  no_hp?: string;
  email: string;
  butuh_akomodasi: number; // 0 or 1
  tgl_checkin?: string;
  tgl_checkout?: string;
  catatan_khusus?: string;
  qr_token: string;
  token_hash: string;
  registration_id?: string;
  ticket_id?: string;
  seat_group_id?: string;
  seat_number?: string;
  seat_assignment?: string;
  seat_block?: 'A' | 'B' | 'C' | 'D' | 'E';
  building?: string;
  room?: string;
  wisma_name?: string;
  room_id?: string;
  room_number?: string;
  room_slot?: 'A' | 'B';
  bed_number?: number;
  wisma_assignment?: string;
  status_kehadiran: 'REGISTRASI' | 'CHECK_IN';
  waktu_kehadiran_pertama?: string;
  token?: string;
  emailSent?: boolean;
  kategori_instansi?: 'ANGKATAN_DARAT' | 'ANGKATAN_LAUT' | 'ANGKATAN_UDARA' | 'KEMENTERIAN' | 'MABES' | 'SIPIL';
  warna_kursi?: 'green' | 'blue' | 'gray' | 'white' | 'purple' | 'gold';
  seatColorAlias?: string;
  assignment?: Assignment;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  peserta_id: string;
  seat_code: string;      // contoh: "A-06"
  seat_area: string;      // contoh: "Area VVIP"
  gedung?: string;        // contoh: "Gedung Ahmad Yani"
  building?: string;      // alias contoh: "Gedung Ahmad Yani"
  room?: string;          // contoh: "Area VVIP" / "Ruang Sidang Utama"
  seat_row?: string;      // contoh: "A"
  seat_num?: string;      // contoh: "06"
  wisma_name: string;     // contoh: "Wisma Kartika" / "Wisma Soedirman"
  room_code: string;      // contoh: "103A"
  room_number?: string;   // alias contoh: "103A"
  bed_number?: number;    // 1 atau 2
  room_floor: string;     // contoh: "Lantai 1"
  assigned_at: string;
}

export interface SeatGroup {
  id: string;
  code: string; // A, B, C, D, E, F
  name: string; // VVIP Bintang 4, VIP Bintang 3-2, etc.
  description: string;
  capacity: number;
  color_code: string;
  sort_order: number;
}

export interface Seat {
  id: string;
  group_id: string;
  group_code: string;
  seat_number: string; // e.g., "A-01", "B-12"
  row_num: number;
  col_num: number;
  guest_id?: string;
  peserta_id?: string | null;
  guest_name?: string;
  guest_rank?: string;
  guest_matra?: MatraType;
  kategori_instansi?: string;
  warna?: string;
  colorAlias?: string | null;
  guest_status?: 'REGISTRASI' | 'CHECK_IN';
  status?: 'KOSONG' | 'ASSIGNED' | 'CHECK_IN';
  is_reserved: number;
}

export interface AccommodationRoom {
  id: string;
  wisma_name: string; // Wisma Soedirman, Wisma Kartika, Mess Perwira
  floor: number;
  room_number: string; // 101, 102, etc.
  capacity: number; // 1 or 2
  notes?: string;
  slot_a_guest_id?: string;
  slot_a_guest_name?: string;
  slot_a_guest_rank?: string;
  slot_a_guest_matra?: MatraType;
  slot_b_guest_id?: string;
  slot_b_guest_name?: string;
  slot_b_guest_rank?: string;
  slot_b_guest_matra?: MatraType;
}

export interface Checkpoint {
  id: string;
  code: string; // GATE_UTAMA, PLENO_VIP, SESI_KHUSUS, KONSUMSI
  name: string;
  description: string;
  location: string;
}

export interface CheckinLog {
  id: string;
  guest_id: string;
  guest_nama: string;
  guest_nrp: string;
  guest_pangkat: string;
  guest_matra: MatraType;
  checkpoint_code: string;
  checkpoint_name: string;
  scanned_by_admin_id?: string;
  scanned_by_admin_name?: string;
  scanned_at: string;
  ip_address?: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'PANITIA_GATE' | 'PANITIA_AKOMODASI';

export interface AdminUser {
  id: string;
  username: string;
  nama: string;
  role: AdminRole;
  password_hash: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_username: string;
  action: string;
  target_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

