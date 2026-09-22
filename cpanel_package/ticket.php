<?php
require_once __DIR__ . '/config.php';

$settings = get_site_settings();
$barcode = clean($_GET['barcode'] ?? $_GET['token'] ?? '');
$guest = null;
$error = '';

if (empty($barcode)) {
    $error = 'Nomor registrasi / barcode tidak valid.';
} else {
    $db = get_db();
    if ($db) {
        $stmt = $db->prepare("SELECT * FROM guests WHERE barcode = ? OR nrp = ? LIMIT 1");
        $stmt->execute([$barcode, $barcode]);
        $guest = $stmt->fetch();
        if (!$guest) {
            $error = 'Data peserta dengan nomor registrasi ini tidak ditemukan di sistem.';
        }
    } else {
        $error = 'Koneksi database bermasalah.';
    }
}

$logoSrc = !empty($settings['logo_header']) ? $settings['logo_header'] : '/assets/images/logo-tni-rapim.png';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Ticket Resmi — <?= $guest ? clean($guest['nama_lengkap']) : 'RAPIM TNI 2026' ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; }
            .print-card { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
    </style>
</head>
<body class="min-h-screen bg-[#F5F6F8] p-4 sm:p-6 flex flex-col items-center justify-center">

    <?php if ($error || !$guest): ?>
    <div class="max-w-md w-full bg-white p-6 rounded-xl border border-red-200 shadow-sm text-center space-y-4">
        <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
        </div>
        <h2 class="text-base font-bold text-slate-800">Tiket Tidak Ditemukan</h2>
        <p class="text-xs text-slate-500"><?= clean($error) ?></p>
        <div class="pt-2 flex gap-2 justify-center">
            <a href="/cari-tiket.php" class="px-4 py-2 bg-[#8B0000] text-white text-xs font-bold rounded-lg">Cari Ulang Tiket</a>
            <a href="/index.php" class="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg">Beranda</a>
        </div>
    </div>
    <?php else: ?>

    <!-- TAMPILAN KARTU TIKET RESMI -->
    <div class="max-w-xl w-full space-y-4">
        <!-- Action Toolbar -->
        <div class="flex items-center justify-between no-print">
            <a href="/index.php" class="text-xs font-semibold text-slate-600 hover:text-[#8B0000]">
                ← Kembali ke Pendaftaran
            </a>
            <button onclick="window.print()" class="px-4 py-2 bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2">
                <span>🖨️ Cetak / Simpan PDF</span>
            </button>
        </div>

        <div class="bg-white rounded-2xl border-2 border-[#D4AF37] shadow-xl overflow-hidden print-card">
            <!-- Header Kartu Merah Maroon -->
            <div class="bg-[#8B0000] text-white p-6 text-center relative border-b-2 border-[#B8860B]">
                <div class="w-16 h-16 bg-white rounded-full p-2 mx-auto mb-2 border-2 border-[#D4AF37] shadow-sm flex items-center justify-center">
                    <img src="<?= htmlspecialchars($logoSrc) ?>" alt="Logo" class="w-full h-full object-contain">
                </div>
                <span class="text-[11px] font-extrabold text-[#D4AF37] tracking-widest uppercase block">
                    TENTARA NASIONAL INDONESIA
                </span>
                <h1 class="text-lg sm:text-xl font-black uppercase tracking-tight mt-0.5">
                    KARTU UNDANGAN & TIKET RESMI
                </h1>
                <p class="text-[11px] text-red-200">
                    <?= clean($settings['nama_sistem']) ?>
                </p>
            </div>

            <div class="p-6 space-y-6">
                <!-- Status Kehadiran Badge -->
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Presensi</span>
                        <span class="text-xs font-bold px-2.5 py-1 rounded-full inline-block mt-0.5 <?= $guest['status'] === 'Hadir' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800' ?>">
                            <?= $guest['status'] === 'Hadir' ? '✓ Sudah Hadir di Lokasi' : '● Terdaftar (Belum Check-In)' ?>
                        </span>
                    </div>
                    <div class="text-right">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Undangan</span>
                        <span class="text-xs font-bold text-[#8B0000] uppercase block">
                            <?= clean($guest['kategori']) ?>
                        </span>
                    </div>
                </div>

                <!-- Informasi Peserta -->
                <div class="space-y-3 text-xs">
                    <div>
                        <span class="text-[10px] text-slate-400 uppercase font-bold block">Nama Lengkap</span>
                        <span class="text-sm font-extrabold text-slate-900 block mt-0.5">
                            <?= clean($guest['nama_lengkap']) ?>
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase font-bold block">Pangkat / Korps</span>
                            <span class="font-bold text-slate-800 block mt-0.5">
                                <?= clean($guest['pangkat']) ?> <?= !empty($guest['korps']) ? '('.clean($guest['korps']).')' : '' ?>
                            </span>
                        </div>
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase font-bold block">NRP / NIP</span>
                            <span class="font-bold text-slate-800 block mt-0.5 font-mono">
                                <?= clean($guest['nrp']) ?>
                            </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase font-bold block">Matra / Instansi</span>
                            <span class="font-bold text-slate-800 block mt-0.5">
                                <?= clean($guest['matra']) ?>
                            </span>
                        </div>
                        <div>
                            <span class="text-[10px] text-slate-400 uppercase font-bold block">Kesatuan / Satker</span>
                            <span class="font-bold text-slate-800 block mt-0.5">
                                <?= clean($guest['instansi']) ?>
                            </span>
                        </div>
                    </div>

                    <div>
                        <span class="text-[10px] text-slate-400 uppercase font-bold block">Jabatan Kedinasan</span>
                        <span class="font-bold text-slate-800 block mt-0.5">
                            <?= clean($guest['jabatan']) ?>
                        </span>
                    </div>
                </div>

                <!-- Blok Penempatan Kursi & Wisma -->
                <div class="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div class="text-center p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        <span class="text-[10px] font-extrabold text-slate-400 uppercase block">NO. KURSI PLENO</span>
                        <span class="text-base font-black text-[#8B0000] block mt-1">
                            <?= !empty($guest['seat_number']) ? clean($guest['seat_number']) : 'Menunggu Alokasi' ?>
                        </span>
                    </div>
                    <div class="text-center p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        <span class="text-[10px] font-extrabold text-slate-400 uppercase block">KAMAR WISMA</span>
                        <span class="text-base font-black text-slate-800 block mt-1">
                            <?= !empty($guest['room_number']) ? clean($guest['room_number']) : 'Tidak Menginap' ?>
                        </span>
                    </div>
                </div>

                <!-- QR CODE SECTION UNTUK SCAN GATE -->
                <div class="text-center space-y-3 pt-2">
                    <div class="inline-block p-3 bg-white rounded-xl border-2 border-slate-300 shadow-inner">
                        <div id="qrcode" class="flex items-center justify-center"></div>
                    </div>
                    <div>
                        <span class="text-xs font-mono font-bold tracking-widest text-slate-700 block uppercase">
                            <?= clean($guest['barcode']) ?>
                        </span>
                        <span class="text-[10px] text-slate-400 block mt-0.5">
                            Tunjukkan QR Code ini kepada Panitia di Pintu Gerbang (Gate) saat tiba di lokasi kegiatan.
                        </span>
                    </div>
                </div>
            </div>

            <!-- Footer Tiket -->
            <div class="bg-slate-100 p-3 text-center border-t border-slate-200 text-[10px] text-slate-500 font-medium">
                <?= clean($settings['footer']) ?>
            </div>
        </div>
    </div>

    <script>
        new QRCode(document.getElementById("qrcode"), {
            text: "<?= addslashes($guest['barcode']) ?>",
            width: 140,
            height: 140,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    </script>
    <?php endif; ?>
</body>
</html>
