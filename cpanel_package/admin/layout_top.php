<?php
// Layout Header & Sidebar untuk Admin Panel
require_once __DIR__ . '/auth_check.php';

$currentPage = basename($_SERVER['PHP_SELF']);
$sidebarColor = !empty($settings['sidebar_color']) ? $settings['sidebar_color'] : '#6B0000';
$logoSrc = !empty($settings['logo_sidebar']) ? $settings['logo_sidebar'] : '/assets/images/logo-tni-rapim.png';

$isPesertaOpen = in_array($currentPage, ['guests.php', 'allocation.php', 'scanner.php', 'monitoring.php']);
$isAuthOpen = in_array($currentPage, ['users.php', 'roles.php']);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? clean($pageTitle) . ' — ' : '' ?><?= clean($settings['nama_sistem']) ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.4); border-radius: 4px; }
    </style>
</head>
<body class="bg-[#F5F6F8] text-[#1F2937] flex min-h-screen">

    <!-- DESKTOP SIDEBAR PUSINFOLAHTA TNI -->
    <aside class="w-64 text-white flex flex-col flex-shrink-0 min-h-screen border-r border-[#B8860B]/30 shadow-xl select-none" style="background-color: <?= htmlspecialchars($sidebarColor) ?>;">
        <!-- Brand Header -->
        <div class="p-4 border-b border-white/10 flex items-center gap-3 bg-black/15">
            <div class="w-10 h-10 rounded-full bg-white/10 border border-[#D4AF37]/50 p-1 flex items-center justify-center flex-shrink-0">
                <img src="<?= htmlspecialchars($logoSrc) ?>" alt="Logo" class="w-full h-full object-contain">
            </div>
            <div class="min-w-0">
                <span class="text-[10px] font-extrabold text-[#D4AF37] tracking-widest uppercase block leading-none truncate">
                    PUSINFOLAHTA TNI
                </span>
                <span class="text-xs font-bold text-white block truncate mt-1">
                    <?= clean($settings['nama_sistem']) ?>
                </span>
            </div>
        </div>

        <!-- Menu List -->
        <nav class="p-3 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
            <!-- 1. Dashboard -->
            <a href="/admin/dashboard.php" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition <?= $currentPage === 'dashboard.php' ? 'bg-[#B8860B] text-white shadow-md border-l-4 border-white' : 'text-white/80 hover:bg-white/10 hover:text-white' ?>">
                <span>📊</span>
                <span>Dashboard Utama</span>
            </a>

            <!-- 2. Accordion Manajemen Peserta -->
            <div class="pt-1">
                <button type="button" onclick="toggleSubmenu('sub-peserta')" class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold text-white/85 hover:bg-white/10 transition <?= $isPesertaOpen ? 'text-[#D4AF37] bg-black/20' : '' ?>">
                    <div class="flex items-center gap-2.5">
                        <span>👥</span>
                        <span>Manajemen Peserta</span>
                    </div>
                    <span id="arrow-peserta" class="text-[10px] transform transition <?= $isPesertaOpen ? 'rotate-180 text-[#D4AF37]' : '' ?>">▼</span>
                </button>
                <div id="sub-peserta" class="mt-1 pl-4 pr-1 space-y-1 border-l-2 border-[#B8860B]/30 ml-3 <?= $isPesertaOpen ? '' : 'hidden' ?>">
                    <a href="/admin/guests.php" class="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition <?= $currentPage === 'guests.php' ? 'bg-[#B8860B] text-white font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white' ?>">
                        <span>📋</span>
                        <span>Data Peserta</span>
                    </a>
                    <a href="/admin/allocation.php" class="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition <?= $currentPage === 'allocation.php' ? 'bg-[#B8860B] text-white font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white' ?>">
                        <span>🪑</span>
                        <span>Penempatan Kursi & Wisma</span>
                    </a>
                    <a href="/admin/scanner.php" class="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition <?= $currentPage === 'scanner.php' ? 'bg-[#B8860B] text-white font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white' ?>">
                        <span>📷</span>
                        <span>Scan QR Gate</span>
                    </a>
                    <a href="/admin/monitoring.php" class="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition <?= $currentPage === 'monitoring.php' ? 'bg-[#B8860B] text-white font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white' ?>">
                        <span>📈</span>
                        <span>Monitoring Presensi</span>
                    </a>
                </div>
            </div>

            <!-- 3. Accordion User Authorization -->
            <div class="pt-1">
                <button type="button" onclick="toggleSubmenu('sub-auth')" class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold text-white/85 hover:bg-white/10 transition <?= $isAuthOpen ? 'text-[#D4AF37] bg-black/20' : '' ?>">
                    <div class="flex items-center gap-2.5">
                        <span>🛡️</span>
                        <span>User Authorization</span>
                    </div>
                    <span id="arrow-auth" class="text-[10px] transform transition <?= $isAuthOpen ? 'rotate-180 text-[#D4AF37]' : '' ?>">▼</span>
                </button>
                <div id="sub-auth" class="mt-1 pl-4 pr-1 space-y-1 border-l-2 border-[#B8860B]/30 ml-3 <?= $isAuthOpen ? '' : 'hidden' ?>">
                    <a href="/admin/roles.php" class="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition <?= $currentPage === 'roles.php' ? 'bg-[#B8860B] text-white font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white' ?>">
                        <span>📑</span>
                        <span>User Group / Peran</span>
                    </a>
                    <a href="/admin/users.php" class="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition <?= $currentPage === 'users.php' ? 'bg-[#B8860B] text-white font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white' ?>">
                        <span>👤</span>
                        <span>Daftar Pengguna</span>
                    </a>
                </div>
            </div>

            <!-- 4. Pengaturan Website (CMS) -->
            <div class="pt-1">
                <a href="/admin/website.php" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition <?= $currentPage === 'website.php' ? 'bg-[#B8860B] text-white shadow-md border-l-4 border-white' : 'text-white/80 hover:bg-white/10 hover:text-white' ?>">
                    <span>⚙️</span>
                    <span>Pengaturan Website</span>
                </a>
            </div>

            <!-- 5. Laporan & Ekspor -->
            <div class="pt-1">
                <a href="/api.php?action=export_guests_csv" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition">
                    <span>📥</span>
                    <span>Export Rekap Excel/CSV</span>
                </a>
            </div>
        </nav>

        <!-- Footer User Info -->
        <div class="p-3 border-t border-white/10 space-y-2 bg-black/20 text-xs">
            <div class="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <span class="text-[9px] text-white/60 uppercase block leading-tight">Pengguna Aktif</span>
                <span class="font-bold text-[#D4AF37] truncate block text-xs mt-0.5">
                    <?= clean($currentUser['nama']) ?>
                </span>
                <span class="text-[10px] text-white/70 block">
                    Peran: <?= clean($currentUser['role']) ?>
                </span>
            </div>

            <div class="flex items-center justify-between pt-1">
                <a href="/" target="_blank" class="text-white/70 hover:text-white text-[11px] flex items-center gap-1">
                    <span>↗ Portal Publik</span>
                </a>
                <a href="/logout.php" class="text-red-300 hover:text-red-100 text-[11px] font-bold">
                    Keluar ⎋
                </a>
            </div>
        </div>
    </aside>

    <!-- KONTEN UTAMA -->
    <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Navbar -->
        <header class="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-2xs">
            <div>
                <h1 class="text-base font-bold text-slate-900"><?= isset($pageTitle) ? clean($pageTitle) : 'Portal Panitia' ?></h1>
                <p class="text-xs text-slate-500"><?= isset($pageSubtitle) ? clean($pageSubtitle) : 'Sistem Kedinasan RAPIM TNI 2026' ?></p>
            </div>
            <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-[#8B0000] text-xs font-bold uppercase tracking-wider">
                    <?= clean($currentUser['role']) ?>
                </span>
            </div>
        </header>

        <!-- Main Body -->
        <main class="flex-1 p-6 overflow-y-auto">
