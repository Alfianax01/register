import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AssignmentService } from '@/lib/services/assignment';
import { canonicalizeStatusKehadiran } from '@/lib/constants/status';
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

    const isCheckIn = canonicalizeStatusKehadiran(guest.status_kehadiran) === 'CHECK_IN';

    // 1. Assignment Data (ALWAYS available for both REGISTRASI and CHECK_IN)
    let assignment = db.findAssignmentByGuestId(guest.id);
    if (!assignment) {
      const assignResult = AssignmentService.assignGuestOnRegistration(guest.id, Boolean(guest.butuh_akomodasi));
      assignment = assignResult.assignment;
    }

    const assignmentData = assignment || {
      id: `assign_${guest.id}`,
      peserta_id: guest.id,
      seat_code: guest.seat_assignment || guest.seat_number || 'A-07',
      seat_area: 'Gedung Ahmad Yani',
      gedung: 'Gedung Ahmad Yani',
      seat_row: 'A',
      seat_num: '07',
      wisma_name: guest.butuh_akomodasi ? 'Wisma Soedirman' : 'Tidak Menginap',
      room_code: guest.butuh_akomodasi ? '103A' : '-',
      room_floor: guest.butuh_akomodasi ? 'Lantai 1' : 'Tidak Menginap',
      assigned_at: new Date().toISOString()
    };

    // 2. Check-In Details (if checked in)
    let checkinDetails = null;
    if (isCheckIn) {
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
      const checkinDateObj = guest.waktu_kehadiran_pertama ? new Date(guest.waktu_kehadiran_pertama) : new Date();
      const checkinTanggal = checkinDateObj.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      const checkinJam = checkinDateObj.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace('.', ':') + ' WIB';

      checkinDetails = {
        gate: log?.checkpoint_name || 'Gate 1 (Pintu Utama)',
        waktu: `${checkinTanggal}, ${checkinJam}`,
        tanggal: checkinTanggal,
        jam: checkinJam,
        petugas: log?.scanned_by_admin_name || 'Petugas Scanner 01'
      };
    }

    // 3. Generate high resolution QR Code
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
        registered_at: (guest as any).registered_at || guest.created_at,
        created_at: guest.created_at,
        seat_number: assignmentData.seat_code,
        seat_assignment: assignmentData.seat_code,
        seat_block: guest.seat_block || assignmentData.seat_row,
        building: assignmentData.gedung || assignmentData.building || 'Gedung Ahmad Yani',
        room: assignmentData.seat_area || assignmentData.room || 'Ruang Sidang Utama',
        wisma_name: assignmentData.wisma_name,
        room_number: assignmentData.room_code,
        bed_number: assignmentData.bed_number,
        wisma_assignment: assignmentData.wisma_name === 'Tidak Menginap'
          ? 'Tidak Menginap'
          : `${assignmentData.wisma_name} - ${assignmentData.room_code}`,
        assignment: assignmentData,
        checkin_details: checkinDetails
      },
      assignment: assignmentData,
      checkin_details: checkinDetails,
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
