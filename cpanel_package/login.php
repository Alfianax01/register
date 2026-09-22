<?php
require_once __DIR__ . '/config.php';

if (is_logged_in()) {
    header('Location: /admin/dashboard.php');
    exit;
}

$settings = get_site_settings();
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (empty($username) || empty($password)) {
        $error = 'Nama akun dinas dan kata sandi wajib diisi.';
    } else {
        $db = get_db();
        if (!$db) {
            $error = 'Koneksi database gagal. Pastikan database telah di-import di cPanel phpMyAdmin.';
        } else {
            $stmt = $db->prepare("SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user['password_hash'])) {
                $error = 'Kombinasi akun dinas atau kata sandi tidak valid.';
                log_audit('LOGIN_FAILED', "Percobaan gagal untuk username: $username");
            } elseif ($user['is_active'] == 0) {
                $error = 'Akun dinas ini dinonaktifkan oleh administrator. Silakan hubungi Super Admin.';
                log_audit('LOGIN_BLOCKED', "Akun nonaktif: $username");
            } else {
                // Ambil permission role
                $perms = [];
                $roleStmt = $db->prepare("SELECT permissions FROM roles WHERE name = ? LIMIT 1");
                $roleStmt->execute([$user['role']]);
                $roleRow = $roleStmt->fetch();
                if ($roleRow && !empty($roleRow['permissions'])) {
                    $perms = json_decode($roleRow['permissions'], true) ?: [];
                }

                $_SESSION['admin_user'] = [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'nama' => $user['nama'],
                    'role' => $user['role'],
                    'permissions' => $perms
                ];

                log_audit('LOGIN_SUCCESS', "Login berhasil sebagai {$user['role']}");
                header('Location: /admin/dashboard.php');
                exit;
            }
        }
    }
}

$logoSrc = !empty($settings['logo_header']) ? $settings['logo_header'] : '/assets/images/logo-tni-rapim.png';
$bannerStyle = !empty($settings['banner_login']) ? "background-image: url('{$settings['banner_login']}'); background-size: cover; background-position: center;" : "";
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= clean($settings['nama_sistem']) ?> — Masuk Sistem</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .bg-pattern-hex {
            background-image: radial-gradient(rgba(212, 175, 55, 0.15) 1px, transparent 1px), radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
            background-size: 24px 24px;
            background-position: 0 0, 12px 12px;
        }
    </style>
</head>
<body class="min-h-screen bg-[#F5F6F8] flex flex-col justify-between selection:bg-[#8B0000] selection:text-white">

    <!-- 1. HEADER BANNER MERAH MAROON & HEXAGON MILITER (PUSINFOLAHTA) -->
    <header class="relative w-full bg-[#8B0000] text-white overflow-hidden border-b-4 border-[#B8860B] shadow-md" style="<?= $bannerStyle ?>">
        <div class="absolute inset-0 bg-pattern-hex opacity-60 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-[#6B0000]/70 via-[#8B0000]/80 to-[#6B0000]/95 pointer-events-none"></div>

        <div class="relative max-w-5xl mx-auto px-4 py-8 sm:py-10 flex flex-col items-center text-center z-10">
            <!-- Logo TNI di Tengah -->
            <div class="mb-3.5 relative group">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.35)] border-2 border-[#D4AF37] flex items-center justify-center">
                    <img src="<?= htmlspecialchars($logoSrc) ?>" alt="Logo Mabes TNI" class="w-full h-full object-contain">
                </div>
            </div>

            <!-- Teks Lembaga & Portal -->
            <span class="text-xs sm:text-sm font-extrabold text-[#D4AF37] tracking-[0.25em] uppercase drop-shadow-sm mb-1 block">
                TENTARA NASIONAL INDONESIA
            </span>
            <h1 class="text-xl sm:text-3xl font-black text-white tracking-tight uppercase drop-shadow-md">
                <?= clean($settings['nama_sistem']) ?>
            </h1>
            <p class="text-xs sm:text-sm text-red-100/90 font-medium max-w-xl mt-1.5 leading-relaxed">
                <?= clean($settings['subjudul']) ?>
            </p>
        </div>

        <!-- Pita Emas Garis Pembatas -->
        <div class="h-1 w-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B]"></div>
    </header>

    <!-- 2. FORM LOGIN (CARD PUTIH FORMAL MILITER) -->
    <main class="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div class="w-full max-w-md">
            <div class="p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white">
                <div class="text-center pb-5 mb-6 border-b border-[#E5E7EB]">
                    <h2 class="text-lg sm:text-xl font-bold text-[#1F2937] tracking-tight">
                        Selamat Datang di
                    </h2>
                    <span class="text-sm sm:text-base font-extrabold text-[#8B0000] block mt-0.5 uppercase tracking-wide">
                        <?= clean($settings['nama_sistem']) ?>
                    </span>
                    <p class="text-xs text-[#6B7280] mt-1.5">
                        Silakan masukkan akun dinas resmi untuk mengakses sistem.
                    </p>
                </div>

                <?php if (!empty($error)): ?>
                <div class="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <span><?= clean($error) ?></span>
                </div>
                <?php endif; ?>

                <form method="POST" action="login.php" class="space-y-4">
                    <div class="space-y-1.5 text-left">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            Username Akun Dinas
                        </label>
                        <div class="relative">
                            <input
                                type="text"
                                name="username"
                                required
                                placeholder="Masukkan username akun dinas..."
                                class="w-full px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] transition"
                            />
                        </div>
                    </div>

                    <div class="space-y-1.5 text-left">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            Kata Sandi (Password)
                        </label>
                        <div class="relative">
                            <input
                                id="passwordInput"
                                type="password"
                                name="password"
                                required
                                placeholder="Masukkan kata sandi..."
                                class="w-full px-3 pr-10 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] transition"
                            />
                            <button
                                type="button"
                                onclick="togglePassword()"
                                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                <svg id="eyeIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-1">
                        <label class="inline-flex items-center text-xs text-[#4B5563] cursor-pointer select-none">
                            <input
                                type="checkbox"
                                id="showPwCheckbox"
                                onchange="togglePasswordCheckbox()"
                                class="w-3.5 h-3.5 text-[#8B0000] border-gray-300 rounded focus:ring-[#8B0000]"
                            />
                            <span class="ml-2 font-medium">Tampilkan Password</span>
                        </label>
                    </div>

                    <!-- Tombol MASUK SISTEM (#9B6A35 / Hover #7B532A) -->
                    <div class="pt-2">
                        <button
                            type="submit"
                            class="w-full h-11 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase text-white shadow-md transition-colors flex items-center justify-center gap-2"
                            style="background-color: #9B6A35;"
                            onmouseover="this.style.backgroundColor='#7B532A'"
                            onmouseout="this.style.backgroundColor='#9B6A35'"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            <span>MASUK SISTEM</span>
                        </button>
                    </div>
                </form>

                <div class="mt-6 pt-4 border-t border-[#E5E7EB] text-center">
                    <a
                        href="/index.php"
                        class="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#8B0000] transition-colors py-1.5 px-3 rounded-md hover:bg-slate-50"
                    >
                        ← Kembali ke Beranda Registrasi
                    </a>
                </div>
            </div>
        </div>
    </main>

    <!-- 3. FOOTER RESMI KEDINASAN -->
    <footer class="w-full bg-[#1F2937] text-slate-400 text-center py-4 px-4 text-xs border-t border-slate-700/50">
        <div class="max-w-4xl mx-auto space-y-1">
            <p class="font-semibold text-slate-300">
                <?= clean($settings['footer']) ?>
            </p>
            <p class="text-[11px] text-slate-500">
                Sistem Otentikasi Keamanan Berlapis Tingkat Komando. Akses tanpa izin akan ditindaklanjuti sesuai hukum kedinasan militer.
            </p>
        </div>
    </footer>

    <script>
        function togglePassword() {
            const input = document.getElementById('passwordInput');
            const chk = document.getElementById('showPwCheckbox');
            if (input.type === 'password') {
                input.type = 'text';
                chk.checked = true;
            } else {
                input.type = 'password';
                chk.checked = false;
            }
        }
        function togglePasswordCheckbox() {
            const input = document.getElementById('passwordInput');
            const chk = document.getElementById('showPwCheckbox');
            input.type = chk.checked ? 'text' : 'password';
        }
    </script>
</body>
</html>
