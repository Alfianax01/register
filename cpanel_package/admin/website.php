<?php
$pageTitle = 'Management Website & Identitas';
$pageSubtitle = 'Pengaturan tema warna kedinasan, logo, banner login, dan identitas resmi portal';

require_once __DIR__ . '/layout_top.php';
require_permission('CMS');

$db = get_db();
$message = '';
$settings = get_site_settings();

// 5 PRESET TEMA KEDINASAN
$PRESETS = [
    'TNI_MERAH_EMAS' => [
        'name' => 'TNI Merah Emas (PUSINFOLAHTA TNI)',
        'description' => 'Tema komando resmi Mabes TNI & Pusinfolahta dengan nuansa merah maroon dan aksen emas kemilau.',
        'primary_color' => '#8B0000',
        'sidebar_color' => '#6B0000',
        'gold_accent' => '#B8860B',
        'bg_color' => '#F5F6F8'
    ],
    'TNI_HIJAU_AD' => [
        'name' => 'TNI Hijau AD (Kartika Eka Paksi)',
        'description' => 'Nuansa hijau militer Angkatan Darat yang kokoh, tangguh, dan disiplin.',
        'primary_color' => '#1E4D2B',
        'sidebar_color' => '#13351C',
        'gold_accent' => '#C5A059',
        'bg_color' => '#F4F7F4'
    ],
    'TNI_BIRU_AU' => [
        'name' => 'TNI Biru AU (Swa Bhuwana Paksa)',
        'description' => 'Nuansa biru dirgantara Angkatan Udara yang modern, dinamis, dan presisi.',
        'primary_color' => '#0D3B66',
        'sidebar_color' => '#072440',
        'gold_accent' => '#F4D06F',
        'bg_color' => '#F2F6FA'
    ],
    'TNI_ABU_AL' => [
        'name' => 'TNI Abu AL (Jalesveva Jayamahe)',
        'description' => 'Nuansa abu-abu samudra baja Angkatan Laut yang berwibawa dan tangguh.',
        'primary_color' => '#374151',
        'sidebar_color' => '#1F2937',
        'gold_accent' => '#0284C7',
        'bg_color' => '#F3F4F6'
    ],
    'NETRAL_PEMERINTAHAN' => [
        'name' => 'Netral Pemerintahan (K/L)',
        'description' => 'Nuansa formal kementerian dan lembaga negara yang netral dan profesional.',
        'primary_color' => '#0F766E',
        'sidebar_color' => '#134E4A',
        'gold_accent' => '#D97706',
        'bg_color' => '#F8FAFC'
    ]
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newSettings = $settings;

    // Baca input
    foreach ([
        'nama_sistem', 'subjudul', 'footer', 'theme_preset', 
        'primary_color', 'sidebar_color', 'gold_accent', 'bg_color',
        'logo_header', 'logo_sidebar', 'banner_login',
        'label_matra', 'label_pangkat', 'label_korps', 'label_satuan', 'label_jabatan', 'label_kategori'
    ] as $key) {
        if (isset($_POST[$key])) {
            $newSettings[$key] = trim($_POST[$key]);
        }
    }

    $json = json_encode($newSettings, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $stmt = $db->prepare("
        INSERT INTO website_settings (setting_key, setting_value) 
        VALUES ('site_settings', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");
    $stmt->execute([$json]);

    log_audit('UPDATE_SETTINGS', 'Memperbarui tema dan identitas website CMS');
    $message = "Pengaturan website dan skema warna berhasil disimpan secara permanen.";
    $settings = $newSettings;
}
?>

<div class="space-y-6">
    <?php if (!empty($message)): ?>
    <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
        <span>✓ <?= clean($message) ?></span>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-700">✕</button>
    </div>
    <?php endif; ?>

    <form method="POST" action="website.php" class="space-y-6">
        <!-- 5 PRESET TEMA 1-KLIK -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                    <h3 class="text-sm font-bold text-slate-900">Preset Tema Kedinasan (1-Klik Terapkan)</h3>
                    <p class="text-xs text-slate-500">Pilih palet warna resmi institusi militer sesuai kebutuhan acara.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <?php foreach ($PRESETS as $key => $p): 
                    $isCurrent = ($settings['theme_preset'] ?? '') === $key;
                ?>
                <div onclick="applyPreset(<?= json_encode($p) ?>, '<?= $key ?>')" class="cursor-pointer rounded-xl p-4 border-2 transition hover:shadow-md <?= $isCurrent ? 'border-[#8B0000] bg-red-50/20 shadow-xs' : 'border-slate-200 bg-white' ?>">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="w-3.5 h-3.5 rounded-full inline-block" style="background-color: <?= $p['primary_color'] ?>;"></span>
                            <span class="text-xs font-bold text-slate-900"><?= clean($p['name']) ?></span>
                        </div>
                        <?php if ($isCurrent): ?>
                        <span class="text-[10px] font-bold text-white bg-[#8B0000] px-2 py-0.5 rounded-full">Aktif</span>
                        <?php endif; ?>
                    </div>
                    <p class="text-[11px] text-slate-500 mb-3"><?= clean($p['description']) ?></p>
                    <div class="flex gap-1.5 pt-2 border-t border-slate-100">
                        <div class="flex-1 h-5 rounded" style="background-color: <?= $p['primary_color'] ?>;" title="Primary"></div>
                        <div class="flex-1 h-5 rounded" style="background-color: <?= $p['sidebar_color'] ?>;" title="Sidebar"></div>
                        <div class="flex-1 h-5 rounded" style="background-color: <?= $p['gold_accent'] ?>;" title="Gold"></div>
                        <div class="flex-1 h-5 rounded border" style="background-color: <?= $p['bg_color'] ?>;" title="BG"></div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <input type="hidden" name="theme_preset" id="inputThemePreset" value="<?= clean($settings['theme_preset'] ?? 'TNI_MERAH_EMAS') ?>">

        <!-- KUSTOMISASI KODE WARNA HEX -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Kustomisasi Kode Warna Sistem</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Primary Color</label>
                    <div class="flex items-center gap-2">
                        <input type="color" id="picker_primary" value="<?= clean($settings['primary_color']) ?>" onchange="document.getElementById('input_primary').value = this.value" class="w-9 h-9 p-0 border rounded">
                        <input type="text" name="primary_color" id="input_primary" value="<?= clean($settings['primary_color']) ?>" class="flex-1 px-3 py-1.5 border rounded text-xs font-mono uppercase">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Sidebar Color</label>
                    <div class="flex items-center gap-2">
                        <input type="color" id="picker_sidebar" value="<?= clean($settings['sidebar_color']) ?>" onchange="document.getElementById('input_sidebar').value = this.value" class="w-9 h-9 p-0 border rounded">
                        <input type="text" name="sidebar_color" id="input_sidebar" value="<?= clean($settings['sidebar_color']) ?>" class="flex-1 px-3 py-1.5 border rounded text-xs font-mono uppercase">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Gold Accent</label>
                    <div class="flex items-center gap-2">
                        <input type="color" id="picker_gold" value="<?= clean($settings['gold_accent']) ?>" onchange="document.getElementById('input_gold').value = this.value" class="w-9 h-9 p-0 border rounded">
                        <input type="text" name="gold_accent" id="input_gold" value="<?= clean($settings['gold_accent']) ?>" class="flex-1 px-3 py-1.5 border rounded text-xs font-mono uppercase">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Background Color</label>
                    <div class="flex items-center gap-2">
                        <input type="color" id="picker_bg" value="<?= clean($settings['bg_color']) ?>" onchange="document.getElementById('input_bg').value = this.value" class="w-9 h-9 p-0 border rounded">
                        <input type="text" name="bg_color" id="input_bg" value="<?= clean($settings['bg_color']) ?>" class="flex-1 px-3 py-1.5 border rounded text-xs font-mono uppercase">
                    </div>
                </div>
            </div>
        </div>

        <!-- PENGATURAN IDENTITAS RESMI -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Identitas Lembaga & Portal</h3>
            <div class="space-y-4 text-xs">
                <div>
                    <label class="block font-bold text-slate-700 mb-1 uppercase">Nama Sistem / Acara *</label>
                    <input type="text" name="nama_sistem" required value="<?= clean($settings['nama_sistem']) ?>" class="w-full px-3.5 py-2.5 border rounded-lg">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1 uppercase">Subjudul Kedinasan *</label>
                    <input type="text" name="subjudul" required value="<?= clean($settings['subjudul']) ?>" class="w-full px-3.5 py-2.5 border rounded-lg">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1 uppercase">Teks Footer Kedinasan *</label>
                    <textarea name="footer" rows="2" class="w-full px-3.5 py-2.5 border rounded-lg"><?= clean($settings['footer']) ?></textarea>
                </div>
            </div>
        </div>

        <!-- PENGATURAN LOGO & BANNER LOGIN -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">Logo & Banner Halaman Login</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                    <label class="block font-bold text-slate-700 mb-1">URL / Path Logo Header / Login</label>
                    <input type="text" name="logo_header" value="<?= clean($settings['logo_header']) ?>" class="w-full px-3 py-2 border rounded-lg font-mono">
                </div>
                <div>
                    <label class="block font-bold text-slate-700 mb-1">URL / Path Logo Sidebar Panel</label>
                    <input type="text" name="logo_sidebar" value="<?= clean($settings['logo_sidebar']) ?>" class="w-full px-3 py-2 border rounded-lg font-mono">
                </div>
                <div class="sm:col-span-2">
                    <label class="block font-bold text-slate-700 mb-1">URL Banner Header Login (1920x500 px)</label>
                    <input type="text" name="banner_login" value="<?= clean($settings['banner_login']) ?>" placeholder="Biarkan kosong untuk menggunakan background merah maroon & pola hexagon" class="w-full px-3 py-2 border rounded-lg font-mono">
                </div>
            </div>
        </div>

        <!-- TOMBOL SIMPAN -->
        <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span class="text-xs text-slate-500">Perubahan akan langsung aktif secara global setelah disimpan.</span>
            <button type="submit" class="px-6 py-2.5 bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold rounded-lg shadow-sm">
                Simpan Perubahan Website
            </button>
        </div>
    </form>
</div>

<script>
function applyPreset(p, key) {
    document.getElementById('inputThemePreset').value = key;
    document.getElementById('input_primary').value = p.primary_color;
    document.getElementById('picker_primary').value = p.primary_color;

    document.getElementById('input_sidebar').value = p.sidebar_color;
    document.getElementById('picker_sidebar').value = p.sidebar_color;

    document.getElementById('input_gold').value = p.gold_accent;
    document.getElementById('picker_gold').value = p.gold_accent;

    document.getElementById('input_bg').value = p.bg_color;
    document.getElementById('picker_bg').value = p.bg_color;

    alert("Preset '" + p.name + "' telah diterapkan ke formulir. Klik tombol Simpan Perubahan untuk menerapkannya secara permanen.");
}
</script>

<?php require_once __DIR__ . '/layout_bottom.php'; ?>
