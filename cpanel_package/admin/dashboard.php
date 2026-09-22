<?php
$pageTitle = 'Dashboard Utama';
$pageSubtitle = 'Ringkasan statistik kehadiran, status akreditasi, dan penempatan peserta RAPIM TNI 2026';

require_once __DIR__ . '/layout_top.php';
require_permission('DASHBOARD');

$db = get_db();
$totalGuests = 0;
$totalHadir = 0;
$totalBelum = 0;
$totalKursiTerisi = 0;
$totalWismaTerisi = 0;
$recentGuests = [];
$matraStats = [];

if ($db) {
    try {
        $totalGuests = (int)$db->query("SELECT COUNT(*) FROM guests")->fetchColumn();
        $totalHadir = (int)$db->query("SELECT COUNT(*) FROM guests WHERE status = 'Hadir'")->fetchColumn();
        $totalBelum = $totalGuests - $totalHadir;
        $totalKursiTerisi = (int)$db->query("SELECT COUNT(*) FROM guests WHERE seat_number IS NOT NULL AND seat_number != ''")->fetchColumn();
        $totalWismaTerisi = (int)$db->query("SELECT COUNT(*) FROM guests WHERE room_number IS NOT NULL AND room_number != ''")->fetchColumn();

        $stmtRecent = $db->query("SELECT * FROM guests ORDER BY id DESC LIMIT 8");
        $recentGuests = $stmtRecent->fetchAll();

        $stmtMatra = $db->query("SELECT matra, COUNT(*) as count FROM guests GROUP BY matra ORDER BY count DESC");
        $matraStats = $stmtMatra->fetchAll();
    } catch (Exception $e) {}
}

$pctHadir = $totalGuests > 0 ? round(($totalHadir / $totalGuests) * 100, 1) : 0;
?>

<div class="space-y-6">
    <!-- 4 KARTU STATISTIK UTAMA -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Peserta -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Peserta</span>
                <span class="p-2 rounded-lg bg-red-50 text-[#8B0000] text-sm">👥</span>
            </div>
            <div class="mt-3">
                <span class="text-2xl font-black text-slate-900"><?= number_format($totalGuests) ?></span>
                <span class="text-xs text-slate-400 block mt-0.5">Orang Terdaftar</span>
            </div>
        </div>

        <!-- Presensi Hadir -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Hadir di Lokasi</span>
                <span class="p-2 rounded-lg bg-emerald-50 text-emerald-600 text-sm">✓</span>
            </div>
            <div class="mt-3">
                <span class="text-2xl font-black text-emerald-600"><?= number_format($totalHadir) ?></span>
                <span class="text-xs text-emerald-700 font-bold block mt-0.5"><?= $pctHadir ?>% Tingkat Kehadiran</span>
            </div>
        </div>

        <!-- Kursi Pleno -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Kursi Pleno Terisi</span>
                <span class="p-2 rounded-lg bg-amber-50 text-[#B8860B] text-sm">🪑</span>
            </div>
            <div class="mt-3">
                <span class="text-2xl font-black text-slate-900"><?= number_format($totalKursiTerisi) ?></span>
                <span class="text-xs text-slate-400 block mt-0.5">Nomor Kursi Teralokasi</span>
            </div>
        </div>

        <!-- Kamar Wisma -->
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Wisma Penginapan</span>
                <span class="p-2 rounded-lg bg-blue-50 text-blue-600 text-sm">🏢</span>
            </div>
            <div class="mt-3">
                <span class="text-2xl font-black text-slate-900"><?= number_format($totalWismaTerisi) ?></span>
                <span class="text-xs text-slate-400 block mt-0.5">Kamar Ditempati</span>
            </div>
        </div>
    </div>

    <!-- SHORTCUT CEPAT OPERASIONAL -->
    <div class="bg-gradient-to-r from-[#8B0000] to-[#6B0000] rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
            <h3 class="text-base font-black tracking-tight">Operasional Lapangan & Presensi Acara</h3>
            <p class="text-xs text-red-200 mt-0.5">Akses cepat modul pemindaian barcode gate kedatangan dan penataan kursi pleno.</p>
        </div>
        <div class="flex flex-wrap gap-2">
            <a href="/admin/scanner.php" class="px-4 py-2 bg-white text-[#8B0000] text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100 transition flex items-center gap-1.5">
                <span>📷</span>
                <span>Buka Scanner Gate</span>
            </a>
            <a href="/admin/allocation.php" class="px-4 py-2 bg-[#B8860B] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-amber-600 transition flex items-center gap-1.5">
                <span>🪑</span>
                <span>Auto Alokasi Kursi</span>
            </a>
            <a href="/admin/guests.php" class="px-4 py-2 bg-black/30 text-white text-xs font-bold rounded-lg hover:bg-black/40 transition">
                + Data Peserta
            </a>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- TABEL 8 PENDAFTAR TERBARU -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Peserta Terbaru Terdaftar</h3>
                <a href="/admin/guests.php" class="text-xs text-[#8B0000] hover:underline font-semibold">Lihat Semua →</a>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                            <th class="py-2">Nama & Pangkat</th>
                            <th class="py-2">Matra</th>
                            <th class="py-2">Kursi</th>
                            <th class="py-2">Status</th>
                            <th class="py-2 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php if (empty($recentGuests)): ?>
                        <tr><td colspan="5" class="py-4 text-center text-slate-400">Belum ada peserta terdaftar.</td></tr>
                        <?php else: foreach ($recentGuests as $g): ?>
                        <tr class="hover:bg-slate-50">
                            <td class="py-2.5">
                                <span class="font-bold text-slate-900 block"><?= clean($g['nama_lengkap']) ?></span>
                                <span class="text-[11px] text-slate-400 block"><?= clean($g['pangkat']) ?> (NRP: <?= clean($g['nrp']) ?>)</span>
                            </td>
                            <td class="py-2.5">
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                    <?= clean($g['matra']) ?>
                                </span>
                            </td>
                            <td class="py-2.5 font-bold font-mono text-[#8B0000]">
                                <?= !empty($g['seat_number']) ? clean($g['seat_number']) : '-' ?>
                            </td>
                            <td class="py-2.5">
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold <?= $g['status'] === 'Hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600' ?>">
                                    <?= clean($g['status']) ?>
                                </span>
                            </td>
                            <td class="py-2.5 text-right">
                                <a href="/ticket.php?barcode=<?= urlencode($g['barcode']) ?>" target="_blank" class="text-xs text-blue-600 hover:underline">Tiket</a>
                            </td>
                        </tr>
                        <?php endforeach; endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SEBARAN MATRA -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                Sebaran Peserta per Matra
            </h3>

            <div class="space-y-3">
                <?php if (empty($matraStats)): ?>
                <p class="text-xs text-slate-400 text-center py-4">Belum ada data matra.</p>
                <?php else: foreach ($matraStats as $m): 
                    $pct = $totalGuests > 0 ? round(($m['count'] / $totalGuests) * 100, 1) : 0;
                ?>
                <div class="space-y-1">
                    <div class="flex justify-between text-xs font-semibold">
                        <span class="text-slate-700"><?= clean($m['matra']) ?></span>
                        <span class="text-slate-900 font-mono"><?= $m['count'] ?> (<?= $pct ?>%)</span>
                    </div>
                    <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full bg-[#8B0000]" style="width: <?= $pct ?>%;"></div>
                    </div>
                </div>
                <?php endforeach; endif; ?>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/layout_bottom.php'; ?>
