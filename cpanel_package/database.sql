-- =======================================================
-- DATABASE SKEMA: PORTAL RAPIM TNI 2026 (cPanel MySQL)
-- =======================================================

SET NAMES utf8mb4;
SET time_zone = '+07:00';
SET foreign_key_checks = 0;

-- 1. TABEL PENGATURAN WEBSITE & TEMA
CREATE TABLE IF NOT EXISTS `website_settings` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(50) NOT NULL UNIQUE,
  `setting_value` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL ROLES (USER GROUPS & HAK AKSES)
CREATE TABLE IF NOT EXISTS `roles` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `permissions` LONGTEXT NOT NULL,
  `is_system` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL USERS / ADMIN DINAS
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `nama` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Viewer',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL GUESTS / PESERTA RAPIM TNI 2026
CREATE TABLE IF NOT EXISTS `guests` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `barcode` VARCHAR(64) NOT NULL UNIQUE,
  `nama_lengkap` VARCHAR(255) NOT NULL,
  `matra` VARCHAR(50) NOT NULL,
  `pangkat` VARCHAR(100) NOT NULL,
  `korps` VARCHAR(50) DEFAULT NULL,
  `nrp` VARCHAR(50) NOT NULL,
  `jabatan` VARCHAR(255) NOT NULL,
  `instansi` VARCHAR(255) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `no_hp` VARCHAR(50) DEFAULT NULL,
  `kategori` VARCHAR(50) NOT NULL DEFAULT 'Peserta',
  `seat_number` VARCHAR(50) DEFAULT NULL,
  `room_number` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Terdaftar',
  `checked_in_at` DATETIME DEFAULT NULL,
  `checked_in_by` VARCHAR(100) DEFAULT NULL,
  `gate` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_guests_nrp` (`nrp`),
  KEY `idx_guests_matra` (`matra`),
  KEY `idx_guests_status` (`status`),
  KEY `idx_guests_seat` (`seat_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL CHECK-IN LOGS
CREATE TABLE IF NOT EXISTS `checkin_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `guest_id` INT NOT NULL,
  `guest_name` VARCHAR(255) NOT NULL,
  `nrp` VARCHAR(50) DEFAULT NULL,
  `barcode` VARCHAR(64) NOT NULL,
  `gate` VARCHAR(50) DEFAULT 'Gate Utama',
  `scanned_by` VARCHAR(100) DEFAULT 'Sistem',
  `scanned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_log_scanned_at` (`scanned_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABEL AUDIT LOGS
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(50) DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED DATA: DEFAULT ROLES
INSERT INTO `roles` (`id`, `name`, `description`, `permissions`, `is_system`) VALUES
('role_superadmin', 'Super Admin', 'Akses penuh ke seluruh sistem, tata kelola website, laporan, dan otorisasi pengguna.', '["DASHBOARD","GUESTS","SEATS","SCANNER","MONITORING","CMS","AUTH","EXPORT_PDF","EXPORT_EXCEL"]', 1),
('role_event', 'Admin Event', 'Koordinator acara utama dengan wewenang mengelola data peserta, denah kursi, akomodasi, serta unduhan laporan.', '["DASHBOARD","GUESTS","SEATS","MONITORING","EXPORT_PDF","EXPORT_EXCEL"]', 1),
('role_registrasi', 'Admin Registrasi', 'Petugas sekretariat yang mengelola pendaftaran peserta, validasi data, dan rekap data.', '["DASHBOARD","GUESTS","EXPORT_PDF","EXPORT_EXCEL"]', 1),
('role_checkin', 'Admin Check-In', 'Penanggung jawab pos gerbang dan registrasi ulang di lokasi kegiatan.', '["DASHBOARD","SCANNER","MONITORING"]', 1),
('role_scanner', 'Operator Scanner', 'Petugas teknis di pintu gerbang yang melakukan pemindaian barcode e-ticket tamu.', '["SCANNER"]', 1),
('role_viewer', 'Viewer', 'Akses khusus pimpinan atau tamu kehormatan untuk memantau ringkasan statistik dan kehadiran.', '["DASHBOARD","MONITORING"]', 1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- SEED DATA: DEFAULT AKUN DINAS (Password: admin123, panitiagate123, panitiawisma123)
INSERT INTO `users` (`username`, `password_hash`, `nama`, `role`, `is_active`) VALUES
('superadmin', '$2a$10$6pBgexssOY0yNEYm9FvROeAZli24rYUbZ7iuXWp8rfkEESBQByTNK', 'Letkol Chb Radityo (Super Admin IT)', 'Super Admin', 1),
('panitiagate', '$2a$10$7nTFQMqF95S/6UxDQ/de8u/mI/e6oxQ7tWkRYwTRqGVKrdIsnQpaG', 'Kapten Inf Hendro (Koordinator Gate)', 'Admin Check-In', 1),
('panitiawisma', '$2a$10$EaL4Ytx/Y/wJm8fKq0KbOeC04EwXouxm64A..ohhHQcLTdepUd9ke', 'Mayor Laut (K) Anita (Koordinator Wisma)', 'Admin Event', 1)
ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `role` = VALUES(`role`);

-- SEED DATA: PENGATURAN WEBSITE RESMI PUSINFOLAHTA TNI
INSERT INTO `website_settings` (`setting_key`, `setting_value`) VALUES
('site_settings', '{"nama_sistem":"PORTAL RAPIM TNI 2026","subjudul":"Sistem Informasi Presensi, Akreditasi, dan Tata Kelola Kedinasan","footer":"PUSAT INFORMASI PENGOLAHAN DATA TENTARA NASIONAL INDONESIA (PUSINFOLAHTA TNI)","theme_preset":"TNI_MERAH_EMAS","primary_color":"#8B0000","secondary_color":"#6B0000","gold_accent":"#B8860B","gold_light":"#D4AF37","sidebar_color":"#6B0000","navbar_color":"#8B0000","button_color":"#9B6A35","accent_color":"#B8860B","bg_color":"#F5F6F8","card_color":"#FFFFFF","text_primary":"#1F2937","text_secondary":"#6B7280","border_color":"#E5E7EB","logo_header":"/assets/images/logo-tni-rapim.png","logo_sidebar":"/assets/images/logo-tni-rapim.png","banner_login":"","label_matra":"Matra","label_pangkat":"Pangkat","label_korps":"Korps","label_satuan":"Kesatuan / Kotama","label_jabatan":"Jabatan Dinas","label_kategori":"Kategori Undangan"}')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);
