import { Guest, Assignment } from '@/types';

export interface PostCheckInEmailProps {
  guest: Guest;
  assignment: Assignment;
  checkinDetails: {
    gate: string;
    waktu: string;
    petugas: string;
  };
}

export function generatePostCheckInEmailHtml({
  guest,
  assignment,
  checkinDetails
}: PostCheckInEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informasi Penempatan Peserta RAPIM TNI 2026</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f1f5f9; padding: 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background: #1E3A8A; color: #ffffff; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { margin: 6px 0 0; opacity: 0.9; font-size: 13px; }
    .content { padding: 28px 24px; }
    .status-wrapper { text-align: center; margin: 20px 0; }
    .status-badge { display: inline-block; padding: 8px 20px; background: #10B981; color: #ffffff; border-radius: 9999px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; }
    .detail-grid { margin-top: 24px; border-top: 1px solid #e2e8f0; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .detail-label { color: #64748B; font-size: 13px; font-weight: 500; }
    .detail-value { font-weight: 700; color: #0F172A; font-size: 14px; text-align: right; }
    .highlight-notice { margin-top: 24px; padding: 16px; background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; color: #065F46; font-size: 13px; line-height: 1.6; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #94A3B8; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RAPAT PIMPINAN TNI 2026</h1>
      <p>Informasi Penempatan Peserta &amp; Akreditasi</p>
    </div>
    <div class="content">
      <p style="color: #334155; font-size: 14px; margin-top: 0;">
        Yth. <strong>${guest.nama}</strong> (${guest.pangkat || 'Delegasi'}),
      </p>
      <p style="color: #475569; font-size: 13px; line-height: 1.6;">
        Anda telah berhasil melakukan check-in dan verifikasi kehadiran pada RAPIM TNI 2026. Berikut rincian resmi penempatan Anda:
      </p>
      
      <div class="status-wrapper">
        <span class="status-badge">✓ CHECK-IN BERHASIL</span>
      </div>
      
      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">Nomor Kursi Sidang</span>
          <span class="detail-value" style="color: #1E40AF;">${assignment.seat_code} (${assignment.seat_area})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Wisma Akomodasi</span>
          <span class="detail-value">${assignment.wisma_name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Nomor Kamar</span>
          <span class="detail-value">${assignment.room_code} (${assignment.room_floor})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Gate Masuk</span>
          <span class="detail-value">${checkinDetails.gate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Waktu Check-In</span>
          <span class="detail-value">${checkinDetails.waktu}</span>
        </div>
      </div>
      
      <div class="highlight-notice">
        📌 <strong>Perhatian:</strong> Simpan notifikasi ini sebagai bukti akreditasi dan penempatan resmi. Tunjukkan E-Ticket digital Anda saat memasuki ruang sidang pleno dan area wisma akomodasi.
      </div>
    </div>
    <div class="footer">
      Dokumen resmi sistem RAPIM TNI 2026<br>
      &copy; 2026 Tentara Nasional Indonesia &bull; Klasifikasi Terbatas
    </div>
  </div>
</body>
</html>`;
}
