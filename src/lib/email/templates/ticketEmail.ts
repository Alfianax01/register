import { Guest } from '@/types';

export interface TicketEmailTemplateProps {
  guest: Guest;
  ticketUrl: string;
}

export function generateTicketEmailHtml({ guest, ticketUrl }: TicketEmailTemplateProps): string {
  // Determine military theme color based on matra
  let primaryColor = '#D4AF37'; // Default Gold for Mabes / Kenegaraan
  let matraBadgeText = 'MABES TNI';

  switch (guest.matra) {
    case 'AD':
      primaryColor = '#1B5E39'; // TNI AD Green
      matraBadgeText = 'TNI ANGKATAN DARAT';
      break;
    case 'AL':
      primaryColor = '#153E75'; // TNI AL Navy Blue
      matraBadgeText = 'TNI ANGKATAN LAUT';
      break;
    case 'AU':
      primaryColor = '#0284C7'; // TNI AU Sky Blue
      matraBadgeText = 'TNI ANGKATAN UDARA';
      break;
    case 'NON_TNI':
      primaryColor = '#334155'; // Slate for Civilians / Guests
      matraBadgeText = 'UNDANGAN KEMENTERIAN / SIPIL';
      break;
    case 'MABES':
    default:
      primaryColor = '#B8860B'; // Gold
      matraBadgeText = 'MARKAS BESAR TNI';
      break;
  }

  const fullName = [guest.gelar_depan, guest.nama, guest.gelar_belakang].filter(Boolean).join(' ') || guest.nama;
  const regNumber = guest.registration_id || (guest.nrp ? `REG-${guest.nrp}` : `REG-${guest.id.slice(-6).toUpperCase()}`);
  const seatDisplay = guest.seat_number ? `KURSI ${guest.seat_number}` : 'Penempatan di Meja Registrasi';

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
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);">
          
          <!-- Military Banner Header -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 28px 24px; text-align: center;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; opacity: 0.9;">
                      MARKAS BESAR TENTARA NASIONAL INDONESIA
                    </p>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">
                      RAPIM TNI TAHUN 2026
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #ffffff; opacity: 0.95;">
                      Surat Tanda Masuk & E-Ticket Resmi Peserta
                    </p>
                    <div style="margin-top: 14px;">
                      <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.4); color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px;">
                        ${matraBadgeText}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 24px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155; line-height: 1.5;">
                Yth. <strong>${guest.pangkat} ${fullName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                Pendaftaran kehadiran Anda pada <strong>Rapat Pimpinan Tentara Nasional Indonesia (RAPIM TNI 2026)</strong> telah berhasil diverifikasi dan tersimpan secara sah dalam basis data protokol.
              </p>

              <!-- Participant Identity Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                      <tr>
                        <td width="35%" style="padding: 6px 0; color: #64748b; font-weight: 500;">Nomor Registrasi</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 700; font-family: monospace;">: ${regNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Nama Lengkap</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">: ${fullName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Pangkat / Korps</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">: ${guest.pangkat}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 500;">NRP / NIP</td>
                        <td style="padding: 6px 0; color: #0f172a; font-family: monospace;">: ${guest.nrp || '-'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Jabatan Kedinasan</td>
                        <td style="padding: 6px 0; color: #0f172a;">: ${guest.jabatan}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Kesatuan / Satker</td>
                        <td style="padding: 6px 0; color: #0f172a;">: ${guest.satuan || guest.satker || guest.negara_instansi}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Alokasi Kursi</td>
                        <td style="padding: 6px 0; color: #1e40af; font-weight: 700;">: ${seatDisplay}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- QR Code Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border: 2px dashed #cbd5e1; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td align="center" style="padding: 24px 16px;">
                    <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #64748b; text-transform: uppercase;">
                      KODE QR AKSES MASUK (GATE PASS)
                    </p>
                    
                    <!-- Inline CID QR Code Image (Gmail & Outlook compatible) -->
                    <div style="background-color: #ffffff; padding: 10px; display: inline-block; border-radius: 8px; border: 1px solid #e2e8f0;">
                      <img src="cid:qrcode" alt="QR Code E-Tiket" width="190" height="190" style="display: block; width: 190px; height: 190px; border: 0;" />
                    </div>

                    <p style="margin: 12px 0 4px 0; font-size: 11px; font-family: monospace; color: #64748b;">
                      TOKEN: ${guest.qr_token}
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                      Tunjukkan kode QR ini kepada petugas pemindai di Gate Utama.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Button CTA to View Full E-Ticket -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${ticketUrl}" target="_blank" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);">
                      Lihat E-Tiket Lengkap & Unduh PDF &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Event Schedule & Location Notice -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 14px 16px; font-size: 12px; color: #1e3a8a; line-height: 1.6;">
                    <strong style="display: block; margin-bottom: 4px; font-size: 13px;">Informasi Pelaksanaan RAPIM TNI 2026:</strong>
                    &bull; <strong>Waktu:</strong> Pukul 07.30 WIB s/d Selesai<br>
                    &bull; <strong>Lokasi:</strong> Gedung Balai Samudera / Gedung Jenderal Besar A.H. Nasution, Mabes TNI Cilangkap<br>
                    &bull; <strong>Pakaian Dinas:</strong> PDU I / PDU IV (sesuai ketentuan dinas matra masing-masing) / PSL (Sipil)
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5; font-style: italic;">
                * Catatan: Tiket elektronik ini bersifat rahasia dan kedinasan. Dilarang memindahtangankan kode QR tiket kepada pihak yang tidak berhak.
              </p>
            </td>
          </tr>

          <!-- Official Military Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
              <p style="margin: 0; font-weight: 600; color: #475569;">
                PANITIA PELAKSANA RAPIM TENTARA NASIONAL INDONESIA 2026
              </p>
              <p style="margin: 4px 0 0 0;">
                Markas Besar TNI, Cilangkap, Jakarta Timur 13870
              </p>
              <p style="margin: 6px 0 0 0; color: #94a3b8;">
                Email ini diterbitkan otomatis oleh Sistem Otomasi Registrasi RAPIM TNI.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

