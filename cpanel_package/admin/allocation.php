<?php
$pageTitle = 'Penempatan Kursi Pleno & Wisma';
$pageSubtitle = 'Tata kelola nomor tempat duduk sidang pleno, kamar penginapan, dan audit anti-duplikasi kursi';

require_once __DIR__ . '/layout_top.php';
require_permission('SEATS');

$db = get_db();
$message = '';
$msgType = 'success';

// KAPASITAS STANDAR RUANG SIDANG PLENO (Contoh: Baris A-Z, 1-30 per baris = 780 kursi)
$CAPACITY = 600;

// ACTIONS POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // 1. AUTO ALLOCATE DENGAN ALGORITMA ANTI-DUPLIKASI KETAT
    if ($action === 'auto_assign') {
        // Ambil semua kursi yang SAAT INI sudah terpakai
        $occupiedStmt = $db->query("SELECT seat_number FROM guests WHERE seat_number IS NOT NULL AND seat_number != ''");
        $occupiedSeats = $occupiedStmt->fetchAll(PDO::FETCH_COLUMN);
        $usedSet = array_flip($occupiedSeats); // O(1) lookup

        // Ambil peserta yang BELUM memiliki kursi
        $unassignedStmt = $db->query("SELECT id, nama_lengkap, matra, kategori FROM guests WHERE seat_number IS NULL OR seat_number = '' ORDER BY id ASC");
        $unassigned = $unassignedStmt->fetchAll();

        $rows = range('A', 'T'); // 20 baris
        $seatsPerRow = 30;       // 30 kursi per baris
        $assignedCount = 0;

        $updateStmt = $db->prepare("UPDATE guests SET seat_number = ? WHERE id = ?");

        foreach ($unassigned as $g) {
            $assignedSeat = null;

            // Cari kursi kosong berikutnya yang belum ada di usedSet
            foreach ($rows as $rowLetter) {
                for ($num = 1; $num <= $seatsPerRow; $num++) {
                    $candidate = "{$rowLetter}-{$num}";
                    if (!isset($usedSet[$candidate])) {
                        $assignedSeat = $candidate;
                        $usedSet[$candidate] = true; // Tandai langsung dipakai
                        break 2;
                    }
                }
            }

            if ($assignedSeat) {
                $updateStmt->execute([$assignedSeat, $g['id']]);
                $assignedCount++;
            } else {
                break; // Kapasitas penuh
            }
        }

        log_audit('AUTO_ALLOCATE_SEATS', "Auto assign $assignedCount kursi tanpa duplikasi");
        $message = "Berhasil mengalokasikan $assignedCount nomor kursi baru tanpa duplikasi.";
    }

    // 2. DEDUPLIKASI OTOMATIS JIKA ADA KURSI BENTROK
    elseif ($action === 'deduplicate') {
        // Cari kursi yang dimiliki lebih dari 1 peserta
        $dupStmt = $db->query("
            SELECT seat_number, COUNT(*) as cnt 
            FROM guests 
            WHERE seat_number IS NOT NULL AND seat_number != '' 
            GROUP BY seat_number 
            HAVING cnt > 1
        ");
        $dupList = $dupStmt->fetchAll();

        // Ambil seluruh kursi terpakai
        $allOccupied = $db->query("SELECT seat_number FROM guests WHERE seat_number IS NOT NULL AND seat_number != ''")->fetchAll(PDO::FETCH_COLUMN);
        $usedSet = array_flip($allOccupied);

        $rows = range('A', 'T');
        $seatsPerRow = 30;
        $fixedCount = 0;

        $updateStmt = $db->prepare("UPDATE guests SET seat_number = ? WHERE id = ?");

        foreach ($dupList as $d) {
            $seat = $d['seat_number'];
            // Ambil semua peserta dengan kursi tersebut, biarkan 1 orang pertama tetap, pindahkan sisanya
            $getGuestsStmt = $db->prepare("SELECT id, nama_lengkap FROM guests WHERE seat_number = ? ORDER BY id ASC");
            $getGuestsStmt->execute([$seat]);
            $clashing = $getGuestsStmt->fetchAll();

            // Skip yang pertama, deduplikasi indeks 1 ke atas
            for ($i = 1; $i < count($clashing); $i++) {
                $victim = $clashing[$i];
                $newSeat = null;

                foreach ($rows as $rowLetter) {
                    for ($num = 1; $num <= $seatsPerRow; $num++) {
                        $candidate = "{$rowLetter}-{$num}";
                        if (!isset($usedSet[$candidate])) {
                            $newSeat = $candidate;
                            $usedSet[$candidate] = true;
                            break 2;
                        }
                    }
                }

                if ($newSeat) {
                    $updateStmt->execute([$newSeat, $victim['id']]);
                    $fixedCount++;
                }
            }
        }

        log_audit('DEDUPLICATE_SEATS', "Memperbaiki $fixedCount kursi bentrok");
        $message = "Deduplikasi selesai! $fixedCount peserta dengan nomor kursi bentrok telah dipindahkan ke nomor kursi kosong.";
    }

    // 3. RESET SELURUH KURSI
    elseif ($action === 'reset_seats') {
        $db->exec("UPDATE guests SET seat_number = NULL");
        log_audit('RESET_SEATS', "Mereset seluruh nomor kursi peserta");
        $message = "Seluruh nomor kursi peserta berhasil di-reset menjadi kosong.";
    }

    // 4. UPDATE MANUAL KURSI & WISMA
    elseif ($action === 'manual_update') {
        $id = (int)($_POST['id'] ?? 0);
        $seat = clean($_POST['seat_number'] ?? '');
        $room = clean($_POST['room_number'] ?? '');

        // Validasi: Cek apakah kursi sudah digunakan peserta lain
        if (!empty($seat)) {
            $checkStmt = $db->prepare("SELECT id, nama_lengkap FROM guests WHERE seat_number = ? AND id != ? LIMIT 1");
            $checkStmt->execute([$seat, $id]);
            $taken = $checkStmt->fetch();

            if ($taken) {
                $message = "Gagal: Kursi '$seat' sudah ditempati oleh {$taken['nama_lengkap']}! Silakan pilih nomor kursi lain.";
                $msgType = 'error';
            } else {
                $up = $db->prepare("UPDATE guests SET seat_number = ?, room_number = ? WHERE id = ?");
                $up->execute([$seat, $room, $id]);
                $message = "Nomor kursi dan kamar wisma peserta berhasil disimpan.";
            }
        } else {
            $up = $db->prepare("UPDATE guests SET seat_number = NULL, room_number = ? WHERE id = ?");
            $up->execute([$room, $id]);
            $message = "Nomor kursi dan kamar wisma peserta berhasil disimpan.";
        }
    }
}

// AUDIT STATISTIK KURSI
$totalAssigned = (int)$db->query("SELECT COUNT(*) FROM guests WHERE seat_number IS NOT NULL AND seat_number != ''")->fetchColumn();
$totalUnassigned = (int)$db->query("SELECT COUNT(*) FROM guests WHERE seat_number IS NULL OR seat_number = ''")->fetchColumn();
$totalEmpty = max(0, $CAPACITY - $totalAssigned);

// DETEKSI KURSI DUPLIKAT
$duplicateSeats = $db->query("
    SELECT seat_number, COUNT(*) as total_users, GROUP_CONCAT(nama_lengkap SEPARATOR ', ') as names
    FROM guests 
    WHERE seat_number IS NOT NULL AND seat_number != '' 
    GROUP BY seat_number 
    HAVING total_users > 1
")->fetchAll();

// DAFTAR PESERTA UNTUK TABEL PENEMPATAN
$search = clean($_GET['q'] ?? '');
$sql = "SELECT id, barcode, nama_lengkap, pangkat, matra, instansi, seat_number, room_number FROM guests WHERE 1=1";
$params = [];
if (!empty($search)) {
    $sql .= " AND (nama_lengkap LIKE ? OR nrp LIKE ? OR seat_number LIKE ?)";
    $st = "%$search%";
    $params = [$st, $st, $st];
}
$sql .= " ORDER BY (seat_number IS NULL OR seat_number = '') ASC, seat_number ASC LIMIT 100";
$stmt = $db->prepare($sql);
$stmt->execute($params);
$guests = $stmt->fetchAll();
?>

<div class="space-y-6">
    <?php if (!empty($message)): ?>
    <div class="p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs <?= $msgType === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800' ?>">
        <span><?= $msgType === 'error' ? '⚠️' : '✓' ?> <?= clean($message) ?></span>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-700">✕</button>
    </div>
    <?php endif; ?>

    <!-- WARNING BANNER JIKA ADA KURSI DUPLIKAT -->
    <?php if (!empty($duplicateSeats)): ?>
    <div class="p-5 bg-red-50 border-2 border-red-300 rounded-xl shadow-xs space-y-3">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-red-800 font-bold text-sm">
                <span>⚠️ PERINGATAN AUDIT: Ditemukan <?= count($duplicateSeats) ?> Nomor Kursi Bentrok (Duplikat)!</span>
            </div>
            <form method="POST" action="allocation.php" onsubmit="return confirm('Jalankan deduplikasi otomatis sekarang? Kursi ganda akan dipindahkan ke nomor kosong berikutnya.');">
                <input type="hidden" name="action" value="deduplicate">
                <button type="submit" class="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-2xs">
                    Perbaiki & Deduplikasi Otomatis
                </button>
            </form>
        </div>
        <div class="divide-y divide-red-200 text-xs text-red-700 max-h-40 overflow-y-auto bg-white/70 p-3 rounded-lg border border-red-200">
            <?php foreach ($duplicateSeats as $dup): ?>
            <div class="py-1.5 flex justify-between">
                <span class="font-mono font-bold">Kursi <?= clean($dup['seat_number']) ?> (Dipakai <?= $dup['total_users'] ?> orang):</span>
                <span class="text-red-900 font-medium truncate max-w-md"><?= clean($dup['names']) ?></span>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
    <?php endif; ?>

    <!-- KARTU AUDIT KURSI PLENO -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Kursi Terisi</span>
            <span class="text-2xl font-black text-[#8B0000] block mt-1"><?= $totalAssigned ?></span>
            <span class="text-[11px] text-slate-500">Telah memiliki nomor kursi</span>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Kursi Kosong</span>
            <span class="text-2xl font-black text-emerald-600 block mt-1"><?= $totalEmpty ?></span>
            <span class="text-[11px] text-slate-500">Dari kapasitas <?= $CAPACITY ?> kursi</span>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Peserta Tanpa Kursi</span>
            <span class="text-2xl font-black text-amber-600 block mt-1"><?= $totalUnassigned ?></span>
            <span class="text-[11px] text-slate-500">Perlu dialokasikan</span>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span class="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Status Duplikasi</span>
            <span class="text-2xl font-black block mt-1 <?= empty($duplicateSeats) ? 'text-emerald-600' : 'text-red-600' ?>">
                <?= empty($duplicateSeats) ? 'Aman (0)' : count($duplicateSeats) . ' Bentrok' ?>
            </span>
            <span class="text-[11px] text-slate-500"><?= empty($duplicateSeats) ? 'Satu kursi satu peserta' : 'Ada duplikasi nomor' ?></span>
        </div>
    </div>

    <!-- ACTION CONTROLS -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <form method="GET" action="allocation.php" class="flex gap-2 w-full sm:w-auto">
            <input
                type="text"
                name="q"
                value="<?= clean($search) ?>"
                placeholder="Cari nama atau kursi..."
                class="px-3 py-2 border rounded-lg text-xs w-60 focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            />
            <button type="submit" class="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg">Cari</button>
        </form>

        <div class="flex flex-wrap items-center gap-2">
            <form method="POST" action="allocation.php" onsubmit="return confirm('Jalankan Auto Allocate Kursi untuk peserta yang belum memiliki nomor kursi?');">
                <input type="hidden" name="action" value="auto_assign">
                <button type="submit" class="px-4 py-2 bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold rounded-lg shadow-sm transition">
                    ⚡ Jalankan Auto Allocate Anti-Duplikasi
                </button>
            </form>

            <form method="POST" action="allocation.php" onsubmit="return confirm('PERINGATAN: Seluruh nomor kursi peserta akan dihapus/dikosongkan! Yakin ingin melanjutkan?');">
                <input type="hidden" name="action" value="reset_seats">
                <button type="submit" class="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-bold rounded-lg border border-slate-200 transition">
                    Reset Seluruh Kursi
                </button>
            </form>
        </div>
    </div>

    <!-- TABEL ALOKASI KURSI & WISMA -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                    <tr>
                        <th class="py-3 px-4">Nama & Matra</th>
                        <th class="py-3 px-4">Kesatuan</th>
                        <th class="py-3 px-4">No. Kursi Pleno</th>
                        <th class="py-3 px-4">Kamar Wisma</th>
                        <th class="py-3 px-4 text-right">Aksi Simpan</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($guests)): ?>
                    <tr><td colspan="5" class="py-8 text-center text-slate-400">Belum ada peserta terdaftar.</td></tr>
                    <?php else: foreach ($guests as $g): ?>
                    <tr class="hover:bg-slate-50">
                        <td class="py-3 px-4">
                            <span class="font-bold text-slate-900 block"><?= clean($g['nama_lengkap']) ?></span>
                            <span class="text-[11px] text-slate-400"><?= clean($g['pangkat']) ?> — <?= clean($g['matra']) ?></span>
                        </td>
                        <td class="py-3 px-4 text-slate-600">
                            <?= clean($g['instansi']) ?>
                        </td>
                        <form method="POST" action="allocation.php">
                            <input type="hidden" name="action" value="manual_update">
                            <input type="hidden" name="id" value="<?= $g['id'] ?>">
                            <td class="py-3 px-4">
                                <input
                                    type="text"
                                    name="seat_number"
                                    value="<?= clean($g['seat_number'] ?? '') ?>"
                                    placeholder="e.g. A-12"
                                    class="w-24 px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-[#8B0000] uppercase focus:outline-none focus:ring-1 focus:ring-[#8B0000]"
                                />
                            </td>
                            <td class="py-3 px-4">
                                <input
                                    type="text"
                                    name="room_number"
                                    value="<?= clean($g['room_number'] ?? '') ?>"
                                    placeholder="e.g. Wisma-301"
                                    class="w-32 px-2.5 py-1.5 border border-slate-300 rounded text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#8B0000]"
                                />
                            </td>
                            <td class="py-3 px-4 text-right">
                                <button type="submit" class="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-bold">
                                    Simpan
                                </button>
                            </td>
                        </form>
                    </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/layout_bottom.php'; ?>
