<?php
$pageTitle = 'User Group & Matriks Hak Akses';
$pageSubtitle = 'Pengaturan peran dinas dan matriks perizinan modul operasional sistem';

require_once __DIR__ . '/layout_top.php';
require_permission('AUTH');

$db = get_db();
$message = '';

$ALL_PERMS = [
    'DASHBOARD' => 'Dashboard Ringkasan & Statistik',
    'GUESTS' => 'Manajemen Data Peserta (Direktori)',
    'SEATS' => 'Alokasi Kursi Pleno & Wisma',
    'SCANNER' => 'Scan Barcode Gate Masuk',
    'MONITORING' => 'Monitoring Presensi Realtime',
    'CMS' => 'Management Website & Tema',
    'AUTH' => 'User Authorization (Akun & Role)',
    'EXPORT_PDF' => 'Unduh Laporan / Tiket PDF',
    'EXPORT_EXCEL' => 'Ekspor Rekapitulasi Excel/CSV'
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'update_perms') {
        $roleId = clean($_POST['role_id'] ?? '');
        $selectedPerms = $_POST['perms'] ?? [];
        $permsJson = json_encode(array_values($selectedPerms));

        $stmt = $db->prepare("UPDATE roles SET permissions = ? WHERE id = ?");
        $stmt->execute([$permsJson, $roleId]);
        log_audit('UPDATE_ROLE_PERMS', "Memperbarui hak akses role ID: $roleId");
        $message = "Matriks hak akses peran berhasil disimpan.";
    } elseif ($action === 'create_role') {
        $name = clean($_POST['name'] ?? '');
        $desc = clean($_POST['description'] ?? '');
        $selectedPerms = $_POST['perms'] ?? [];
        $roleId = 'role_' . strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $name));

        if (!empty($name)) {
            $permsJson = json_encode(array_values($selectedPerms));
            $stmt = $db->prepare("INSERT INTO roles (id, name, description, permissions, is_system) VALUES (?, ?, ?, ?, 0)");
            $stmt->execute([$roleId, $name, $desc, $permsJson]);
            log_audit('CREATE_ROLE', "Membuat peran baru: $name");
            $message = "Peran dinas baru '$name' berhasil dibuat.";
        }
    }
}

$roles = $db->query("SELECT * FROM roles ORDER BY id ASC")->fetchAll();
?>

<div class="space-y-6">
    <?php if (!empty($message)): ?>
    <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
        <span>✓ <?= clean($message) ?></span>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-700">✕</button>
    </div>
    <?php endif; ?>

    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-sm font-bold text-slate-900">Peran Dinas & Matriks Hak Akses (RBAC)</h2>
            <p class="text-xs text-slate-500">Tentukan wewenang modul sistem untuk tiap kelompok tugas panitia.</p>
        </div>
        <button onclick="document.getElementById('modalAddRole').classList.remove('hidden')" class="px-4 py-2 bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold rounded-lg shadow-sm">
            + Tambah Peran Baru
        </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <?php foreach ($roles as $r): 
            $perms = json_decode($r['permissions'], true) ?: [];
        ?>
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-extrabold text-[#8B0000] uppercase"><?= clean($r['name']) ?></span>
                    <?php if ($r['is_system']): ?>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">Bawaan Sistem</span>
                    <?php endif; ?>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed"><?= clean($r['description']) ?></p>

                <div class="pt-3 border-t border-slate-100">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Izin Modul (<?= count($perms) ?>/<?= count($ALL_PERMS) ?>):
                    </span>
                    <div class="flex flex-wrap gap-1.5">
                        <?php foreach ($ALL_PERMS as $code => $label): 
                            $has = in_array($code, $perms);
                        ?>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold <?= $has ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400 opacity-60' ?>">
                            <?= $code ?>
                        </span>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <div class="pt-3 border-t border-slate-100 text-right">
                <button onclick='openEditPerms(<?= json_encode($r) ?>)' class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition">
                    Atur Hak Akses ⚙️
                </button>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</div>

<!-- MODAL EDIT PERMISSIONS -->
<div id="modalEditPerms" class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b">
            <div>
                <h3 id="editRoleName" class="text-sm font-bold text-slate-900"></h3>
                <p class="text-xs text-slate-500">Centang modul yang diizinkan untuk peran ini.</p>
            </div>
            <button onclick="document.getElementById('modalEditPerms').classList.add('hidden')" class="text-slate-400 text-lg">✕</button>
        </div>

        <form method="POST" action="roles.php" class="space-y-3 text-xs">
            <input type="hidden" name="action" value="update_perms">
            <input type="hidden" id="editRoleId" name="role_id" value="">

            <div class="space-y-2" id="permsCheckboxes">
                <?php foreach ($ALL_PERMS as $code => $label): ?>
                <label class="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 border border-slate-200 cursor-pointer">
                    <input type="checkbox" name="perms[]" value="<?= $code ?>" class="mt-0.5 text-[#8B0000] rounded perm-check" id="chk_<?= $code ?>">
                    <div>
                        <span class="font-bold text-slate-800 block"><?= $code ?></span>
                        <span class="text-[11px] text-slate-500"><?= $label ?></span>
                    </div>
                </label>
                <?php endforeach; ?>
            </div>

            <div class="pt-3 border-t flex justify-end gap-2">
                <button type="button" onclick="document.getElementById('modalEditPerms').classList.add('hidden')" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg">Batal</button>
                <button type="submit" class="px-4 py-2 bg-[#8B0000] text-white rounded-lg font-bold">Simpan Matriks</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL TAMBAH ROLE BARU -->
<div id="modalAddRole" class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <h3 class="text-sm font-bold text-slate-900 pb-2 border-b">Tambah Peran Dinas Baru</h3>
        <form method="POST" action="roles.php" class="space-y-3 text-xs">
            <input type="hidden" name="action" value="create_role">
            <div>
                <label class="block font-bold text-slate-700 mb-1">Nama Peran *</label>
                <input type="text" name="name" required placeholder="Contoh: Koordinator Konsumsi" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block font-bold text-slate-700 mb-1">Deskripsi Tugas</label>
                <textarea name="description" rows="2" placeholder="Uraian wewenang peran..." class="w-full px-3 py-2 border rounded-lg"></textarea>
            </div>
            <div class="pt-2 flex justify-end gap-2">
                <button type="button" onclick="document.getElementById('modalAddRole').classList.add('hidden')" class="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg">Batal</button>
                <button type="submit" class="px-4 py-1.5 bg-[#8B0000] text-white rounded-lg font-bold">Simpan Peran</button>
            </div>
        </form>
    </div>
</div>

<script>
function openEditPerms(role) {
    document.getElementById('editRoleId').value = role.id;
    document.getElementById('editRoleName').innerText = "Atur Hak Akses: " + role.name;

    const perms = JSON.parse(role.permissions || '[]');
    document.querySelectorAll('.perm-check').forEach(chk => {
        chk.checked = perms.includes(chk.value);
    });

    document.getElementById('modalEditPerms').classList.remove('hidden');
}
</script>

<?php require_once __DIR__ . '/layout_bottom.php'; ?>
