<?php
$pageTitle = 'Direktori Data Peserta';
$pageSubtitle = 'Daftar resmi peserta, status akreditasi, nomor kursi sidang pleno, dan kamar wisma';

require_once __DIR__ . '/layout_top.php';
require_permission('GUESTS');

$db = get_db();
$message = '';
$msgType = 'success';

// Handle Add / Edit / Delete POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create') {
        $nama = clean($_POST['nama_lengkap'] ?? '');
        $matra = clean($_POST['matra'] ?? '');
        $pangkat = clean($_POST['pangkat'] ?? '');
        $korps = clean($_POST['korps'] ?? '');
        $nrp = clean($_POST['nrp'] ?? '');
        $jabatan = clean($_POST['jabatan'] ?? '');
        $instansi = clean($_POST['instansi'] ?? '');
        $email = clean($_POST['email'] ?? '');
        $no_hp = clean($_POST['no_hp'] ?? '');
        $kategori = clean($_POST['kategori'] ?? 'Peserta');
        $seat = clean($_POST['seat_number'] ?? '');
        $room = clean($_POST['room_number'] ?? '');

        if (!empty($nama) && !empty($nrp)) {
            $barcode = 'RAPIM-2026-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
            $stmt = $db->prepare("
                INSERT INTO guests (barcode, nama_lengkap, matra, pangkat, korps, nrp, jabatan, instansi, email, no_hp, kategori, seat_number, room_number, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Terdaftar')
            ");
            $stmt->execute([$barcode, $nama, $matra, $pangkat, $korps, $nrp, $jabatan, $instansi, $email, $no_hp, $kategori, $seat, $room]);
            log_audit('ADMIN_ADD_GUEST', "Menambahkan peserta manual: $nama ($nrp)");
            $message = "Peserta $nama berhasil ditambahkan dengan nomor tiket $barcode.";
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            $stmt = $db->prepare("DELETE FROM guests WHERE id = ?");
            $stmt->execute([$id]);
            log_audit('ADMIN_DELETE_GUEST', "Menghapus peserta ID #$id");
            $message = "Data peserta berhasil dihapus.";
        }
    } elseif ($action === 'toggle_status') {
        $id = (int)($_POST['id'] ?? 0);
        $newStatus = clean($_POST['status'] ?? 'Hadir');
        $checkTime = ($newStatus === 'Hadir') ? date('Y-m-d H:i:s') : null;
        $adminName = $currentUser['nama'] ?? 'Admin';

        $stmt = $db->prepare("UPDATE guests SET status = ?, checked_in_at = ?, checked_in_by = ? WHERE id = ?");
        $stmt->execute([$newStatus, $checkTime, $adminName, $id]);
        $message = "Status kehadiran berhasil diperbarui menjadi $newStatus.";
    }
}

// Search & Filter
$search = clean($_GET['q'] ?? '');
$filterMatra = clean($_GET['matra'] ?? '');
$filterStatus = clean($_GET['status'] ?? '');

$sql = "SELECT * FROM guests WHERE 1=1";
$params = [];

if (!empty($search)) {
    $sql .= " AND (nama_lengkap LIKE ? OR nrp LIKE ? OR barcode LIKE ? OR instansi LIKE ?)";
    $st = "%$search%";
    $params = array_merge($params, [$st, $st, $st, $st]);
}
if (!empty($filterMatra)) {
    $sql .= " AND matra = ?";
    $params[] = $filterMatra;
}
if (!empty($filterStatus)) {
    $sql .= " AND status = ?";
    $params[] = $filterStatus;
}

$sql .= " ORDER BY id DESC LIMIT 200";
$stmt = $db->prepare($sql);
$stmt->execute($params);
$guests = $stmt->fetchAll();
?>

<div class="space-y-6">
    <?php if (!empty($message)): ?>
    <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
        <span>✓ <?= clean($message) ?></span>
        <button onclick="this.parentElement.remove()" class="text-emerald-500 hover:text-emerald-800">✕</button>
    </div>
    <?php endif; ?>

    <!-- TOOLBAR ATAS -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <!-- Form Search & Filter -->
        <form method="GET" action="guests.php" class="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
                type="text"
                name="q"
                value="<?= clean($search) ?>"
                placeholder="Cari Nama, NRP, Barcode..."
                class="px-3 py-2 border border-slate-300 rounded-lg text-xs w-full sm:w-60 focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
            />
            <select name="matra" class="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none">
                <option value="">Semua Matra</option>
                <option value="MABES TNI" <?= $filterMatra === 'MABES TNI' ? 'selected' : '' ?>>MABES TNI</option>
                <option value="TNI AD" <?= $filterMatra === 'TNI AD' ? 'selected' : '' ?>>TNI AD</option>
                <option value="TNI AL" <?= $filterMatra === 'TNI AL' ? 'selected' : '' ?>>TNI AL</option>
                <option value="TNI AU" <?= $filterMatra === 'TNI AU' ? 'selected' : '' ?>>TNI AU</option>
                <option value="POLRI" <?= $filterMatra === 'POLRI' ? 'selected' : '' ?>>POLRI</option>
            </select>
            <select name="status" class="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none">
                <option value="">Semua Status</option>
                <option value="Hadir" <?= $filterStatus === 'Hadir' ? 'selected' : '' ?>>Hadir</option>
                <option value="Terdaftar" <?= $filterStatus === 'Terdaftar' ? 'selected' : '' ?>>Belum Hadir</option>
            </select>
            <button type="submit" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg">
                Filter
            </button>
            <?php if (!empty($search) || !empty($filterMatra) || !empty($filterStatus)): ?>
                <a href="guests.php" class="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200">Reset</a>
            <?php endif; ?>
        </form>

        <!-- Tombol Aksi Tambah & Export -->
        <div class="flex items-center gap-2 w-full md:w-auto justify-end">
            <a href="/api.php?action=export_guests_csv" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 transition">
                <span>📥</span>
                <span>Export CSV</span>
            </a>
            <button onclick="document.getElementById('modalAdd').classList.remove('hidden')" class="px-4 py-2 bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition">
                <span>+</span>
                <span>Tambah Peserta</span>
            </button>
        </div>
    </div>

    <!-- TABEL DIREKTORI PESERTA -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                    <tr>
                        <th class="py-3 px-4">Nama Lengkap & Pangkat</th>
                        <th class="py-3 px-4">NRP / NIP</th>
                        <th class="py-3 px-4">Matra & Satker</th>
                        <th class="py-3 px-4">Kursi Pleno</th>
                        <th class="py-3 px-4">Wisma</th>
                        <th class="py-3 px-4">Status Presensi</th>
                        <th class="py-3 px-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <?php if (empty($guests)): ?>
                    <tr>
                        <td colspan="7" class="py-8 text-center text-slate-400">
                            Tidak ada data peserta yang cocok dengan kriteria pencarian.
                        </td>
                    </tr>
                    <?php else: foreach ($guests as $g): ?>
                    <tr class="hover:bg-slate-50/80 transition">
                        <td class="py-3 px-4">
                            <span class="font-bold text-slate-900 block"><?= clean($g['nama_lengkap']) ?></span>
                            <span class="text-[11px] text-slate-500 block">
                                <?= clean($g['pangkat']) ?> <?= !empty($g['korps']) ? '('.clean($g['korps']).')' : '' ?>
                            </span>
                        </td>
                        <td class="py-3 px-4 font-mono font-semibold text-slate-700">
                            <?= clean($g['nrp']) ?>
                        </td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700">
                                <?= clean($g['matra']) ?>
                            </span>
                            <span class="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[180px]" title="<?= clean($g['instansi']) ?>">
                                <?= clean($g['instansi']) ?>
                            </span>
                        </td>
                        <td class="py-3 px-4 font-mono font-bold text-[#8B0000]">
                            <?= !empty($g['seat_number']) ? clean($g['seat_number']) : '<span class="text-slate-300 font-normal">-</span>' ?>
                        </td>
                        <td class="py-3 px-4 font-medium text-slate-600">
                            <?= !empty($g['room_number']) ? clean($g['room_number']) : '<span class="text-slate-300">-</span>' ?>
                        </td>
                        <td class="py-3 px-4">
                            <form method="POST" action="guests.php" class="inline">
                                <input type="hidden" name="action" value="toggle_status">
                                <input type="hidden" name="id" value="<?= $g['id'] ?>">
                                <input type="hidden" name="status" value="<?= $g['status'] === 'Hadir' ? 'Terdaftar' : 'Hadir' ?>">
                                <button type="submit" class="px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition <?= $g['status'] === 'Hadir' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200' ?>">
                                    <?= $g['status'] === 'Hadir' ? '✓ Hadir' : '● Belum Hadir' ?>
                                </button>
                            </form>
                        </td>
                        <td class="py-3 px-4 text-right space-x-2">
                            <a href="/ticket.php?barcode=<?= urlencode($g['barcode']) ?>" target="_blank" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold">
                                Tiket
                            </a>
                            <form method="POST" action="guests.php" class="inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus data peserta ini?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $g['id'] ?>">
                                <button type="submit" class="text-red-500 hover:text-red-700 text-[11px] font-semibold">
                                    Hapus
                                </button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; endif; ?>
                </tbody>
            </table>
        </div>
        <div class="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Menampilkan <?= count($guests) ?> peserta</span>
        </div>
    </div>
</div>

<!-- MODAL TAMBAH PESERTA MANUAL -->
<div id="modalAdd" class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 class="text-sm font-bold text-slate-900">Tambah Peserta RAPIM Baru</h3>
            <button onclick="document.getElementById('modalAdd').classList.add('hidden')" class="text-slate-400 hover:text-slate-700 text-lg">✕</button>
        </div>

        <form method="POST" action="guests.php" class="space-y-4 text-xs">
            <input type="hidden" name="action" value="create">

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Matra *</label>
                    <select name="matra" required class="w-full px-3 py-2 border rounded-lg">
                        <option value="MABES TNI">MABES TNI</option>
                        <option value="TNI AD">TNI AD</option>
                        <option value="TNI AL">TNI AL</option>
                        <option value="TNI AU">TNI AU</option>
                        <option value="POLRI">POLRI</option>
                    </select>
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Kategori</label>
                    <select name="kategori" class="w-full px-3 py-2 border rounded-lg">
                        <option value="Peserta">Peserta</option>
                        <option value="VIP">VIP</option>
                        <option value="VVIP">VVIP</option>
                        <option value="Panitia">Panitia</option>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Pangkat *</label>
                    <input type="text" name="pangkat" required placeholder="Mayjen TNI / Kolonel" class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Korps</label>
                    <input type="text" name="korps" placeholder="Inf / Kav / Pelaut" class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">NRP / NIP *</label>
                    <input type="text" name="nrp" required placeholder="12345678" class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                    <input type="text" name="nama_lengkap" required placeholder="Nama lengkap..." class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Jabatan</label>
                    <input type="text" name="jabatan" placeholder="Jabatan dinas..." class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Kesatuan / Satker</label>
                    <input type="text" name="instansi" placeholder="Contoh: Kodam Jaya" class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">No. Kursi (Opsional)</label>
                    <input type="text" name="seat_number" placeholder="Contoh: A-10" class="w-full px-3 py-2 border rounded-lg font-mono">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">Kamar Wisma (Opsional)</label>
                    <input type="text" name="room_number" placeholder="Contoh: W-101" class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>

            <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onclick="document.getElementById('modalAdd').classList.add('hidden')" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold">Batal</button>
                <button type="submit" class="px-4 py-2 bg-[#8B0000] text-white rounded-lg font-bold">Simpan Peserta</button>
            </div>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/layout_bottom.php'; ?>
