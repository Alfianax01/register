-- =============================================================================
-- SKEMA BASIS DATA POSTGRESQL: SISTEM REGISTRASI RAPIM TNI 2026
-- Compatible with: Vercel Postgres, Neon Serverless Postgres, Supabase, AWS Aurora
-- =============================================================================

-- 1. TABEL UTAMA TAMU & PESERTA (tni_guests)
CREATE TABLE IF NOT EXISTS tni_guests (
  id VARCHAR(100) PRIMARY KEY,
  registration_id VARCHAR(50),
  ticket_id VARCHAR(50),
  nrp VARCHAR(50),
  nama VARCHAR(255) NOT NULL,
  gelar_depan VARCHAR(50),
  gelar_belakang VARCHAR(50),
  matra VARCHAR(20) NOT NULL,
  pangkat VARCHAR(100) NOT NULL,
  pangkat_level INT DEFAULT 10,
  jabatan VARCHAR(255) NOT NULL,
  satker VARCHAR(255) NOT NULL,
  satuan VARCHAR(255),
  negara_instansi VARCHAR(255),
  no_hp VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  email_sent BOOLEAN DEFAULT FALSE,
  butuh_akomodasi INT DEFAULT 0,
  tgl_checkin VARCHAR(50),
  tgl_checkout VARCHAR(50),
  catatan_khusus TEXT,
  seat_group_id VARCHAR(50),
  seat_number VARCHAR(50),
  room_id VARCHAR(50),
  room_slot VARCHAR(10),
  qr_token VARCHAR(100) UNIQUE NOT NULL,
  token_hash VARCHAR(100),
  status_kehadiran VARCHAR(20) DEFAULT 'BELUM_HADIR',
  waktu_kehadiran_pertama VARCHAR(50),
  kategori_instansi VARCHAR(50),
  warna_kursi VARCHAR(20),
  created_at VARCHAR(50),
  updated_at VARCHAR(50)
);

-- Indeks Pencarian Cepat & Scan QR
CREATE INDEX IF NOT EXISTS idx_tni_guests_token ON tni_guests(qr_token);
CREATE INDEX IF NOT EXISTS idx_tni_guests_ticket ON tni_guests(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tni_guests_reg_id ON tni_guests(registration_id);
CREATE INDEX IF NOT EXISTS idx_tni_guests_nrp ON tni_guests(nrp);
CREATE INDEX IF NOT EXISTS idx_tni_guests_phone ON tni_guests(no_hp);
CREATE INDEX IF NOT EXISTS idx_tni_guests_email ON tni_guests(email);
CREATE INDEX IF NOT EXISTS idx_tni_guests_status ON tni_guests(status_kehadiran);

-- 2. TABEL LOG PRESENSI / CHECK-IN SCANNER (tni_checkin_logs)
CREATE TABLE IF NOT EXISTS tni_checkin_logs (
  id VARCHAR(100) PRIMARY KEY,
  guest_id VARCHAR(100),
  guest_nama VARCHAR(255),
  guest_nrp VARCHAR(50),
  guest_pangkat VARCHAR(100),
  guest_matra VARCHAR(20),
  checkpoint_code VARCHAR(50),
  checkpoint_name VARCHAR(100),
  scanned_by_admin_id VARCHAR(100),
  scanned_by_admin_name VARCHAR(100),
  scanned_at VARCHAR(50),
  ip_address VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_tni_checkin_guest_id ON tni_checkin_logs(guest_id);
CREATE INDEX IF NOT EXISTS idx_tni_checkin_scanned_at ON tni_checkin_logs(scanned_at);

-- 3. TABEL STATE / ALOKASI KURSI & WISMA (tni_state)
-- Digunakan untuk menyimpan state persisten kursi dan denah kamar antar-serverless lambda
CREATE TABLE IF NOT EXISTS tni_state (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at VARCHAR(50)
);

-- =============================================================================
-- KETERANGAN:
-- Aplikasi juga otomatis menjalankan DDL ini (Auto-migration) jika tabel belum ada
-- saat pertama kali runtime Next.js terhubung ke PostgreSQL.
-- =============================================================================

