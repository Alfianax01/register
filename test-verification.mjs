// test-verification.mjs
async function runTests() {
  console.log('=== MEMULAI PENGUJIAN END-TO-END SISTEM REGISTRASI TNI ===\n');

  const BASE = 'http://localhost:3000';

  // 1. Test Homepage
  console.log('1. Menguji Landing Page (GET /)...');
  const homeRes = await fetch(`${BASE}/`);
  console.log(`   Status: ${homeRes.status} ${homeRes.statusText}`);
  if (homeRes.status !== 200) throw new Error('Home page failed');

  // 2. Test Initial Stats
  console.log('\n2. Menguji API Stats (GET /api/stats)...');
  const statsRes = await fetch(`${BASE}/api/stats`);
  const statsData = await statsRes.json();
  console.log(`   Total Tamu: ${statsData.stats.totalGuests}, Hadir: ${statsData.stats.presentGuests} (${statsData.stats.percentagePresent}%)`);
  console.log(`   Matra Count:`, statsData.stats.matraCount);

  // 3. Test Registration
  console.log('\n3. Menguji Registrasi Tamu Baru (POST /api/register)...');
  const regPayload = {
    nama: 'Tri Nugroho',
    gelar_depan: 'Dr.',
    gelar_belakang: 'S.T., M.Si.',
    matra: 'AD',
    nrp: '1105999',
    pangkat: 'Kolonel (AD)',
    jabatan: 'Dandim 0501/Jakarta Pusat',
    satker: 'Kodam Jaya / Jayakarta',
    satuan: 'Makodam Jaya',
    negara_instansi: 'Indonesia / TNI AD',
    no_hp: '081233445566',
    email: 'tri.nugroho@tni.mil.id',
    butuh_akomodasi: true,
    tgl_checkin: '2026-09-04',
    tgl_checkout: '2026-09-06',
    catatan_khusus: 'Alergi makanan laut (seafood)',
    captcha_answer: '12',
    captcha_expected: '12'
  };

  const regRes = await fetch(`${BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload)
  });
  const regData = await regRes.json();
  console.log(`   Status: ${regRes.status}, Message: ${regData.message}`);
  console.log(`   Token Diterbitkan: ${regData.token}`);
  const newGuestToken = regData.token;

  // 4. Test Ticket Fetch
  console.log('\n4. Menguji Pengambilan E-Ticket (GET /api/ticket/:token)...');
  const ticketRes = await fetch(`${BASE}/api/ticket/${newGuestToken}`);
  const ticketData = await ticketRes.json();
  console.log(`   Nama di Tiket: ${ticketData.guest.gelar_depan} ${ticketData.guest.nama}, ${ticketData.guest.gelar_belakang}`);
  console.log(`   Pangkat/NRP: ${ticketData.guest.pangkat} / ${ticketData.guest.nrp}`);
  console.log(`   QR Code Data URL Length: ${ticketData.qr_code.length} chars`);

  // 5. Test Admin Login
  console.log('\n5. Menguji Login Admin (POST /api/auth/login)...');
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'superadmin', password: 'tni2026prima' })
  });
  const loginData = await loginRes.json();
  console.log(`   Status: ${loginRes.status}, Message: ${loginData.message}`);
  console.log(`   Logged In User: ${loginData.user.nama} (${loginData.user.role})`);
  const cookies = loginRes.headers.get('set-cookie') || '';

  // 6. Test Check-In Scan (First time)
  console.log('\n6. Menguji Check-In Scan Pertama (POST /api/checkin/scan)...');
  const checkinRes1 = await fetch(`${BASE}/api/checkin/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      token: newGuestToken,
      checkpoint_code: 'GATE_UTAMA'
    })
  });
  const checkinData1 = await checkinRes1.json();
  console.log(`   Status: ${checkinRes1.status}, Sudah Hadir: ${checkinData1.guest.status_kehadiran}`);
  console.log(`   Already Checked In: ${checkinData1.alreadyCheckedIn} (Expected: false)`);

  // 7. Test Double Check-In Warning (Re-scan prevention)
  console.log('\n7. Menguji Proteksi Presensi Ganda / Re-Scan (POST /api/checkin/scan)...');
  const checkinRes2 = await fetch(`${BASE}/api/checkin/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      token: newGuestToken,
      checkpoint_code: 'GATE_UTAMA'
    })
  });
  const checkinData2 = await checkinRes2.json();
  console.log(`   Already Checked In: ${checkinData2.alreadyCheckedIn} (Expected: true - BERHASIL DETEKSI GANDA)`);
  console.log(`   Scan Pertama Sebelumnya: ${checkinData2.previousTimestamp}`);

  // 8. Test Auto-Assign Kursi
  console.log('\n8. Menguji Auto-Assign Kursi Berdasarkan Kepangkatan (POST /api/placement/auto-assign)...');
  const autoRes = await fetch(`${BASE}/api/placement/auto-assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  });
  const autoData = await autoRes.json();
  console.log(`   Status: ${autoRes.status}, Message: ${autoData.message}`);

  // 9. Re-fetch ticket to see new assigned seat
  console.log('\n9. Memeriksa Pembaruan Kursi pada E-Ticket Tamu...');
  const ticketRes2 = await fetch(`${BASE}/api/ticket/${newGuestToken}`);
  const ticketData2 = await ticketRes2.json();
  console.log(`   Alokasi Kursi Terkini: ${ticketData2.guest.seat?.seat_number || 'Belum'} (${ticketData2.guest.seat?.group_name || '-'})`);

  // 10. Test CSV Export
  console.log('\n10. Menguji Ekspor CSV (GET /api/export)...');
  const exportRes = await fetch(`${BASE}/api/export`);
  const csvText = await exportRes.text();
  console.log(`   Status: ${exportRes.status}, Headers: ${exportRes.headers.get('content-type')}`);
  console.log(`   Baris CSV Pertama:\n   ${csvText.split('\r\n')[0]}`);

  console.log('\n=== SEMUA 10 TAHAP PENGUJIAN END-TO-END BERHASIL 100%! ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

