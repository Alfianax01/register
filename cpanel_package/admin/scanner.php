<?php
$pageTitle = 'Scan QR Gate Kedatangan';
$pageSubtitle = 'Pemindaian barcode e-ticket tamu menggunakan kamera atau barcode scanner fisik USB';

require_once __DIR__ . '/layout_top.php';
require_permission('SCANNER');
?>

<script src="https://unpkg.com/html5-qrcode"></script>

<div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- SCANNER BOX -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div class="flex items-center gap-2">
                    <span class="p-1.5 rounded-lg bg-red-100 text-[#8B0000] text-sm">📷</span>
                    <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Kamera Pemindai QR</h3>
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-xs font-bold text-slate-500">Pos Gerbang:</label>
                    <select id="gateSelect" class="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-bold bg-slate-50">
                        <option value="Gate Utama Pleno">Gate Utama Pleno</option>
                        <option value="Gate VIP / Pimpinan">Gate VIP / Pimpinan</option>
                        <option value="Gate Barat">Gate Barat</option>
                        <option value="Gate Timur">Gate Timur</option>
                    </select>
                </div>
            </div>

            <!-- Viewfinder Kamera -->
            <div class="relative bg-slate-900 rounded-xl overflow-hidden min-h-[280px] flex items-center justify-center">
                <div id="reader" class="w-full max-w-sm"></div>
                <div id="scannerPlaceholder" class="text-center p-6 text-slate-400 space-y-3">
                    <span class="text-3xl block">📷</span>
                    <p class="text-xs">Klik tombol di bawah untuk menyalakan kamera scanner.</p>
                    <button id="btnStartScan" onclick="startScanner()" class="px-4 py-2 bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-bold rounded-lg shadow-sm">
                        Nyalakan Kamera Scanner
                    </button>
                </div>
            </div>

            <!-- Input Manual / Scanner Barcode USB -->
            <div class="pt-2">
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Input Barcode / Scanner Fisik USB
                </label>
                <div class="flex gap-2">
                    <input
                        type="text"
                        id="manualBarcodeInput"
                        placeholder="Scan atau ketik kode tiket (e.g. RAPIM-2026-XXXX) lalu tekan Enter..."
                        class="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#8B0000] focus:outline-none"
                        onkeydown="if(event.key === 'Enter') handleManualScan()"
                    />
                    <button onclick="handleManualScan()" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg">
                        Check-In
                    </button>
                </div>
            </div>
        </div>

        <!-- HASIL PEMINDAIAN TERAKHIR -->
        <div class="space-y-4">
            <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
                    Hasil Validasi Tiket
                </h3>

                <div id="scanResultBox" class="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-slate-400 text-xs py-10 space-y-2">
                    <span class="text-2xl block">🎫</span>
                    <span>Menunggu tiket di-scan di pos gerbang...</span>
                </div>
            </div>

            <!-- 5 LOG TERAKHIR -->
            <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Arus Kedatangan Baru
                </h3>
                <div id="recentLogsList" class="space-y-2 text-xs divide-y divide-slate-100">
                    <p class="text-slate-400 text-center py-2">Belum ada scan sesi ini.</p>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
let html5QrCode = null;
let isProcessing = false;

function playAudio(isSuccess) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        if (isSuccess) {
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch beep
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else {
            osc.frequency.setValueAtTime(220, ctx.currentTime); // Low pitch error
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        }
    } catch(e) {}
}

function startScanner() {
    document.getElementById('scannerPlaceholder').classList.add('hidden');
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            if (!isProcessing) {
                processScan(decodedText);
            }
        },
        (error) => {}
    ).catch(err => {
        alert("Gagal mengakses kamera: " + err);
        document.getElementById('scannerPlaceholder').classList.remove('hidden');
    });
}

function handleManualScan() {
    const input = document.getElementById('manualBarcodeInput');
    const val = input.value.trim();
    if (val) {
        processScan(val);
        input.value = '';
    }
}

async function processScan(barcode) {
    isProcessing = true;
    const gate = document.getElementById('gateSelect').value;
    const box = document.getElementById('scanResultBox');

    box.innerHTML = `<div class="py-6"><div class="w-6 h-6 border-2 border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div><span class="text-slate-600 font-bold">Memvalidasi tiket ${barcode}...</span></div>`;

    try {
        const res = await fetch('/api.php?action=checkin_scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: barcode, gate: gate })
        });
        const data = await res.json();

        if (data.success) {
            playAudio(true);
            const g = data.guest;
            box.className = "p-5 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-left space-y-3 shadow-xs";
            box.innerHTML = `
                <div class="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <span class="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">✓ CHECK-IN SUKSES</span>
                    <span class="text-[10px] font-mono text-emerald-800 font-bold">${data.timestamp}</span>
                </div>
                <div>
                    <span class="text-sm font-black text-slate-900 block">${g.nama_lengkap}</span>
                    <span class="text-xs text-slate-600 font-semibold">${g.pangkat} (NRP: ${g.nrp})</span>
                    <span class="text-[11px] text-slate-500 block">${g.instansi} - ${g.matra}</span>
                </div>
                <div class="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200 text-center">
                    <div class="p-2 bg-white rounded border border-emerald-300">
                        <span class="text-[9px] font-bold text-slate-400 uppercase block">NO. KURSI</span>
                        <span class="text-sm font-black text-[#8B0000] block">${g.seat_number || 'Belum Ada'}</span>
                    </div>
                    <div class="p-2 bg-white rounded border border-emerald-300">
                        <span class="text-[9px] font-bold text-slate-400 uppercase block">WISMA</span>
                        <span class="text-sm font-black text-slate-800 block">${g.room_number || '-'}</span>
                    </div>
                </div>
            `;
            addRecentLog(g.nama_lengkap, g.nrp, gate, data.timestamp);
        } else if (data.already_checked_in) {
            playAudio(false);
            const g = data.guest;
            box.className = "p-5 rounded-xl border-2 border-amber-500 bg-amber-50 text-left space-y-3 shadow-xs";
            box.innerHTML = `
                <div class="flex items-center justify-between pb-2 border-b border-amber-200">
                    <span class="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]">⚠️ SUDAH CHECK-IN SEBELUMNYA</span>
                </div>
                <div>
                    <span class="text-sm font-black text-slate-900 block">${g.nama_lengkap}</span>
                    <span class="text-xs text-slate-600 font-semibold">${g.pangkat} (NRP: ${g.nrp})</span>
                    <p class="text-[11px] text-amber-800 mt-1 font-medium">Telah presensi pada: <strong>${g.checked_in_at}</strong> di ${g.gate || 'Gate'}</p>
                </div>
            `;
        } else {
            playAudio(false);
            box.className = "p-5 rounded-xl border-2 border-red-500 bg-red-50 text-left space-y-2 shadow-xs";
            box.innerHTML = `
                <div class="pb-1 border-b border-red-200">
                    <span class="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">✕ TIKET TIDAK VALID</span>
                </div>
                <p class="text-xs text-red-800 font-medium">${data.message || 'Data tiket tidak terdaftar di sistem.'}</p>
            `;
        }
    } catch (e) {
        box.className = "p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700";
        box.innerText = "Gagal memproses check in ke server.";
    }

    setTimeout(() => { isProcessing = false; }, 1500);
}

function addRecentLog(name, nrp, gate, time) {
    const list = document.getElementById('recentLogsList');
    if (list.innerText.includes('Belum ada')) list.innerHTML = '';
    const item = document.createElement('div');
    item.className = 'py-1.5 flex justify-between items-center';
    item.innerHTML = `<div><span class="font-bold text-slate-900 block">${name}</span><span class="text-[10px] text-slate-400 font-mono">${nrp} • ${gate}</span></div><span class="text-[10px] font-mono text-emerald-600 font-bold">${time}</span>`;
    list.prepend(item);
}
</script>

<?php require_once __DIR__ . '/layout_bottom.php'; ?>
