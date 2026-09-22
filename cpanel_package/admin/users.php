<?php
$pageTitle = 'Manajemen Pengguna & Akun Dinas';
$pageSubtitle = 'Pengelolaan otorisasi akun panitia, reset kata sandi, dan status hak akses sistem';

require_once __DIR__ . '/layout_top.php';
require_permission('AUTH');

$db = get_db();
$message = '';
$msgType = 'success';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // 1. TAMBAH AKUN BARU
    if ($action === 'create') {
        $username = strtolower(trim($_POST['username'] ?? ''));
        $nama = clean($_POST['nama'] ?? '');
        $role = clean($_POST['role'] ?? 'Viewer');
        $password = trim($_POST['password'] ?? '');

        if (!empty($username) && !empty($password) && !empty($nama)) {
            $check = $db->prepare("SELECT id FROM users WHERE username = ? LIMIT 1");
            $check->execute([$username]);
            if ($check->fetch()) {
                $message = "Gagal: Username '$username' sudah terdaftar!";
                $msgType = 'error';
            } else {
                $hash = password_hash($password, PASSWORD_BCRYPT);
                $insert = $db->prepare("INSERT INTO users (username, password_hash, nama, role, is_active) VALUES (?, ?, ?, ?, 1)");
                $insert->execute([$username, $hash, $nama, $role]);
                log_audit('CREATE_USER', "Membuat akun baru: $username ($role)");
                $message = "Akun dinas '$username' berhasil dibuat.";
            }
        }
    }

    // 2. TOGGLE STATUS AKTIF / NONAKTIF
    elseif ($action === 'toggle_active') {
        $id = (int)($_POST['id'] ?? 0);
        $userStmt = $db->prepare("SELECT username, is_active FROM users WHERE id = ?");
        $userStmt->execute([$id]);
        $u = $userStmt->fetch();

        if ($u) {
            if ($u['username'] === 'superadmin') {
                $message = "Akun Super Admin utama tidak dapat dinonaktifkan demi keamanan sistem.";
                $msgType = 'error';
            } else {
                $newStatus = $u['is_active'] ? 0 : 1;
                $up = $db->prepare("UPDATE users SET is_active = ? WHERE id = ?");
                $up->execute([$newStatus, $id]);
                log_audit('TOGGLE_USER_STATUS', "Mengubah status $u[username] menjadi $newStatus");
                $message = "Status akun {$u['username']} berhasil diubah.";
            }
        }
    }

    // 3. RESET PASSWORD
    elseif ($action === 'reset_password') {
        $id = (int)($_POST['id'] ?? 0);
        $newPw = trim($_POST['new_password'] ?? '');

        if (!empty($newPw) && $id > 0) {
            $hash = password_hash($newPw, PASSWORD_BCRYPT);
            $up = $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $up->execute([$hash, $id]);
            log_audit('RESET_PASSWORD', "Reset password akun ID #$id");
            $message = "Kata sandi akun berhasil diperbarui.";
        }
    }

    // 4. HAPUS AKUN
    elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        $userStmt = $db->prepare("SELECT username FROM users WHERE id = ?");
        $userStmt->execute([$id]);
        $u = $userStmt->fetch();

        if ($u && $u['username'] === 'superadmin') {
            $message = "Akun Super Admin utama tidak dapat dihapus.";
            $msgType = 'error';
        } elseif ($u) {
            $del = $db->prepare("DELETE FROM users WHERE id = ?");
            $del->execute([$id]);
            log_audit('DELETE_USER', "Menghapus akun: {$u['username']}");
            $message = "Akun {$u['username']} berhasil dihapus dari sistem.";
        }
    }
}

// Ambil daftar user & daftar role
$users = $db->query("SELECT * FROM users ORDER BY id ASC")->fetchAll();
$roles = $db->query("SELECT name FROM roles ORDER BY id ASC")->fetchAll();
?>

<div class="space-y-6">
    <?php if (!empty($message)): ?>
    <div class="p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs <?= $msgType === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800' ?>">
        <span><?= $msgType === 'error' ? '⚠️' : '✓' ?> <?= clean($message) ?></span>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-700">✕</button>
    </div>
    <?php endif; ?>

    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-sm font-bold text-slate-900">Daftar Akun Pengguna Panel Admin</h2>
            <p class="text-xs text-slate-500">Seluruh akun panitia terenkripsi menggunakan algoritma standar militer (bcrypt).</p>
        </div>
        <button onclick="document.getElementById('modalAddUser').classList.remove('hidden')" class="px-4 py-2 bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5">
            <span>+</span>
            <span>Tambah Akun Dinas</span>
        </button>
    </div>

    <!-- TABEL USERS -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                    <th class="py-3 px-4">Nama Lengkap Petugas</th>
                    <th class="py-3 px-4">Username Akun</th>
                    <th class="py-3 px-4">Peran Dinas (Role)</th>
                    <th class="py-3 px-4">Status Akun</th>
                    <th class="py-3 px-4 text-right">Aksi Manajemen</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
                <?php foreach ($users as $u): ?>
                <tr class="hover:bg-slate-50">
                    <td class="py-3 px-4">
                        <span class="font-bold text-slate-900 block"><?= clean($u['nama']) ?></span>
                        <span class="text-[10px] text-slate-400 font-mono">Dibuat: <?= clean($u['created_at']) ?></span>
                    </td>
                    <td class="py-3 px-4 font-mono font-bold text-slate-700">
                        <?= clean($u['username']) ?>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-[#B8860B] border border-amber-200">
                            <?= clean($u['role']) ?>
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <form method="POST" action="users.php" class="inline">
                            <input type="hidden" name="action" value="toggle_active">
                            <input type="hidden" name="id" value="<?= $u['id'] ?>">
                            <button type="submit" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold <?= $u['is_active'] ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800' ?>">
                                <?= $u['is_active'] ? '● Aktif' : '○ Nonaktif' ?>
                            </button>
                        </form>
                    </td>
                    <td class="py-3 px-4 text-right space-x-2">
                        <button onclick="openResetModal(<?= $u['id'] ?>, '<?= clean($u['username']) ?>')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold">
                            Reset Sandi
                        </button>
                        <?php if ($u['username'] !== 'superadmin'): ?>
                        <form method="POST" action="users.php" class="inline" onsubmit="return confirm('Hapus akun ini secara permanen?');">
                            <input type="hidden" name="action" value="delete">
                            <input type="hidden" name="id" value="<?= $u['id'] ?>">
                            <button type="submit" class="text-red-500 hover:text-red-700 text-[11px] font-semibold">
                                Hapus
                            </button>
                        </form>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<!-- MODAL TAMBAH USER -->
<div id="modalAddUser" class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 class="text-sm font-bold text-slate-900">Tambah Akun Dinas Baru</h3>
            <button onclick="document.getElementById('modalAddUser').classList.add('hidden')" class="text-slate-400 text-lg">✕</button>
        </div>

        <form method="POST" action="users.php" class="space-y-3 text-xs">
            <input type="hidden" name="action" value="create">
            <div>
                <label class="block font-bold text-slate-700 mb-1">Nama Lengkap & Pangkat Petugas *</label>
                <input type="text" name="nama" required placeholder="Contoh: Mayor Chb Hendra" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block font-bold text-slate-700 mb-1">Username Akun Dinas *</label>
                <input type="text" name="username" required placeholder="Contoh: panitia1" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div>
                <label class="block font-bold text-slate-700 mb-1">Peran Dinas (Role) *</label>
                <select name="role" required class="w-full px-3 py-2 border rounded-lg bg-white">
                    <?php foreach ($roles as $r): ?>
                    <option value="<?= clean($r['name']) ?>"><?= clean($r['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div>
                <label class="block font-bold text-slate-700 mb-1">Kata Sandi Awal *</label>
                <input type="password" name="password" required placeholder="••••••••" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button type="button" onclick="document.getElementById('modalAddUser').classList.add('hidden')" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold">Batal</button>
                <button type="submit" class="px-4 py-2 bg-[#8B0000] text-white rounded-lg font-bold">Simpan Akun</button>
            </div>
        </form>
    </div>
</div>

<!-- MODAL RESET PASSWORD -->
<div id="modalResetPw" class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4">
        <h3 class="text-sm font-bold text-slate-900 pb-2 border-b">Reset Kata Sandi Akun</h3>
        <form method="POST" action="users.php" class="space-y-3 text-xs">
            <input type="hidden" name="action" value="reset_password">
            <input type="hidden" id="resetUserId" name="id" value="">
            <div>
                <span id="resetUsernameDisplay" class="font-bold text-slate-700 block mb-2"></span>
                <label class="block font-bold text-slate-700 mb-1">Kata Sandi Baru *</label>
                <input type="password" name="new_password" required placeholder="Masukkan sandi baru..." class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="pt-2 flex justify-end gap-2">
                <button type="button" onclick="document.getElementById('modalResetPw').classList.add('hidden')" class="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg">Batal</button>
                <button type="submit" class="px-4 py-1.5 bg-[#8B0000] text-white rounded-lg font-bold">Simpan Sandi Baru</button>
            </div>
        </form>
    </div>
</div>

<script>
function openResetModal(id, username) {
    document.getElementById('resetUserId').value = id;
    document.getElementById('resetUsernameDisplay').innerText = "Akun: " + username;
    document.getElementById('modalResetPw').classList.remove('hidden');
}
</script>

<?php require_once __DIR__ . '/layout_bottom.php'; ?>
