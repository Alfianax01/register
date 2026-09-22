<?php
/**
 * KONFIGURASI UTAMA PORTAL RAPIM TNI 2026
 * Sesuaikan detail database di bawah ini dengan database cPanel Anda.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 86400,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// 1. DETAIL KONEKSI DATABASE CPANEL (UBAH SESUAI CPANEL ANDA)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'tni_register');       // Contoh: u1234567_register
define('DB_USER', getenv('DB_USER') ?: 'root');               // Contoh: u1234567_user
define('DB_PASS', getenv('DB_PASS') ?: '');                   // Password database cPanel

// 2. KONEKSI PDO KE MYSQL
function get_db() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            // Jika database belum dibuat / belum di-import
            return null;
        }
    }
    return $pdo;
}

// 3. AMBIL PENGATURAN WEBSITE (CMS & THEME)
function get_site_settings() {
    static $settings = null;
    if ($settings !== null) return $settings;

    $defaults = [
        'nama_sistem' => 'PORTAL RAPIM TNI 2026',
        'subjudul' => 'Sistem Informasi Presensi, Akreditasi, dan Tata Kelola Kedinasan',
        'footer' => 'PUSAT INFORMASI PENGOLAHAN DATA TENTARA NASIONAL INDONESIA (PUSINFOLAHTA TNI)',
        'theme_preset' => 'TNI_MERAH_EMAS',
        'primary_color' => '#8B0000',
        'secondary_color' => '#6B0000',
        'gold_accent' => '#B8860B',
        'gold_light' => '#D4AF37',
        'sidebar_color' => '#6B0000',
        'navbar_color' => '#8B0000',
        'button_color' => '#9B6A35',
        'accent_color' => '#B8860B',
        'bg_color' => '#F5F6F8',
        'card_color' => '#FFFFFF',
        'text_primary' => '#1F2937',
        'text_secondary' => '#6B7280',
        'border_color' => '#E5E7EB',
        'logo_header' => '/assets/images/logo-tni-rapim.png',
        'logo_sidebar' => '/assets/images/logo-tni-rapim.png',
        'banner_login' => '',
        'label_matra' => 'Matra',
        'label_pangkat' => 'Pangkat',
        'label_korps' => 'Korps',
        'label_satuan' => 'Kesatuan / Kotama',
        'label_jabatan' => 'Jabatan Dinas',
        'label_kategori' => 'Kategori Undangan'
    ];

    $db = get_db();
    if ($db) {
        try {
            $stmt = $db->query("SELECT setting_value FROM website_settings WHERE setting_key = 'site_settings' LIMIT 1");
            $row = $stmt->fetch();
            if ($row && !empty($row['setting_value'])) {
                $saved = json_decode($row['setting_value'], true);
                if (is_array($saved)) {
                    $settings = array_merge($defaults, $saved);
                    return $settings;
                }
            }
        } catch (Exception $e) {}
    }

    $settings = $defaults;
    return $settings;
}

// 4. HELPER OTENTIKASI & OTORISASI
function is_logged_in() {
    return isset($_SESSION['admin_user']) && !empty($_SESSION['admin_user']['id']);
}

function current_user() {
    return $_SESSION['admin_user'] ?? null;
}

function require_login() {
    if (!is_logged_in()) {
        header('Location: /login.php');
        exit;
    }
}

function has_permission($code) {
    $user = current_user();
    if (!$user) return false;
    if ($user['role'] === 'Super Admin') return true;

    $perms = $user['permissions'] ?? [];
    return in_array($code, $perms);
}

// 5. HELPER SANITASI & AUDIT
function clean($str) {
    return htmlspecialchars(trim((string)$str), ENT_QUOTES, 'UTF-8');
}

function json_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function log_audit($action, $details = '') {
    $db = get_db();
    if (!$db) return;
    try {
        $user = current_user();
        $userId = $user ? $user['id'] : null;
        $username = $user ? $user['username'] : 'tamu';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

        $stmt = $db->prepare("INSERT INTO audit_logs (user_id, username, action, details, ip_address) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $username, $action, $details, $ip]);
    } catch (Exception $e) {}
}
