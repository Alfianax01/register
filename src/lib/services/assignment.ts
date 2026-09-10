import { db } from '@/lib/db';
import { Guest, Seat, AccommodationRoom, Assignment } from '@/types';

export interface AssignmentResult {
  success: boolean;
  message?: string;
  guest?: Guest;
  assignment?: Assignment;
  seatNumber?: string;
  wismaAssignment?: string;
}

export class AssignmentService {
  /**
   * Determine seat block according to TNI Rapim 2026 rules:
   * VIP -> A
   * TNI AD -> B
   * TNI AL -> C
   * TNI AU -> D
   * Sipil / Non-TNI / Kementerian -> E
   */
  public static determineSeatBlock(guest: Partial<Guest>): 'A' | 'B' | 'C' | 'D' | 'E' {
    const pLevel = guest.pangkat_level ?? 10;
    const pangkatStr = (guest.pangkat || '').toLowerCase();
    const jabatanStr = (guest.jabatan || '').toLowerCase();
    const matraStr = (guest.matra || '').toUpperCase();

    // 1. VIP -> Blok A
    // - Pangkat level 1-2 (Jenderal TNI, Laksamana, Marsekal, Letjen, Laksdya, Marsdya)
    // - Atau jabatan VVIP/VIP/Panglima/KASAD/KASAL/KASAU/Menteri/Wamen
    // - Atau matra VIP
    const isVip =
      pLevel <= 2 ||
      pangkatStr.includes('jenderal') ||
      pangkatStr.includes('laksamana') ||
      pangkatStr.includes('marsekal') ||
      jabatanStr.includes('panglima') ||
      jabatanStr.includes('kasad') ||
      jabatanStr.includes('kasal') ||
      jabatanStr.includes('kasau') ||
      jabatanStr.includes('menteri') ||
      jabatanStr.includes('vvip') ||
      matraStr === 'VIP';

    if (isVip) return 'A';

    // 2. TNI AD -> Blok B
    if (matraStr === 'AD' || matraStr === 'TNI_AD' || matraStr === 'ANGKATAN_DARAT') {
      return 'B';
    }

    // 3. TNI AL -> Blok C
    if (matraStr === 'AL' || matraStr === 'TNI_AL' || matraStr === 'ANGKATAN_LAUT') {
      return 'C';
    }

    // 4. TNI AU -> Blok D
    if (matraStr === 'AU' || matraStr === 'TNI_AU' || matraStr === 'ANGKATAN_UDARA') {
      return 'D';
    }

    // 5. Sipil / Non-TNI / Kementerian / Mabes non-VIP -> Blok E
    return 'E';
    // 5. Sipil / Kementerian / Mabes / Non-TNI / VIP -> Blok A VIP
    return 'A';
  }

  public static getBlockName(seatBlock: 'A' | 'B' | 'C' | 'D' | 'E' | string): string {
    switch (seatBlock) {
      case 'A': return 'Blok A VIP';
      case 'B': return 'Blok B TNI AD';
      case 'C': return 'Blok C TNI AL';
      case 'D': return 'Blok D TNI AU';
      default: return `Blok ${seatBlock}`;
    }
  }

  /**
   * Get seat area / room description based on seat block
   * Blok A (VIP) -> Area VVIP
   * Blok A (VIP) -> Ruang Sidang Utama (Area VIP)
   * Blok B-E -> Ruang Sidang Utama
   */
  public static getSeatRoom(seatBlock: 'A' | 'B' | 'C' | 'D' | 'E'): string {
    if (seatBlock === 'A') return 'Area VVIP';
    if (seatBlock === 'A') return 'Ruang Sidang Utama (VIP)';
    return 'Ruang Sidang Utama';
  }

  /**
   * Standardize Wisma Display Name
   */
  public static cleanWismaName(rawName: string): string {
    if (!rawName || rawName === 'Tidak Menginap') return 'Tidak Menginap';
    if (rawName.includes('Kartika')) return 'Wisma Kartika';
    if (rawName.includes('Soedirman') || rawName.includes('Sudirman')) return 'Wisma Soedirman';
    if (rawName.includes('Gatot') || rawName.includes('Subroto') || rawName.includes('Mess')) return 'Wisma Gatot Subroto';
    return rawName.replace(/\s*\(.*?\)\s*/g, '').trim();
  }

  /**
   * Allocate Seat automatically on Registration:
   * Finds next available seat in the target block (A, B, C, D, or E)
   * Numbers sequentially: A-01, A-02, ... B-01, B-02, ...
   */
  public static allocateSeat(guest: Partial<Guest>): {
    seatNumber: string;
    seatBlock: 'A' | 'B' | 'C' | 'D' | 'E';
    building: string;
    room: string;
    seatGroupId?: string;
  } {
    const seatBlock = this.determineSeatBlock(guest);
    const building = 'Gedung Ahmad Yani';
    const room = this.getSeatRoom(seatBlock);

    // If guest already has a valid seat in the matching block, retain it
    if (guest.seat_number && guest.seat_number.startsWith(`${seatBlock}-`)) {
      return {
        seatNumber: guest.seat_number,
        seatBlock,
        building,
        room,
        seatGroupId: guest.seat_group_id
      };
    }

    const seats = db.getSeats();

    // Look for first unoccupied, unreserved seat in the target block
    const availableSeat = seats.find(
      s => (s.group_code === seatBlock || s.seat_number.startsWith(`${seatBlock}-`)) &&
           !s.guest_id &&
           !s.peserta_id &&
           !s.is_reserved &&
           s.status !== 'ASSIGNED' &&
           s.status !== 'CHECK_IN'
    );

    if (availableSeat) {
      return {
        seatNumber: availableSeat.seat_number,
        seatBlock,
        building,
        room,
        seatGroupId: availableSeat.group_id
      };
    }

    // If all existing configured seats are occupied, generate next sequential number
    const blockSeats = seats.filter(s => s.seat_number.startsWith(`${seatBlock}-`));
    let maxNum = 0;
    for (const s of blockSeats) {
      const parts = s.seat_number.split('-');
      const n = parseInt(parts[1], 10);
      if (!isNaN(n) && n > maxNum) maxNum = n;
    }

    // Also check guests already in DB for that block
    const guests = db.getGuests();
    for (const g of guests) {
      if (g.seat_number && g.seat_number.startsWith(`${seatBlock}-`)) {
        const parts = g.seat_number.split('-');
        const n = parseInt(parts[1], 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    }

    const nextNum = maxNum + 1;
    const seatNumber = `${seatBlock}-${String(nextNum).padStart(2, '0')}`;

    return {
      seatNumber,
      seatBlock,
      building,
      room,
      seatGroupId: `grp_${seatBlock.toLowerCase()}`
    };
  }

  /**
   * Allocate Accommodation automatically on Registration:
   * If butuh_akomodasi: assigns empty room in Wisma Kartika, Wisma Soedirman, or Wisma Gatot Subroto
   * Generates room_number like '101A', '101B', '102A'
   * If not: 'Tidak Menginap'
   */
  public static allocateAccommodation(guest: Partial<Guest>, wantsAccommodation: boolean): {
    wismaName: string;
    roomNumber: string;
    bedNumber: number;
    roomId?: string;
    roomSlot?: 'A' | 'B';
    roomFloor: string;
    wismaAssignment: string;
  } {
    if (!wantsAccommodation) {
      return {
        wismaName: 'Tidak Menginap',
        roomNumber: '-',
        bedNumber: 0,
        roomFloor: 'Tidak Menginap',
        wismaAssignment: 'Tidak Menginap'
      };
    }

    const rooms = db.getAccommodations();
    const pLevel = guest.pangkat_level ?? 10;

    // Prioritize wisma:
    // VIP (pLevel <= 2) -> Wisma Soedirman
    // Pamen / General -> Wisma Kartika, then Wisma Soedirman, then Wisma Gatot Subroto
    const wismaPreferences = pLevel <= 2
      ? ['Soedirman', 'Kartika', 'Gatot', 'Mess']
      : ['Kartika', 'Soedirman', 'Gatot', 'Mess'];

    let chosenRoom: AccommodationRoom | undefined;
    let chosenSlot: 'A' | 'B' = 'A';

    for (const pref of wismaPreferences) {
      const match = rooms.find(
        r => r.wisma_name.includes(pref) && (!r.slot_a_guest_id || (r.capacity >= 2 && !r.slot_b_guest_id))
      );
      if (match) {
        chosenRoom = match;
        chosenSlot = !match.slot_a_guest_id ? 'A' : 'B';
        break;
      }
    }

    // Fallback: any room with vacancy
    if (!chosenRoom) {
      chosenRoom = rooms.find(
        r => !r.slot_a_guest_id || (r.capacity >= 2 && !r.slot_b_guest_id)
      );
      if (chosenRoom) {
        chosenSlot = !chosenRoom.slot_a_guest_id ? 'A' : 'B';
      }
    }

    if (chosenRoom) {
      const cleanWisma = this.cleanWismaName(chosenRoom.wisma_name);
      const roomNumber = String(chosenRoom.room_number);
      const bedNumber = chosenSlot === 'A' ? 1 : 2;
      const roomFloor = `Lantai ${chosenRoom.floor || 1}`;

      return {
        wismaName: cleanWisma,
        roomNumber,
        bedNumber,
        roomId: chosenRoom.id,
        roomSlot: chosenSlot,
        roomFloor,
        wismaAssignment: `${cleanWisma} - Kamar ${roomNumber} (Bed ${bedNumber})`
      };
    }

    // If all pre-seeded rooms are filled, generate a new room number in Wisma Kartika
    const defaultWisma = pLevel <= 2 ? 'Wisma Soedirman' : 'Wisma Kartika';
    const randRoomNum = String(100 + (Math.floor(Math.random() * 20) + 1));
    const roomNumber = randRoomNum;

    return {
      wismaName: defaultWisma,
      roomNumber,
      bedNumber: 1,
      roomSlot: 'A',
      roomFloor: 'Lantai 1',
      wismaAssignment: `${defaultWisma} - Kamar ${roomNumber} (Bed 1)`
    };
  }

  /**
   * Automatically allocates seat, wisma, and room immediately when guest registers.
   * Persists into assignments collection and updates guest record in database.
   * Status remains 'REGISTRASI', NEVER 'CHECK_IN'.
   */
  public static assignGuestOnRegistration(guestId: string, butuhAkomodasi: boolean = false): AssignmentResult {
    const guest = db.findGuestById(guestId);
    if (!guest) {
      return { success: false, message: 'Data peserta tidak ditemukan' };
    }

    // Check if already assigned
    const existingAssignment = db.findAssignmentByGuestId(guestId);
    if (existingAssignment && guest.seat_number && guest.wisma_name) {
      guest.assignment = existingAssignment;
      return {
        success: true,
        guest,
        assignment: existingAssignment,
        seatNumber: existingAssignment.seat_code,
        wismaAssignment: existingAssignment.wisma_name === 'Tidak Menginap'
          ? 'Tidak Menginap'
          : `${existingAssignment.wisma_name} - ${existingAssignment.room_code}`
      };
    }

    const wantsAccommodation = Boolean(butuhAkomodasi || guest.butuh_akomodasi === 1);

    // 1. ALLOCATE SEAT
    const seatAlloc = this.allocateSeat(guest);

    // Mark seat in DB table
    db.assignSeat(seatAlloc.seatNumber, guest.id);
    const seats = db.getSeats();
    const seatObj = seats.find(s => s.seat_number === seatAlloc.seatNumber);
    if (seatObj) {
      seatObj.guest_status = guest.status_kehadiran === 'CHECK_IN' ? 'CHECK_IN' : 'REGISTRASI';
      seatObj.status = guest.status_kehadiran === 'CHECK_IN' ? 'CHECK_IN' : 'ASSIGNED';
      seatObj.peserta_id = guest.id;
      seatObj.guest_id = guest.id;
      seatObj.guest_name = guest.nama;
      seatObj.guest_rank = guest.pangkat;
      seatObj.guest_matra = guest.matra;
    }

    // 2. ALLOCATE ACCOMMODATION
    const accomAlloc = this.allocateAccommodation(guest, wantsAccommodation);
    if (accomAlloc.roomId && accomAlloc.roomSlot) {
      db.assignRoom(accomAlloc.roomId, accomAlloc.roomSlot, guest.id);
    }

    // 3. CONSTRUCT PERSISTENT ASSIGNMENT
    const seatParts = seatAlloc.seatNumber.split('-');
    const seatRow = seatParts[0] || seatAlloc.seatBlock;
    const seatNum = seatParts[1] || '01';

    const assignment: Assignment = {
      id: `assign_${guest.id}`,
      peserta_id: guest.id,
      seat_code: seatAlloc.seatNumber,
      seat_area: seatAlloc.room,
      gedung: seatAlloc.building,
      building: seatAlloc.building,
      room: seatAlloc.room,
      seat_row: seatRow,
      seat_num: seatNum,
      wisma_name: accomAlloc.wismaName,
      room_code: accomAlloc.roomNumber,
      room_number: accomAlloc.roomNumber,
      bed_number: accomAlloc.bedNumber,
      room_floor: accomAlloc.roomFloor,
      assigned_at: new Date().toISOString()
    };

    db.saveAssignment(assignment);
    guest.assignment = assignment;

    // 4. PERSIST DIRECT FIELDS TO GUEST RECORD
    const updatedGuest = db.updateGuest(guest.id, {
      seat_number: seatAlloc.seatNumber,
      seat_assignment: seatAlloc.seatNumber,
      seat_block: seatAlloc.seatBlock,
      building: seatAlloc.building,
      room: seatAlloc.room,
      seat_group_id: seatAlloc.seatGroupId || `grp_${seatAlloc.seatBlock.toLowerCase()}`,
      wisma_name: accomAlloc.wismaName,
      room_number: accomAlloc.roomNumber,
      bed_number: accomAlloc.bedNumber,
      room_id: accomAlloc.roomId,
      room_slot: accomAlloc.roomSlot,
      wisma_assignment: accomAlloc.wismaAssignment,
      butuh_akomodasi: wantsAccommodation ? 1 : 0,
      assignment
    });

    return {
      success: true,
      guest: updatedGuest || guest,
      assignment,
      seatNumber: seatAlloc.seatNumber,
      wismaAssignment: accomAlloc.wismaAssignment
    };
  }

  /**
   * Check-in is strictly presence verification.
   * This method NEVER regenerates or modifies seat or room assignments!
   * It only marks the assigned seat as CHECK_IN in the seats collection.
   */
  public static assignGuestOnCheckin(guestId: string): AssignmentResult {
    const guest = db.findGuestById(guestId);
    if (!guest) {
      return { success: false, message: 'Data peserta tidak ditemukan' };
    }

    // Read existing assignment
    let existingAssignment = db.findAssignmentByGuestId(guestId);

    // If for some legacy reason guest had no assignment at registration, assign now as safety net
    if (!existingAssignment || !guest.seat_number) {
      const regAssign = this.assignGuestOnRegistration(guestId, Boolean(guest.butuh_akomodasi));
      existingAssignment = regAssign.assignment;
    }

    // Mark seat as checked in
    if (existingAssignment) {
      const seats = db.getSeats();
      const seat = seats.find(s => s.seat_number === existingAssignment.seat_code);
      if (seat) {
        seat.guest_status = 'CHECK_IN';
        seat.status = 'CHECK_IN';
        seat.guest_id = guest.id;
        seat.peserta_id = guest.id;
      }
    }

    return {
      success: true,
      guest,
      assignment: existingAssignment,
      seatNumber: existingAssignment?.seat_code || guest.seat_number,
      wismaAssignment: existingAssignment?.wisma_name === 'Tidak Menginap'
        ? 'Tidak Menginap'
        : `${existingAssignment?.wisma_name} - ${existingAssignment?.room_code}`
    };
  }

  /**
   * Backfill: ensures ALL existing guests in database have full seat and room assignments immediately
   */
  public static ensureAllGuestsAssigned(): { updatedCount: number } {
    const guests = db.getGuests();
    let count = 0;
    for (const g of guests) {
      const existing = db.findAssignmentByGuestId(g.id);
      const isMissingField =
        !existing ||
        !g.seat_number ||
        !g.seat_block ||
        !g.building ||
        !g.room ||
        !g.wisma_name ||
        !g.room_number;

      if (isMissingField) {
        const wantsAccom = g.butuh_akomodasi === 1 || Boolean(g.butuh_akomodasi);
        this.assignGuestOnRegistration(g.id, wantsAccom);
        count++;
      }
    }
    return { updatedCount: count };
  }
}
