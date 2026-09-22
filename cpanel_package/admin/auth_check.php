<?php
require_once __DIR__ . '/../config.php';

require_login();

$currentUser = current_user();
$settings = get_site_settings();

function require_permission($permCode) {
    if (!has_permission($permCode)) {
        http_response_code(403);
        echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Akses Ditolak</title><script src='https://cdn.tailwindcss.com'></script></head><body class='min-h-screen bg-slate-100 flex items-center justify-center p-4'><div class='bg-white p-6 rounded-xl border border-red-200 text-center max-w-md shadow-sm'><div class='w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold'>✕</div><h2 class='text-base font-bold text-slate-900 mt-3'>Akses Ditolak (403)</h2><p class='text-xs text-slate-500 mt-1'>Peran Anda ({$currentUser['role']}) tidak memiliki izin untuk mengakses modul ini.</p><a href='/admin/dashboard.php' class='mt-4 inline-block px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg'>Kembali ke Dashboard</a></div></body></html>";
        exit;
    }
}
