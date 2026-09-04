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

    const guest = db.findGuestByToken(token);
    if (!guest) {
      return NextResponse.json({ error: 'Data undangan atau e-ticket tidak ditemukan' }, { status: 404 });
    }

    // Get assigned seat details if any
    let seatInfo = null;
    if (guest.seat_number) {
      const seats = db.getSeats();
      const groups = db.getSeatGroups();
      const seat = seats.find(s => s.seat_number === guest.seat_number);
      const group = groups.find(g => g.id === guest.seat_group_id || g.code === seat?.group_code);
      seatInfo = {
        seat_number: guest.seat_number,
        group_code: group?.code || '-',
        group_name: group?.name || 'Reguler',
        row_num: seat?.row_num || 1,
        col_num: seat?.col_num || 1
      };
    }

    // Get assigned room details if any
    let roomInfo = null;
    if (guest.room_id) {
      const rooms = db.getAccommodations();
      const room = rooms.find(r => r.id === guest.room_id);
      if (room) {
        roomInfo = {
          wisma_name: room.wisma_name,
          floor: room.floor,
          room_number: room.room_number,
          slot: guest.room_slot || 'A',
          notes: room.notes
        };
      }
    }

    // Generate high resolution QR Code with military color scheme (dark green/brass)
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
        nrp: guest.nrp,
        nama: guest.nama,
        gelar_depan: guest.gelar_depan,
        gelar_belakang: guest.gelar_belakang,
        matra: guest.matra,
        pangkat: guest.pangkat,
        jabatan: guest.jabatan,
        satker: guest.satker,
        satuan: guest.satuan,
        negara_instansi: guest.negara_instansi,
        no_hp: guest.no_hp,
        email: guest.email,
        butuh_akomodasi: guest.butuh_akomodasi,
        tgl_checkin: guest.tgl_checkin,
        tgl_checkout: guest.tgl_checkout,
        qr_token: guest.qr_token,
        status_kehadiran: guest.status_kehadiran,
        waktu_kehadiran_pertama: guest.waktu_kehadiran_pertama,
        created_at: guest.created_at,
        seat: seatInfo,
        room: roomInfo
      },
      qr_code: qrDataUrl
    });

  } catch (err: any) {
    console.error('Ticket fetch error:', err);
    return NextResponse.json({ error: 'Gagal memuat data e-ticket' }, { status: 500 });
  }
}
