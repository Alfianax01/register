import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    if (!token) {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 });
    }

    const guest = await db.findGuestByTokenAsync(token);
    if (!guest) {
      console.error("DATA ERROR: Undangan tidak ditemukan untuk token/ID:", token);
      return NextResponse.json({ error: 'Data undangan atau e-ticket tidak ditemukan' }, { status: 404 });
    }

    const isCheckIn = guest.status_kehadiran === 'CHECK_IN' || (guest.status_kehadiran as any) === 'HADIR';

    // 1. Conditional Assignment & Check-In Details
    let assignmentData = null;
    let checkinDetails = null;

    if (isCheckIn) {
      const assignment = db.findAssignmentByGuestId(guest.id);
      if (assignment) {
        assignmentData = assignment;
      } else if (guest.seat_assignment || guest.seat_number) {
        assignmentData = {
          id: `assign_${guest.id}`,
          peserta_id: guest.id,
          seat_code: guest.seat_assignment || guest.seat_number || 'A-01',
          seat_area: 'Area VIP',
          wisma_name: 'Wisma Garuda',
          room_code: 'GAR-101',
          room_floor: 'Lantai 1',
          assigned_at: guest.waktu_kehadiran_pertama || new Date().toISOString()
        };
      }

      const logs = db.getCheckinLogs();
      const log = logs.find(l => l.guest_id === guest.id);

      const waktuFormatted = guest.waktu_kehadiran_pertama
        ? new Date(guest.waktu_kehadiran_pertama).toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) + ' WIB'
        : new Date().toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) + ' WIB';

      checkinDetails = {
        gate: log?.checkpoint_name || 'Gate 1: Pintu Masuk Utama (Absensi Awal)',
        waktu: waktuFormatted,
        petugas: log?.scanned_by_admin_name || 'Gate Scanner 01'
      };
    }

    // 2. Generate high resolution QR Code
    const qrDataUrl = await QRCode.toDataURL(guest.qr_token, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#07160F',
        light: '#FFFFFF'
      }
    });

    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        registration_id: guest.registration_id,
        ticket_id: guest.ticket_id,
        nrp: guest.nrp,
        nama: guest.nama,
        matra: guest.matra,
        pangkat: guest.pangkat,
        jabatan: guest.jabatan,
        satker: guest.satker,
        satuan: guest.satuan,
        negara_instansi: guest.negara_instansi,
        no_hp: guest.no_hp,
        email: guest.email,
        qr_token: guest.qr_token,
        status_kehadiran: isCheckIn ? 'CHECK_IN' : 'REGISTRASI',
        waktu_kehadiran_pertama: isCheckIn ? guest.waktu_kehadiran_pertama : null,
        created_at: guest.created_at,
        // Strictly null when REGISTRASI (Do not leak seat/room data before gate scan)
        assignment: isCheckIn ? assignmentData : null,
        checkin_details: isCheckIn ? checkinDetails : null
      },
      assignment: isCheckIn ? assignmentData : null,
      checkin_details: isCheckIn ? checkinDetails : null,
      qr_code: qrDataUrl
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

  } catch (err: any) {
    console.error("DATA ERROR:", err);
    return NextResponse.json({ error: 'Gagal memuat data e-ticket' }, { status: 500 });
  }
}
