import { Guest } from '@/types';

export interface TicketEmailTemplateProps {
  guest: Guest;
  ticketUrl: string;
}

export function generateTicketEmailHtml({ guest, ticketUrl }: TicketEmailTemplateProps): string {
  // Determine military theme color based on matra/role:
  // TNI AD -> hijau, TNI AL -> biru tua, TNI AU -> biru muda, Mabes TNI -> emas, K/L -> abu elegan
  let primaryColor = '#1E3A8A';
  let matraBadgeText = 'UNDANGAN K/L (KEMENTERIAN/LEMBAGA)';

  switch (guest.matra) {
    case 'AD':
      primaryColor = '#15803D'; // TNI AD Hijau
      matraBadgeText = 'TNI ANGKATAN DARAT';
      break;
    case 'AL':
      primaryColor = '#1E3A8A'; // TNI AL Biru Tua
      matraBadgeText = 'TNI ANGKATAN LAUT';
      break;
    case 'AU':
      primaryColor = '#0284C7'; // TNI AU Biru Muda
      matraBadgeText = 'TNI ANGKATAN UDARA';
      break;
    case 'MABES':
      primaryColor = '#B45309'; // Mabes TNI Emas
      matraBadgeText = 'MARKAS BESAR TNI';
      break;
    case 'NON_TNI':
    default:
      primaryColor = '#475569'; // Sipil / Kementerian Abu Elegan
      matraBadgeText = 'UNDANGAN SIPIL / NON-TNI';
      primaryColor = '#475569'; // K/L Abu Elegan
      matraBadgeText = 'UNDANGAN K/L (KEMENTERIAN/LEMBAGA)';
      break;
  }

  const fullName = guest.nama;
  const regNumber = guest.registration_id || (guest.nrp ? `REG-${guest.nrp}` : (guest.id ? `REG-${guest.id.slice(-6).toUpperCase()}` : 'REG-2026'));
  const ticketId = guest.ticket_id || (guest.id ? `TCK-${guest.id.slice(-6).toUpperCase()}` : 'TCK-2026');

  // Status nomor kursi & akomodasi wisma (SELALU TAMPIL SEJAK REGISTRASI)
  const seatCode = guest.assignment?.seat_code || guest.seat_number || guest.seat_assignment || 'A-01';
  const gedungDisplay = guest.assignment?.gedung || guest.assignment?.building || guest.building || 'Gedung Ahmad Yani';
  const ruanganDisplay = guest.assignment?.seat_area || guest.assignment?.room || guest.room || 'Ruang Sidang Utama';
  const isTidakMenginap = guest.assignment?.wisma_name === 'Tidak Menginap' || guest.wisma_assignment === 'Tidak Menginap' || (!guest.butuh_akomodasi && !guest.assignment?.wisma_name && !guest.wisma_name);
  const wismaDisplay = isTidakMenginap ? 'Tidak Menginap' : (guest.assignment?.wisma_name || guest.wisma_name || 'Wisma Kartika');
  const kamarDisplay = isTidakMenginap ? '-' : (guest.assignment?.room_code || guest.room_number || '101A');

  // Waktu registrasi
  let regTime = '4 September 2026, 08.00 WIB';
  if (guest.created_at) {
    try {
      regTime = new Date(guest.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';
    } catch (_) {}
  }

  const checkInLocation = 'Gate Gedung Ahmad Yani / Balai Samudera, Mabes TNI Cilangkap';

  return `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>E-Ticket Resmi RAPIM TNI 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container Meniru Kartu Peserta Resmi Web -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);">
          
          <!-- Military Banner Header -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 22px 24px; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <!-- Badge Nama Acara -->
                    <div style="margin-bottom: 6px;">
                      <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.22); border: 1px solid rgba(255, 255, 255, 0.45); color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; padding: 3px 10px; border-radius: 4px;">
                        TNI EVENT PASS — RAPIM 2026
                      </span>
                    </div>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">
                      Kartu Peserta Resmi
                    </h1>
                    <p style="margin: 3px 0 0 0; font-size: 11px; color: #ffffff; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.8px;">
                      ${matraBadgeText}
                    </p>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <div style="background-color: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.35); border-radius: 6px; padding: 6px 12px; text-align: right; display: inline-block;">
                      <div style="font-family: monospace; font-size: 11px; font-weight: 700; color: #ffffff;">
                        ${regNumber}
                      </div>
                      <div style="font-family: monospace; font-size: 10px; color: #ffffff; opacity: 0.85;">
                        ${ticketId}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Participant Identity Section -->
          <tr>
            <td style="padding: 24px 24px 16px 24px; border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
              <span style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; display: block;">
                Nama Tamu / Prajurit
              </span>
              <h2 style="margin: 4px 0 2px 0; font-size: 19px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                ${fullName}
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 13px; font-weight: 600; color: #1e40af;">
                ${guest.pangkat} &bull; ${guest.matra === 'NON_TNI' ? 'Undangan Sipil / Non-TNI' : `Matra ${guest.matra}`}
                ${guest.pangkat} &bull; ${guest.matra === 'NON_TNI' ? 'Undangan K/L (Kementerian/Lembaga)' : `Matra ${guest.matra}`}
              </p>

              <!-- Two Column Details: Jabatan & Instansi -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 8px;">
                    <span style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
                      Kategori / Jabatan
                    </span>
                    <strong style="color: #0f172a; font-size: 12px; display: block; line-height: 1.4;">
                      ${guest.jabatan}
                    </strong>
                    ${guest.nrp ? `<span style="font-family: monospace; font-size: 11px; color: #64748b; display: block; margin-top: 2px;">NRP: ${guest.nrp}</span>` : ''}
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 8px;">
                    <span style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
                      Instansi / Satuan Kerja
                    </span>
                    <strong style="color: #0f172a; font-size: 12px; display: block; line-height: 1.4;">
                      ${guest.negara_instansi || guest.satuan || guest.satker || 'Mabes TNI'}
                    </strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code Center Section (Embedded via CID) -->
          <tr>
            <td style="padding: 24px; background-color: #f8fafc; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #475569; text-transform: uppercase;">
                KODE QR AKSES MASUK (GATE PASS)
              </p>

              <!-- QR Code Card Container -->
              <div style="background-color: #ffffff; padding: 12px; display: inline-block; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                <img src="cid:qrcode" alt="QR Code E-Tiket" width="180" height="180" style="display: block; width: 180px; height: 180px; border: 0;" />
              </div>

              <div style="margin-top: 12px;">
                <span style="display: inline-block; font-family: monospace; font-size: 11px; font-weight: 600; color: #334155; background-color: #ffffff; border: 1px solid #cbd5e1; padding: 4px 12px; border-radius: 4px;">
                  ID: ${guest.qr_token || guest.token}
                </span>
              </div>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
                Tunjukkan kode QR ini kepada petugas pemindai di Gate Utama.
              </p>
            </td>
          </tr>

          <!-- Seating & Wisma Status Grid (Terisi Resmi Sejak Registrasi) -->
          <tr>
            <td style="padding: 18px 24px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0;">
              <!-- Penempatan Tempat Duduk -->
              <div style="margin-bottom: 12px;">
                <span style="font-size: 10px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 6px;">
                  PENEMPATAN TEMPAT DUDUK (TERDAFTAR)
                </span>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <!-- Nomor Kursi -->
                    <td width="32%" style="padding: 10px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; text-align: center; vertical-align: top;">
                      <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
                        Nomor Kursi
                      </span>
                      <strong style="font-size: 15px; font-family: monospace; color: #1e3a8a; display: block;">
                        ${seatCode}
                      </strong>
                    </td>
                    <td width="2%">&nbsp;</td>
                    <!-- Gedung -->
                    <td width="32%" style="padding: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center; vertical-align: top;">
                      <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
                        Gedung
                      </span>
                      <strong style="font-size: 11px; color: #0f172a; display: block;">
                        ${gedungDisplay}
                      </strong>
                    </td>
                    <td width="2%">&nbsp;</td>
                    <!-- Ruangan -->
                    <td width="32%" style="padding: 10px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center; vertical-align: top;">
                      <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
                        Ruangan
                      </span>
                      <strong style="font-size: 11px; color: #0f172a; display: block;">
                        ${ruanganDisplay}
                      </strong>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Akomodasi Penginapan -->
              <div>
                <span style="font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 6px;">
                  AKOMODASI & PENGINAPAN
                </span>
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <!-- Wisma -->
                    <td width="58%" style="padding: 10px 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; vertical-align: middle;">
                      <span style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">
                        Wisma / Mess
                      </span>
                      <strong style="font-size: 12px; color: #0f172a; display: block;">
                        ${wismaDisplay}
                      </strong>
                    </td>
                    <td width="4%">&nbsp;</td>
                    <!-- Kamar -->
                    <td width="38%" style="padding: 10px 12px; background-color: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; text-align: center; vertical-align: middle;">
                      <span style="font-size: 9px; font-weight: 700; color: #4338ca; text-transform: uppercase; display: block; margin-bottom: 2px;">
                        Nomor Kamar
                      </span>
                      <strong style="font-size: 13px; font-family: monospace; color: #312e81; display: block;">
                        ${kamarDisplay}
                      </strong>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Lokasi Check-In & Waktu Registrasi -->
          <tr>
            <td style="padding: 16px 24px; background-color: #ffffff; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <span style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; display: block;">
                      Lokasi Check-In
                    </span>
                    <strong style="color: #0f172a; font-size: 12px; display: block; margin-top: 1px;">
                      ${checkInLocation}
                    </strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 6px; border-top: 1px dashed #e2e8f0;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; display: block;">
                            Waktu Registrasi
                          </span>
                          <span style="font-family: monospace; font-size: 11px; color: #334155;">
                            ${regTime}
                          </span>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px;">
                            RESMI TERDAFTAR
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Button CTA: Lihat E-Tiket Lengkap -->
          <tr>
            <td style="padding: 24px; text-align: center; background-color: #ffffff;">
              <a href="${ticketUrl}" target="_blank" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 13px 30px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.15);">
                Lihat E-Tiket Lengkap &rarr;
              </a>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #64748b;">
                Tautan: <a href="${ticketUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">${ticketUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Official Footer + Instruksi Tunjukkan QR -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">
                PETUNJUK KEDATANGAN & PROTOKOL GERBANG
              </p>
              <p style="margin: 0 0 10px 0; color: #475569; font-size: 11px;">
                Harap tunjukkan Kode QR di atas melalui layar smartphone Anda atau cetakan fisik kepada petugas keamanan / scanner gate pada saat tiba di lokasi acara.
              </p>
              <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8;">
                PANITIA PELAKSANA RAPIM TENTARA NASIONAL INDONESIA 2026<br>
                Markas Besar TNI, Cilangkap, Jakarta Timur 13870
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
