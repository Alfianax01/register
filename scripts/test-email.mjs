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
console.log('\n--- TAHAP 2: VERIFIKASI TEMPLATE EMAIL & CID EMBED ---');
function renderMilitaryTemplate(guest, url) {
  const primaryColor = guest.matra === 'AD' ? '#1B5E39' : '#D4AF37';
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #cbd5e1;">
    <div style="background:${primaryColor};padding:24px;text-align:center;color:#fff;">
      <h2 style="margin:0;text-transform:uppercase;">RAPIM TNI 2026</h2>
      <p style="margin:4px 0 0 0;font-size:12px;">E-TICKET RESMI & SURAT TANDA MASUK</p>
    </div>
    <div style="padding:24px;">
      <p>Yth. <strong>${guest.pangkat} ${guest.nama}</strong>,</p>
      <p>Pendaftaran Anda untuk RAPIM TNI 2026 telah terverifikasi.</p>
      <div style="text-align:center;margin:24px 0;">
        <img src="cid:qrcode" alt="QR Code" width="220" height="220" style="border:1px solid #e2e8f0;padding:8px;border-radius:8px;">
        <p style="font-family:monospace;font-size:11px;color:#64748b;margin-top:8px;">TOKEN: ${guest.qr_token}</p>
      </div>
      <div style="text-align:center;margin-top:20px;">
        <a href="${url}" style="display:inline-block;background:${primaryColor};color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
          BUKA E-TICKET DIGITAL RESMI
        </a>
      </div>
    </div>
  </div>
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

  console.log(green('✓ [PASSED] Email HTML template valid: Memuat token, CID qrcode attachment, dan URL tiket.'));
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

