<?php
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

// 1. SCAN CHECK-IN GATE
if ($action === 'checkin_scan') {
    if (!is_logged_in()) {
        json_response(['error' => 'Unauthorized'], 401);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $barcode = trim($input['barcode'] ?? '');
    $gate = trim($input['gate'] ?? 'Gate Utama');

    if (empty($barcode)) {
        json_response(['error' => 'Barcode wajib diisi'], 400);
    }

    $db = get_db();
    if (!$db) {
        json_response(['error' => 'Koneksi database gagal'], 500);
    }

    $stmt = $db->prepare("SELECT * FROM guests WHERE barcode = ? OR nrp = ? LIMIT 1");
    $stmt->execute([$barcode, $barcode]);
    $guest = $stmt->fetch();

    if (!$guest) {
        json_response(['success' => false, 'message' => 'Data tiket tidak terdaftar di sistem.'], 404);
    }

    $timestamp = date('d M Y, H:i:s');
    $nowSql = date('Y-m-d H:i:s');
    $user = current_user();
    $adminName = $user ? $user['nama'] : 'Petugas';

    if ($guest['status'] === 'Hadir') {
        json_response([
            'success' => false,
            'already_checked_in' => true,
            'message' => 'Peserta sudah pernah melakukan presensi sebelumnya.',
            'guest' => $guest
        ]);
    }

    // Update status hadir
    $upStmt = $db->prepare("UPDATE guests SET status = 'Hadir', checked_in_at = ?, checked_in_by = ?, gate = ? WHERE id = ?");
    $upStmt->execute([$nowSql, $adminName, $gate, $guest['id']]);

    // Insert log
    try {
        $logStmt = $db->prepare("INSERT INTO checkin_logs (guest_id, guest_name, nrp, barcode, gate, scanned_by) VALUES (?, ?, ?, ?, ?, ?)");
        $logStmt->execute([$guest['id'], $guest['nama_lengkap'], $guest['nrp'], $guest['barcode'], $gate, $adminName]);
    } catch (Exception $e) {}

    $guest['status'] = 'Hadir';
    $guest['checked_in_at'] = $timestamp;
    $guest['gate'] = $gate;

    json_response([
        'success' => true,
        'message' => 'Check-in berhasil.',
        'timestamp' => $timestamp,
        'guest' => $guest
    ]);
}

// 2. EXPORT CSV PESERTA UNTUK EXCEL
elseif ($action === 'export_guests_csv') {
    if (!is_logged_in()) {
        header('Location: /login.php');
        exit;
    }

    $db = get_db();
    $guests = $db->query("SELECT id, barcode, nama_lengkap, pangkat, korps, nrp, matra, instansi, jabatan, kategori, seat_number, room_number, status, checked_in_at, gate, email, no_hp FROM guests ORDER BY id ASC")->fetchAll();

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=Rekap_Peserta_RAPIM_TNI_2026_' . date('Ymd_His') . '.csv');

    $output = fopen('php://output', 'w');
    // UTF-8 BOM for Excel
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

    fputcsv($output, [
        'ID', 'No. Tiket / Barcode', 'Nama Lengkap', 'Pangkat', 'Korps', 'NRP / NIP',
        'Matra', 'Kesatuan / Instansi', 'Jabatan', 'Kategori', 'No. Kursi Pleno',
        'Kamar Wisma', 'Status Presensi', 'Waktu Check-In', 'Pintu Gerbang', 'Email', 'No. WhatsApp'
    ]);

    foreach ($guests as $g) {
        fputcsv($output, [
            $g['id'],
            $g['barcode'],
            $g['nama_lengkap'],
            $g['pangkat'],
            $g['korps'],
            $g['nrp'],
            $g['matra'],
            $g['instansi'],
            $g['jabatan'],
            $g['kategori'],
            $g['seat_number'],
            $g['room_number'],
            $g['status'],
            $g['checked_in_at'],
            $g['gate'],
            $g['email'],
            $g['no_hp']
        ]);
    }
    fclose($output);
    exit;
}

json_response(['error' => 'Endpoint tidak ditemukan'], 404);
