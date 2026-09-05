-- ==========================================================
-- SKEMA BASIS DATA MYSQL: SISTEM REGISTRASI TAMU RAPIM TNI 2026
-- Compatible with MySQL 8.0+, MariaDB 10.5+, PlanetScale, TiDB, AWS RDS, Aiven
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `tni_rapim_2026` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `tni_rapim_2026`;

-- ----------------------------------------------------------
-- 1. TABEL PESERTA
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `peserta` (
  `id` VARCHAR(64) NOT NULL,
  `nama_lengkap` VARCHAR(255) NOT NULL,
  `pangkat` VARCHAR(100) NOT NULL,
  `jabatan` VARCHAR(255) NOT NULL,
  `instansi` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `no_hp` VARCHAR(50) NOT NULL,
  `kategori_tamu` VARCHAR(50) NOT NULL DEFAULT 'TNI',
  `nrp` VARCHAR(50) DEFAULT NULL,
  `matra` VARCHAR(20) NOT NULL DEFAULT 'AD',
  `qr_token` VARCHAR(100) NOT NULL,
  `seat_number` VARCHAR(50) DEFAULT NULL,
  `status_hadir` VARCHAR(20) NOT NULL DEFAULT 'BELUM_HADIR',
  `pdf_path` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_peserta_qr_token` (`qr_token`),
  KEY `idx_peserta_nrp` (`nrp`),
  KEY `idx_peserta_email` (`email`),
  KEY `idx_peserta_no_hp` (`no_hp`),
  KEY `idx_peserta_status_hadir` (`status_hadir`),
  KEY `idx_peserta_seat_number` (`seat_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. TABEL KURSI
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kursi` (
  `id` VARCHAR(64) NOT NULL,
  `kode_kursi` VARCHAR(20) NOT NULL,
  `grup` VARCHAR(50) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'KOSONG',
  `peserta_id` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_kursi_kode` (`kode_kursi`),
  KEY `idx_kursi_grup` (`grup`),
  KEY `idx_kursi_status` (`status`),
  KEY `idx_kursi_peserta_id` (`peserta_id`),
  CONSTRAINT `fk_kursi_peserta` 
    FOREIGN KEY (`peserta_id`) REFERENCES `peserta` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. TABEL LOG CHECKIN
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `log_checkin` (
  `id` VARCHAR(64) NOT NULL,
  `peserta_id` VARCHAR(64) NOT NULL,
  `waktu_checkin` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `petugas` VARCHAR(100) NOT NULL DEFAULT 'Petugas Gate',
  `checkpoint` VARCHAR(100) NOT NULL DEFAULT 'Gate Utama Hankam',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_log_peserta_id` (`peserta_id`),
  KEY `idx_log_waktu_checkin` (`waktu_checkin`),
  CONSTRAINT `fk_log_peserta` 
    FOREIGN KEY (`peserta_id`) REFERENCES `peserta` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- SEED DATA AWAL KURSI PARIPURNA (GRUP A, B, C, D, E, F)
-- ----------------------------------------------------------
INSERT IGNORE INTO `kursi` (`id`, `kode_kursi`, `grup`, `status`) VALUES
('seat_A_01', 'A-01', 'VVIP Bintang 4', 'KOSONG'),
('seat_A_02', 'A-02', 'VVIP Bintang 4', 'KOSONG'),
('seat_A_03', 'A-03', 'VVIP Bintang 4', 'KOSONG'),
('seat_A_04', 'A-04', 'VVIP Bintang 4', 'KOSONG'),
('seat_A_05', 'A-05', 'VVIP Bintang 4', 'KOSONG'),
('seat_A_06', 'A-06', 'VVIP Bintang 4', 'KOSONG'),
('seat_A_07', 'A-07', 'VVIP Bintang 4', 'KOSONG'),
('seat_A_08', 'A-08', 'VVIP Bintang 4', 'KOSONG'),
('seat_B_01', 'B-01', 'VIP Bintang 3-2', 'KOSONG'),
('seat_B_02', 'B-02', 'VIP Bintang 3-2', 'KOSONG'),
('seat_B_03', 'B-03', 'VIP Bintang 3-2', 'KOSONG'),
('seat_B_04', 'B-04', 'VIP Bintang 3-2', 'KOSONG'),
('seat_B_05', 'B-05', 'VIP Bintang 3-2', 'KOSONG'),
('seat_B_06', 'B-06', 'VIP Bintang 3-2', 'KOSONG'),
('seat_B_07', 'B-07', 'VIP Bintang 3-2', 'KOSONG'),
('seat_B_08', 'B-08', 'VIP Bintang 3-2', 'KOSONG'),
('seat_C_01', 'C-01', 'Utama Bintang 1', 'KOSONG'),
('seat_C_02', 'C-02', 'Utama Bintang 1', 'KOSONG'),
('seat_C_03', 'C-03', 'Utama Bintang 1', 'KOSONG'),
('seat_C_04', 'C-04', 'Utama Bintang 1', 'KOSONG'),
('seat_C_05', 'C-05', 'Utama Bintang 1', 'KOSONG'),
('seat_C_06', 'C-06', 'Utama Bintang 1', 'KOSONG'),
('seat_C_07', 'C-07', 'Utama Bintang 1', 'KOSONG'),
('seat_C_08', 'C-08', 'Utama Bintang 1', 'KOSONG'),
('seat_D_01', 'D-01', 'Pamen Kolonel', 'KOSONG'),
('seat_D_02', 'D-02', 'Pamen Kolonel', 'KOSONG'),
('seat_D_03', 'D-03', 'Pamen Kolonel', 'KOSONG'),
('seat_D_04', 'D-04', 'Pamen Kolonel', 'KOSONG'),
('seat_D_05', 'D-05', 'Pamen Kolonel', 'KOSONG'),
('seat_D_06', 'D-06', 'Pamen Kolonel', 'KOSONG'),
('seat_D_07', 'D-07', 'Pamen Kolonel', 'KOSONG'),
('seat_D_08', 'D-08', 'Pamen Kolonel', 'KOSONG'),
('seat_E_01', 'E-01', 'Undangan Kementerian/Lembaga', 'KOSONG'),
('seat_E_02', 'E-02', 'Undangan Kementerian/Lembaga', 'KOSONG'),
('seat_E_03', 'E-03', 'Undangan Kementerian/Lembaga', 'KOSONG'),
('seat_E_04', 'E-04', 'Undangan Kementerian/Lembaga', 'KOSONG'),
('seat_E_05', 'E-05', 'Undangan Kementerian/Lembaga', 'KOSONG'),
('seat_E_06', 'E-06', 'Undangan Kementerian/Lembaga', 'KOSONG'),
('seat_E_07', 'E-07', 'Undangan Kementerian/Lembaga', 'KOSONG'),
('seat_E_08', 'E-08', 'Undangan Kementerian/Lembaga', 'KOSONG'),
('seat_F_01', 'F-01', 'Delegasi Sipil / Kehormatan', 'KOSONG'),
('seat_F_02', 'F-02', 'Delegasi Sipil / Kehormatan', 'KOSONG'),
('seat_F_03', 'F-03', 'Delegasi Sipil / Kehormatan', 'KOSONG'),
('seat_F_04', 'F-04', 'Delegasi Sipil / Kehormatan', 'KOSONG'),
('seat_F_05', 'F-05', 'Delegasi Sipil / Kehormatan', 'KOSONG'),
('seat_F_06', 'F-06', 'Delegasi Sipil / Kehormatan', 'KOSONG'),
('seat_F_07', 'F-07', 'Delegasi Sipil / Kehormatan', 'KOSONG'),
('seat_F_08', 'F-08', 'Delegasi Sipil / Kehormatan', 'KOSONG');

