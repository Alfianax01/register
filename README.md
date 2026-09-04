# Sistem E-Registrasi & Check-In Acara Resmi TNI (RAPIM TNI 2026)

Sistem informasi digital resmi untuk registrasi prajurit/tamu kehormatan, penerbitan **E-Ticket QR Code**, presensi multi-checkpoint hari-H (kamera live scanner), **manajemen penempatan dinamis** (kursi sidang paripurna & kamar wisma), serta **dashboard analitik real-time** dengan standar keamanan data militer (OWASP).

---

## 🏛️ Desain Visual & Identitas Institusional Militer
Sistem dirancang dengan estetika resmi Mabes TNI dan Tri Matra:
- **TNI Angkatan Darat (AD)**: *Deep Forest Camo & Emerald Green* (`#1B5E39`), Lencana Kartika Eka Paksi.
- **TNI Angkatan Laut (AL)**: *Ocean Deep Navy* (`#153E75`), Lencana Jalesveva Jayamahe.
- **TNI Angkatan Udara (AU)**: *Air Force Steel Blue* (`#1B6B93`), Lencana Swa Bhuwana Paksa.
- **Mabes TNI & Kenegaraan**: *Kuningan Perwira / Gold Brass* (`#D4AF37`), Pita Merah-Putih RI, Tipografi Formal Serif.

---

## 📁 Struktur File & Folder (Rapi & Terpisah)

```text
register/
├── data/
│   └── tni_event.json            # Basis data persisten (tamu, kursi, wisma, log absensi, admin)
├── public/                       # Aset publik
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout dengan Navbar & Footer resmi
│   │   ├── page.tsx              # Landing page megah RAPIM TNI 2026
│   │   ├── globals.css           # Styling tema militer, gold gradient, scanline
│   │   ├── register/
│   │   │   └── page.tsx          # Formulir registrasi publik (4-step guided)
│   │   ├── ticket/
│   │   │   ├── [token]/page.tsx  # ID Card & E-Ticket personal ber-QR Code
│   │   │   └── my-ticket/page.tsx# Pencarian tiket via NRP prajurit
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Shell admin dengan sidebar RBAC & header
│   │   │   ├── login/page.tsx    # Portal login dinas panitia
│   │   │   ├── checkin/page.tsx  # Scanner kamera live + pencarian manual NRP
│   │   │   ├── placement/page.tsx# Denah visual kursi sidang & kamar wisma
│   │   │   ├── monitoring/page.tsx# Dashboard KPI real-time & cetak absensi dinas
│   │   │   └── guests/page.tsx   # Master database direktori seluruh peserta
│   │   └── api/                  # RESTful API Endpoints
│   │       ├── auth/             # Login, logout, cek session token
│   │       ├── checkin/          # Scan QR/NRP, riwayat log kehadiran
│   │       ├── placement/        # Denah kursi, kamar wisma, auto-assign
│   │       ├── guests/           # CRUD data peserta & status presensi
│   │       ├── register/         # Pendaftaran publik ber-rate limit
│   │       ├── stats/            # Statistik KPI & breakdown matra/pangkat
│   │       ├── ticket/[token]/   # Fetch data tiket & generate QR Code
│   │       └── export/           # Unduh berkas Excel (CSV)
│   ├── components/
│   │   ├── ui/                   # Reusable UI: Button, Input, Select, Badge, Card, Modal
│   │   ├── layout/               # Navbar, Footer, AdminSidebar, AdminHeader
│   │   ├── emblems/              # SVG resmi Mabes TNI, AD, AL, AU
│   │   ├── register/             # 4 Langkah form registrasi & captcha anti-bot
│   │   ├── ticket/               # MilitaryIdCard (Lanyard style) & TicketActions
│   │   ├── checkin/              # QrScannerView (kamera + audio chime), GuestVerifyModal, ManualSearchForm
│   │   ├── placement/            # SeatingGridView (visual hall) & WismaGridView (kamar bed A/B)
│   │   └── monitoring/           # StatOverviewCards, MatraCompositionChart, OfficialReportPrint
│   ├── lib/
│   │   ├── constants/            # ranks.ts (pangkat terfilter), units.ts (satker), checkpoints.ts
│   │   ├── db/                   # index.ts (Database manager thread-safe & seed data)
│   │   ├── security/             # auth.ts (HMAC session), tokens.ts (UUIDv4/SHA-256), sanitizer.ts (XSS/NRP)
│   │   └── utils/                # formatters.ts (tanggal Indonesia, badge warna matra)
│   └── types/
│       └── index.ts              # TypeScript interfaces (Guest, Seat, Room, Log, Admin)
```

---

## 🔐 Kredensial Login Panitia (Demo)

| Role | Username | Password | Hak Akses |
|---|---|---|---|
| **Super Admin** | `superadmin` | `tni2026prima` | Akses penuh ke seluruh modul sistem |
| **Panitia Gate** | `panitiagate` | `gatepass2026` | Scanner Check-In & Pencarian Tamu |
| **Panitia Akomodasi** | `panitiawisma` | `wismapass2026` | Penempatan Kamar Wisma Penginapan |

---

## 🚀 Menjalankan Aplikasi

```bash
# 1. Jalankan server pengembangan
npm run dev

# Atau jalankan mode produksi
npm run build
npm start
```

Aplikasi dapat diakses melalui peramban di:
- **Portal Publik**: `http://localhost:3000`
- **Formulir Registrasi**: `http://localhost:3000/register`
- **Cari E-Ticket (NRP)**: `http://localhost:3000/ticket/my-ticket`
- **Portal Admin & Scanner**: `http://localhost:3000/admin/login`

---

## 🛡️ Fitur Keamanan (OWASP Aligned)
1. **Token QR Kriptografis**: Menggunakan UUID v4 acak (bukan NRP mentah atau auto-increment), disimpan dalam bentuk hash SHA-256 di database.
2. **Pencegahan Re-Scan / Double Check-In**: Sistem mendeteksi otomatis jika tamu sudah di-scan di checkpoint yang sama dan memberikan audio alert serta peringatan waktu scan sebelumnya.
3. **Pencegahan SQL Injection & XSS**: Data tersanitasi di sisi server dengan escaping karakter khusus dan pemisahan parameter query.
4. **Proteksi Anti-Bot**: Math captcha terintegrasi pada formulir registrasi.
5. **Rate Limiting**: Pembatasan request IP untuk form pendaftaran dan form login.
6. **Audit Trail**: Seluruh aksi sensitif (login, scan absensi, perubahan kursi/kamar) dicatat ke dalam log audit dengan timestamp dan IP.

