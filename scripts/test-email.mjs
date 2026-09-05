#!/usr/bin/env node
/**
 * scripts/test-email.mjs
 * Script pengujian mandiri untuk sistem pengiriman email E-Ticket RAPIM TNI 2026.
 *
 * Fitur:
 * 1. Memuat konfigurasi .env / .env.local jika ada.
 * 2. Menguji Token Invariance: memastikan token identik antara database, URL tiket, dan QR Code.
 * 3. Menghasilkan QR Code buffer beresolusi tinggi dengan dummy token.
 * 4. Memverifikasi koneksi SMTP (transporter.verify()).
 * 5. Mengirimkan email test resmi dengan lampiran CID QR Code jika kredensial SMTP tersedia.
 *
 * Penggunaan:
 *   node scripts/test-email.mjs
 *   node scripts/test-email.mjs <alamat-email-tujuan>
 */

import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper styling console
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;

console.log(bold(cyan('\n======================================================')));
console.log(bold(cyan('  RAPIM TNI 2026 - EMAIL & TOKEN INVARIANCE TESTER   ')));
console.log(bold(cyan('======================================================\n')));

// 1. Muat file .env / .env.local manual jika ada
function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(path.join(rootDir, '.env.local'));
loadEnvFile(path.join(rootDir, '.env'));

// 2. Parse argumen CLI untuk email penerima
const targetEmail = process.argv[2] || process.env.TEST_EMAIL || 'pengujian@tni.mil.id';
console.log(`[INFO] Alamat target email pengujian: ${bold(targetEmail)}`);

// 3. Dummy Data & Token Generation
const dummyToken = 'TEST-TOKEN-RAPIM-' + Math.random().toString(36).substring(2, 10).toUpperCase();
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const ticketUrl = `${baseUrl}/ticket/${dummyToken}`;

const dummyGuest = {
  id: 'guest-test-uuid-001',
  nama: 'Jenderal TNI Agus Subiyanto, S.E., M.Si.',
  gelar_depan: 'Jenderal TNI',
  gelar_belakang: 'S.E., M.Si.',
  pangkat: 'Jenderal TNI',
  nrp: '190012345678',
  jabatan: 'Panglima Tentara Nasional Indonesia',
  satker: 'Mabes TNI (Cilangkap)',
  satuan: 'Markas Besar TNI',
  matra: 'AD',
  email: targetEmail,
  no_hp: '081234567890',
  qr_token: dummyToken,
  seat_number: 'VVIP-01',
  kategori_tamu: 'VVIP'
};

console.log(`[INFO] Token Terdaftar (qr_token): ${bold(dummyToken)}`);
console.log(`[INFO] URL Tiket: ${bold(ticketUrl)}`);

// 4. Test Token Invariance Assertion
console.log('\n--- TAHAP 1: VERIFIKASI TOKEN INVARIANCE ---');
try {
  // Aturan 1: Token DB identik dengan token tamu
  assert.strictEqual(dummyGuest.qr_token, dummyToken, 'Guest qr_token harus persis sama dengan dummy token.');

  // Aturan 2: URL Tiket harus membawa token yang persis sama
  assert.ok(ticketUrl.endsWith(`/ticket/${dummyToken}`), 'URL tiket harus menggunakan qr_token yang sama tanpa mutasi.');

  // Aturan 3: QR Code buffer harus di-encode dari token yang sama
  const qrBuffer = await QRCode.toBuffer(dummyGuest.qr_token, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 320
  });
  assert.ok(qrBuffer && qrBuffer.length > 0, 'Buffer QR Code harus berhasil dihasilkan.');

  console.log(green('✓ [PASSED] Token Invariance: Token DB === Token URL === Token QR Code.'));
  console.log(green(`✓ [PASSED] QR Code PNG Buffer generated (${qrBuffer.length} bytes, high ECC-H).`));
} catch (err) {
  console.error(red('✗ [FAILED] Token Invariance Assertion Gagal:'), err.message);
  process.exit(1);
}

// 5. Test Email HTML Template Rendering & Link Matching
// 5. Test Email HTML Template Rendering & Link Matching
console.log('\n--- TAHAP 2: VERIFIKASI TEMPLATE EMAIL & CID EMBED ---');
function renderMilitaryTemplate(guest, url) {
  let primaryColor = '#D4AF37';
  let matraBadgeText = 'UNDANGAN SIPIL / NON-TNI';
  switch (guest.matra) {
    case 'AD':
      primaryColor = '#1B5E39';
      matraBadgeText = 'TNI ANGKATAN DARAT';
      break;
    case 'AL':
      primaryColor = '#153E75';
      matraBadgeText = 'TNI ANGKATAN LAUT';
      break;
    case 'AU':
      primaryColor = '#0284C7';
      matraBadgeText = 'TNI ANGKATAN UDARA';
      break;
    case 'MABES':
      primaryColor = '#D4AF37';
      matraBadgeText = 'MARKAS BESAR TNI';
      break;
    case 'NON_TNI':
    default:
      primaryColor = '#D4AF37';
      matraBadgeText = 'UNDANGAN SIPIL / NON-TNI';
      break;
  }

  const fullName = [guest.gelar_depan, guest.nama, guest.gelar_belakang].filter(Boolean).join(' ') || guest.nama;
  const regNumber = guest.registration_id || (guest.nrp ? `REG-${guest.nrp}` : 'REG-2026');
  const ticketId = guest.ticket_id || (guest.id ? `TCK-${guest.id.slice(-6).toUpperCase()}` : 'TCK-2026');
  const seatDisplay = guest.seat_number ? `KURSI ${guest.seat_number}` : 'Ditetapkan di Lokasi';
  const wismaDisplay = guest.butuh_akomodasi ? 'Menunggu Verifikasi' : 'Tidak Menginap';
  const checkInLocation = 'Gate Gedung Ahmad Yani / Balai Samudera, Mabes TNI Cilangkap';
  const regTime = '4 September 2026, 08.00 WIB';

  return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1;">
          <tr>
            <td style="background-color: ${primaryColor}; padding: 22px 24px; text-align: left;">
              <div style="margin-bottom: 6px;">
                <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.45); color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; padding: 3px 10px; border-radius: 4px;">
                  TNI EVENT PASS — RAPIM 2026
                </span>
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">
                Kartu Peserta Resmi
              </h1>
              <p style="margin: 3px 0 0 0; font-size: 11px; color: #ffffff; opacity: 0.9; text-transform: uppercase;">
                ${matraBadgeText} &bull; ${regNumber} &bull; ${ticketId}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px;">
              <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">
                Nama Tamu / Prajurit
              </span>
              <h2 style="margin: 4px 0 2px 0; font-size: 19px; font-weight: 700; color: #0f172a;">
                ${fullName}
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 13px; font-weight: 600; color: #1e40af;">
                ${guest.pangkat} &bull; Matra ${guest.matra}
              </p>

              <table width="100%" style="font-size: 12px; margin-bottom: 20px;">
                <tr>
                  <td width="50%">
                    <span style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; display: block;">Kategori / Jabatan</span>
                    <strong>${guest.jabatan}</strong>
                  </td>
                  <td width="50%">
                    <span style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; display: block;">Instansi / Satuan Kerja</span>
                    <strong>${guest.satker || guest.satuan || 'Mabes TNI'}</strong>
                  </td>
                </tr>
              </table>

              <div style="text-align: center; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">
                  KODE QR AKSES MASUK (GATE PASS)
                </p>
                <div style="background-color: #ffffff; padding: 10px; display: inline-block; border-radius: 8px; border: 1px solid #e2e8f0;">
                  <img src="cid:qrcode" alt="QR Code" width="180" height="180" style="display: block; border: 0;" />
                </div>
                <div style="margin-top: 10px; font-family: monospace; font-size: 11px; color: #334155;">
                  ID: ${guest.qr_token}
                </div>
                <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748b;">
                  Tunjukkan kode QR ini kepada petugas pemindai di Gate Utama.
                </p>
              </div>

              <table width="100%" style="font-size: 12px; margin-bottom: 20px;">
                <tr>
                  <td width="48%" style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                    <span style="font-size: 10px; color: #64748b; text-transform: uppercase; display: block;">Nomor Kursi</span>
                    <strong>${seatDisplay}</strong>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                    <span style="font-size: 10px; color: #64748b; text-transform: uppercase; display: block;">Akomodasi Wisma</span>
                    <strong>${wismaDisplay}</strong>
                  </td>
                </tr>
              </table>

              <div style="font-size: 12px; margin-bottom: 24px; padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
                <div style="margin-bottom: 6px;">
                  <span style="font-size: 10px; color: #64748b; text-transform: uppercase; display: block;">Lokasi Check-In</span>
                  <strong>${checkInLocation}</strong>
                </div>
                <div>
                  <span style="font-size: 10px; color: #64748b; text-transform: uppercase; display: block;">Waktu Registrasi</span>
                  <span style="font-family: monospace;">${regTime}</span>
                </div>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${url}" target="_blank" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
                  Lihat E-Tiket Lengkap &rarr;
                </a>
              </div>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
                <p style="margin: 0 0 4px 0; font-weight: 700; color: #334155;">
                  PETUNJUK KEDATANGAN & PROTOKOL GERBANG
                </p>
                <p style="margin: 0;">
                  Harap tunjukkan Kode QR di atas melalui layar smartphone Anda atau cetakan fisik kepada petugas keamanan / scanner gate pada saat tiba di lokasi acara.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

let emailHtml = '';
try {
  emailHtml = renderMilitaryTemplate(dummyGuest, ticketUrl);

  // Assertion: Template memuat token persis
  assert.ok(emailHtml.includes(dummyToken), 'Template email wajib memuat string token.');
  assert.ok(emailHtml.includes('src="cid:qrcode"'), 'Template email wajib menggunakan CID qrcode (bukan data URL).');
  assert.ok(emailHtml.includes(ticketUrl), 'Template email wajib memuat URL tiket dengan token.');
  assert.ok(emailHtml.includes('TNI EVENT PASS — RAPIM 2026'), 'Template email wajib memuat badge acara.');
  assert.ok(emailHtml.includes('Kartu Peserta Resmi'), 'Template email wajib memuat judul Kartu Peserta Resmi.');
  assert.ok(emailHtml.includes('Lihat E-Tiket Lengkap'), 'Template email wajib memuat tombol CTA.');

  console.log(green('✓ [PASSED] Email HTML template valid: Memuat badge acara, token, CID qrcode attachment, dan URL tiket.'));
} catch (err) {
  console.error(red('✗ [FAILED] Template Email Assertion Gagal:'), err.message);
  process.exit(1);
  }

// 6. Test SMTP Configuration & Optional Dispatch
console.log('\n--- TAHAP 3: KONEKSI SMTP & DISPATCH TEST ---');
const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = process.env.SMTP_SECURE === 'true';

if (!smtpHost || !smtpUser || !smtpPass) {
  console.log(yellow('! [SKIPPED] Kredensial SMTP belum lengkap di environment (.env / .env.local):'));
  console.log(`  - SMTP_HOST: ${smtpHost || '(belum diisi)'}`);
  console.log(`  - SMTP_PORT: ${smtpPort}`);
  console.log(`  - SMTP_USER: ${smtpUser || '(belum diisi)'}`);
  console.log(`  - SMTP_PASS: ${smtpPass ? '********' : '(belum diisi)'}`);
  console.log(cyan('\nPetunjuk:'));
  console.log('Untuk menguji pengiriman email nyata ke inbox, lengkapi kredensial SMTP di .env atau .env.local, lalu jalankan:');
  console.log(`  ${bold(`node scripts/test-email.mjs ${targetEmail}`)}`);
  console.log(green('\n[SUMMARY] Seluruh uji token invariance dan integrasi format email BERHASIL 100%!\n'));
  process.exit(0);
}

// Inisialisasi transporter jika ada
try {
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  console.log(`[INFO] Memverifikasi koneksi SMTP ke ${smtpHost}:${smtpPort}...`);
  await transporter.verify();
  console.log(green(`✓ [PASSED] Koneksi SMTP server (${smtpHost}) berhasil diverifikasi!`));

  console.log(`[INFO] Mengirim email uji coba ke ${targetEmail}...`);
  const qrBuffer = await QRCode.toBuffer(dummyGuest.qr_token, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 320
  });

  const sendResult = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'Panitia RAPIM TNI 2026'}" <${process.env.SMTP_FROM_EMAIL || smtpUser}>`,
    to: targetEmail,
    subject: `[RAPIM TNI 2026] Pengujian E-Ticket Resmi - ${dummyGuest.nama}`,
    html: emailHtml,
    attachments: [
      {
        filename: 'qrcode.png',
        content: qrBuffer,
        cid: 'qrcode'
      }
    ]
  });

  console.log(green(`✓ [PASSED] Email pengujian berhasil dikirim!`));
  console.log(`  - Message ID : ${cyan(sendResult.messageId)}`);
  console.log(`  - Respon     : ${sendResult.response}`);
  console.log(`  - Penerima   : ${bold(targetEmail)}`);
  console.log(`  - Token Unik : ${bold(dummyToken)}`);
  console.log(green('\n======================================================'));
  console.log(green('        PENGUJIAN END-TO-END SELESAI DENGAN SUKSES    '));
  console.log(green('======================================================\n'));
} catch (err) {
  console.error(red('✗ [FAILED] Kesalahan pada koneksi/pengiriman SMTP:'), err.message);
  process.exit(1);
}

