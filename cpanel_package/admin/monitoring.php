<?php
$pageTitle = 'Monitoring Presensi Real-Time';
$pageSubtitle = 'Pemantauan arus kehadiran peserta per gerbang dan waktu kedatangan secara langsung';

require_once __DIR__ . '/layout_top.php';
require_permission('MONITORING');

$db = get_db();
$logs = [];
if ($db) {
    try {
        $stmt = $db->query("
            SELECT g.nama_lengkap, g.pangkat, g.nrp, g.matra, g.instansi, g.seat_number, g.checked_in_at, g.gate, g.checked_in_by
            FROM guests g 
            WHERE g.status = 'Hadir' 
            ORDER BY g.checked_in_at DESC 
            LIMIT 100
        ");
        $logs = $stmt->fetchAll();
    } catch (Exception $e) {}
}
?>

<div class="space-y-6">
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
            <h2 class="text-sm font-bold text-slate-900">Arus Kedatangan Terkini</h2>
            <p class="text-xs text-slate-500">Menampilkan 100 peserta terakhir yang melakukan check-in di pos gerbang.</p>
        </div>
        <button onclick="window.location.reload()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5">
            <span>🔄</span>
            <span>Segarkan Data</span>
        </button>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <tr>
                        <th class="py-3 px-4">Waktu Check-In</th>
                        <th class="py-3 px-4">Nama & Pangkat</th>
                        <th class="py-3 px-4">NRP</th>
                        <th class="py-3 px-4">Matra & Satker</th>
                        <th class="py-3 px-4">No. Kursi</th>
                        <th class="py-3 px-4">Pos Gerbang</th>
                        <th class="py-3 px-4">Petugas</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($logs)): ?>
                    <tr><td colspan="7" class="py-8 text-center text-slate-400">Belum ada peserta yang check in.</td></tr>
                    <?php else: foreach ($logs as $l): ?>
                    <tr class="hover:bg-slate-50">
                        <td class="py-3 px-4 font-mono font-bold text-emerald-700">
                            <?= clean($l['checked_in_at']) ?>
                        </td>
                        <td class="py-3 px-4">
                            <span class="font-bold text-slate-900 block"><?= clean($l['nama_lengkap']) ?></span>
                            <span class="text-[11px] text-slate-400"><?= clean($l['pangkat']) ?></span>
                        </td>
                        <td class="py-3 px-4 font-mono text-slate-700">
                            <?= clean($l['nrp']) ?>
                        </td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700"><?= clean($l['matra']) ?></span>
                            <span class="text-[11px] text-slate-500 block"><?= clean($l['instansi']) ?></span>
                        </td>
                        <td class="py-3 px-4 font-mono font-bold text-[#8B0000]">
                            <?= clean($l['seat_number'] ?? '-') ?>
                        </td>
                        <td class="py-3 px-4 font-medium text-slate-700">
                            <?= clean($l['gate'] ?? 'Gate Utama') ?>
                        </td>
                        <td class="py-3 px-4 text-slate-400 text-[11px]">
                            <?= clean($l['checked_in_by'] ?? 'Sistem') ?>
                        </td>
                    </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/layout_bottom.php'; ?>
