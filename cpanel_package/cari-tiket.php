<?php
require_once __DIR__ . '/config.php';

$settings = get_site_settings();
$query = clean($_GET['q'] ?? '');
$results = [];
$searched = false;

if (!empty($query)) {
    $searched = true;
    $db = get_db();
    if ($db) {
        $searchTerm = "%$query%";
        $stmt = $db->prepare("
            SELECT barcode, nama_lengkap, pangkat, korps, nrp, matra, instansi, seat_number, status 
            FROM guests 
            WHERE nrp LIKE ? OR nama_lengkap LIKE ? OR no_hp LIKE ? OR barcode LIKE ? 
            LIMIT 20
        ");
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        $results = $stmt->fetchAll();
    }
}

$logoSrc = !empty($settings['logo_header']) ? $settings['logo_header'] : '/assets/images/logo-tni-rapim.png';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pencarian E-Ticket — <?= clean($settings['nama_sistem']) ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="min-h-screen bg-[#F5F6F8] text-[#1F2937] flex flex-col justify-between">

    <!-- Header -->
    <header class="bg-[#8B0000] text-white p-4 shadow-md border-b-2 border-[#B8860B]">
        <div class="max-w-4xl mx-auto flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="<?= htmlspecialchars($logoSrc) ?>" alt="Logo" class="w-9 h-9 object-contain bg-white rounded-full p-1">
                <div>
                    <span class="text-xs font-bold block"><?= clean($settings['nama_sistem']) ?></span>
                    <span class="text-[10px] text-red-200 block">Pencarian E-Ticket Undangan</span>
                </div>
            </div>
            <a href="/index.php" class="text-xs text-white/80 hover:text-white font-medium">← Form Registrasi</a>
        </div>
    </header>

    <main class="max-w-3xl mx-auto w-full px-4 py-8 flex-1">
        <div class="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
                <h1 class="text-lg font-black text-slate-900">Cari E-Ticket Peserta RAPIM</h1>
                <p class="text-xs text-slate-500 mt-1">Masukkan NRP, Nama Lengkap, atau Nomor WhatsApp yang digunakan saat mendaftar.</p>
            </div>

            <form method="GET" action="cari-tiket.php" class="flex gap-2">
                <input
                    type="text"
                    name="q"
                    required
                    value="<?= clean($query) ?>"
                    placeholder="Ketik NRP atau Nama Lengkap..."
                    class="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                />
                <button
                    type="submit"
                    class="px-6 py-2.5 bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold rounded-lg shadow-sm"
                >
                    Cari Tiket
                </button>
            </form>

            <?php if ($searched): ?>
                <div class="pt-4 border-t border-slate-100">
                    <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Hasil Pencarian (<?= count($results) ?> Ditemukan)
                    </h2>

                    <?php if (empty($results)): ?>
                        <div class="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-lg border border-slate-200">
                            Tidak ditemukan peserta dengan kata kunci "<strong><?= clean($query) ?></strong>". Pastikan penulisan NRP sudah sesuai.
                        </div>
                    <?php else: ?>
                        <div class="space-y-3">
                            <?php foreach ($results as $res): ?>
                                <div class="p-4 rounded-lg border border-slate-200 hover:border-[#B8860B] transition flex items-center justify-between bg-white shadow-2xs">
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs font-extrabold text-slate-900"><?= clean($res['nama_lengkap']) ?></span>
                                            <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-600"><?= clean($res['matra']) ?></span>
                                        </div>
                                        <span class="text-xs text-slate-500 block mt-0.5">
                                            <?= clean($res['pangkat']) ?> — NRP: <strong class="font-mono"><?= clean($res['nrp']) ?></strong>
                                        </span>
                                        <span class="text-[11px] text-slate-400 block"><?= clean($res['instansi']) ?></span>
                                    </div>
                                    <div class="text-right">
                                        <a
                                            href="/ticket.php?barcode=<?= urlencode($res['barcode']) ?>"
                                            class="inline-block px-3.5 py-1.5 bg-[#9B6A35] hover:bg-[#7B532A] text-white text-xs font-bold rounded-md shadow-2xs"
                                        >
                                            Buka Tiket →
                                        </a>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </main>

    <footer class="bg-[#1F2937] text-slate-400 text-center py-3 text-xs">
        <?= clean($settings['footer']) ?>
    </footer>
</body>
</html>
