<?php
require_once __DIR__ . '/config.php';

$settings = get_site_settings();
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    if (empty($nama) || empty($matra) || empty($pangkat) || empty($nrp) || empty($jabatan) || empty($instansi)) {
        $error = 'Seluruh kolom bertanda bintang (*) wajib dilengkapi.';
    } else {
        $db = get_db();
        if (!$db) {
            $error = 'Koneksi database bermasalah. Pastikan database telah di-import di phpMyAdmin cPanel.';
        } else {
            // Cek apakah NRP sudah terdaftar sebelumnya
            $stmt = $db->prepare("SELECT barcode FROM guests WHERE nrp = ? LIMIT 1");
            $stmt->execute([$nrp]);
            $existing = $stmt->fetch();

            if ($existing) {
                // Sudah terdaftar, langsung arahkan ke tiketnya
                header("Location: /ticket.php?barcode=" . urlencode($existing['barcode']) . "&notice=already_registered");
                exit;
            }

            // Generate barcode unik RAPIM-2026-XXXX
            $barcode = 'RAPIM-2026-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));

            $insertStmt = $db->prepare("
                INSERT INTO guests 
                (barcode, nama_lengkap, matra, pangkat, korps, nrp, jabatan, instansi, email, no_hp, kategori, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Terdaftar')
            ");

            try {
                $insertStmt->execute([
                    $barcode, $nama, $matra, $pangkat, $korps, $nrp, $jabatan, $instansi, $email, $no_hp, $kategori
                ]);

                log_audit('GUEST_REGISTERED', "Peserta baru terdaftar: $nama ($nrp) - $barcode");
                header("Location: /ticket.php?barcode=" . urlencode($barcode) . "&success=1");
                exit;
            } catch (Exception $e) {
                $error = 'Terjadi kesalahan sistem saat menyimpan pendaftaran. Silakan coba lagi.';
            }
        }
    }
}

$logoSrc = !empty($settings['logo_header']) ? $settings['logo_header'] : '/assets/images/logo-tni-rapim.png';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= clean($settings['nama_sistem']) ?> — Registrasi Kedinasan</title>
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
<body class="min-h-screen bg-[#F5F6F8] text-[#1F2937] flex flex-col justify-between selection:bg-[#8B0000] selection:text-white">

    <!-- HEADER RESMI PUSINFOLAHTA TNI -->
    <header class="relative w-full bg-[#8B0000] text-white overflow-hidden border-b-4 border-[#B8860B] shadow-md">
        <div class="absolute inset-0 bg-pattern-hex opacity-60 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-[#6B0000]/70 via-[#8B0000]/80 to-[#6B0000]/95 pointer-events-none"></div>

        <div class="relative max-w-5xl mx-auto px-4 py-8 sm:py-10 flex flex-col items-center text-center z-10">
            <!-- Logo TNI di Tengah -->
            <div class="mb-3.5 relative group">
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.35)] border-2 border-[#D4AF37] flex items-center justify-center">
                    <img src="<?= htmlspecialchars($logoSrc) ?>" alt="Logo Mabes TNI" class="w-full h-full object-contain">
                </div>
            </div>

            <span class="text-xs sm:text-sm font-extrabold text-[#D4AF37] tracking-[0.25em] uppercase drop-shadow-sm mb-1 block">
                TENTARA NASIONAL INDONESIA
            </span>
            <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase drop-shadow-md">
                <?= clean($settings['nama_sistem']) ?>
            </h1>
            <p class="text-xs sm:text-sm text-red-100/90 font-medium max-w-xl mt-1.5 leading-relaxed">
                <?= clean($settings['subjudul']) ?>
            </p>

            <!-- Menu Tombol Atas -->
            <div class="flex flex-wrap gap-2.5 justify-center mt-5">
                <a href="/cari-tiket.php" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition backdrop-blur-xs">
                    🔍 Cari E-Ticket Saya
                </a>
                <a href="/login.php" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9B6A35] hover:bg-[#7B532A] text-white text-xs font-bold shadow-md transition">
                    🔒 Masuk Portal Panitia
                </a>
            </div>
        </div>

        <div class="h-1 w-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B]"></div>
    </header>

    <!-- FORMULIR PENDAFTARAN -->
    <main class="max-w-4xl mx-auto w-full px-4 py-8">
        <div class="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 sm:p-8">
            <div class="border-b border-[#E5E7EB] pb-4 mb-6">
                <h2 class="text-lg sm:text-xl font-bold text-[#1F2937] flex items-center gap-2">
                    <span class="w-2.5 h-6 bg-[#8B0000] rounded-sm inline-block"></span>
                    <span>Formulir Pendaftaran Resmi Peserta RAPIM</span>
                </h2>
                <p class="text-xs text-[#6B7280] mt-1">
                    Silakan isi data kedinasan Anda secara lengkap dan benar untuk penerbitan E-Ticket dan alokasi kursi pleno.
                </p>
            </div>

            <?php if (!empty($error)): ?>
            <div class="p-3 mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <span><?= clean($error) ?></span>
            </div>
            <?php endif; ?>

            <form method="POST" action="index.php" class="space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <!-- Matra -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            <?= clean($settings['label_matra']) ?> <span class="text-red-500">*</span>
                        </label>
                        <select name="matra" required class="w-full px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]">
                            <option value="">-- Pilih Matra / Satuan Induk --</option>
                            <option value="MABES TNI">MABES TNI</option>
                            <option value="TNI AD">TNI ANGKATAN DARAT</option>
                            <option value="TNI AL">TNI ANGKATAN LAUT</option>
                            <option value="TNI AU">TNI ANGKATAN UDARA</option>
                            <option value="POLRI">KEPOLISIAN RI (POLRI)</option>
                            <option value="KEMHAN / K/L">KEMHAN / KEMENTERIAN / LEMBAGA</option>
                            <option value="TAMU VIP">TAMU KEHORMATAN / VVIP</option>
                        </select>
                    </div>

                    <!-- Kategori Undangan -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            <?= clean($settings['label_kategori']) ?> <span class="text-red-500">*</span>
                        </label>
                        <select name="kategori" required class="w-full px-3 py-2.5 bg-white border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000]">
                            <option value="Peserta">Peserta Sidang Pleno</option>
                            <option value="VIP">Tamu VIP</option>
                            <option value="VVIP">Tamu VVIP / Pimpinan</option>
                            <option value="Peninjau">Peninjau</option>
                            <option value="Panitia">Panitia Pelaksana</option>
                        </select>
                    </div>

                    <!-- Pangkat -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            <?= clean($settings['label_pangkat']) ?> <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="pangkat" required placeholder="Contoh: Jenderal TNI / Mayjen TNI / Kolonel" class="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000]">
                    </div>

                    <!-- Korps -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            <?= clean($settings['label_korps']) ?>
                        </label>
                        <input type="text" name="korps" placeholder="Contoh: Inf / Kav / Pelaut / Tek / Lek" class="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000]">
                    </div>

                    <!-- NRP / NIP -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            NRP / NIP Dinas <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="nrp" required placeholder="Nomor Registrasi Prajurit / NIP" class="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000]">
                    </div>

                    <!-- Nama Lengkap -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            Nama Lengkap & Gelar <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="nama_lengkap" required placeholder="Nama lengkap beserta gelar akademik/militer" class="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000]">
                    </div>

                    <!-- Jabatan -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            <?= clean($settings['label_jabatan']) ?> <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="jabatan" required placeholder="Jabatan kedinasan saat ini" class="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000]">
                    </div>

                    <!-- Kesatuan / Satker -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            <?= clean($settings['label_satuan']) ?> <span class="text-red-500">*</span>
                        </label>
                        <input type="text" name="instansi" required placeholder="Contoh: Kodam Jaya / Koarmada I / Koopsudnas" class="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000]">
                    </div>

                    <!-- No HP / WhatsApp -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            Nomor WhatsApp / Ponsel
                        </label>
                        <input type="text" name="no_hp" placeholder="Contoh: 081234567890" class="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000]">
                    </div>

                    <!-- Email -->
                    <div class="space-y-1.5">
                        <label class="block text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                            Alamat Email Kedinasan
                        </label>
                        <input type="email" name="email" placeholder="Contoh: pejabat@tni.mil.id" class="w-full px-3 py-2.5 border border-[#D1D5DB] rounded-lg text-sm focus:ring-2 focus:ring-[#8B0000]">
                    </div>
                </div>

                <!-- Tombol Submit -->
                <div class="pt-4 border-t border-[#E5E7EB]">
                    <button
                        type="submit"
                        class="w-full sm:w-auto px-8 py-3.5 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase text-white shadow-md transition-colors flex items-center justify-center gap-2"
                        style="background-color: #9B6A35;"
                        onmouseover="this.style.backgroundColor='#7B532A'"
                        onmouseout="this.style.backgroundColor='#9B6A35'"
                    >
                        <span>KIRIM PENDAFTARAN & TERBITKAN E-TICKET</span>
                        <span>→</span>
                    </button>
                </div>
            </form>
        </div>
    </main>

    <!-- FOOTER RESMI KEDINASAN -->
    <footer class="w-full bg-[#1F2937] text-slate-400 text-center py-4 px-4 text-xs border-t border-slate-700/50 mt-12">
        <div class="max-w-4xl mx-auto space-y-1">
            <p class="font-semibold text-slate-300">
                <?= clean($settings['footer']) ?>
            </p>
            <p class="text-[11px] text-slate-500">
                Sistem Registrasi Kedinasan Terintegrasi Tingkat Mabes TNI.
            </p>
        </div>
    </footer>
</body>
</html>
