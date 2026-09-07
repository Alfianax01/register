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
   * Determine target seat group code based on military/civilian rank level (1-12)
   * Jenderal TNI -> A-01, Letjen -> A-02, Mayjen -> B-01, Kolonel -> D-01
   */
  public static getTargetSeatGroup(pangkatLevel: number = 10, matra?: string): string {
    if (pangkatLevel === 1) return 'A'; // VVIP Jenderal TNI / Tamu Negara
    if (pangkatLevel === 2) return 'A'; // Letjen / Laksdya / Marsdya (Baris Depan Utama A)
    if (pangkatLevel === 3) return 'B'; // Mayjen / Laksda / Marsda (Baris B)
    if (pangkatLevel === 4) return 'C'; // Brigjen / Laksma / Marsma (Baris C)
    if (pangkatLevel === 5) return 'D'; // Pamen Kolonel (Baris D)
    if (pangkatLevel <= 7) return 'E'; // Pamen Letkol & Mayor (Baris E)
    return 'F';                        // Pama, Tamtama & Delegasi / Sipil (Baris F)
  }

  /**
   * Get seat area label based on rank level
   */
  public static getSeatAreaLabel(pangkatLevel: number = 10): string {
    if (pangkatLevel === 1) return 'Area VVIP';
    if (pangkatLevel <= 3) return 'Area VIP';
    if (pangkatLevel === 4) return 'Area VIP Utama';
    if (pangkatLevel === 5) return 'Area Pamen Kolonel';
    if (pangkatLevel <= 7) return 'Area Pamen';
    return 'Area Delegasi';
  }

  /**
   * Determine target wisma name, room code, and floor based on rank level
   * VVIP/Pati: Wisma Sudirman Kamar 203
   * Pamen: Wisma Kartika Kamar B-101
   * Delegasi: Wisma Garuda / Bahari
   */
  public static getTargetAccommodation(pangkatLevel: number = 10, guestIndex: number = 1): {
    wismaName: string;
    roomCode: string;
    roomFloor: string;
  } {
    const padNum = String((guestIndex % 20) + 101);
    if (pangkatLevel <= 4) {
      return {
        wismaName: 'Wisma Sudirman',
        roomCode: '203',
        roomFloor: 'Lantai 2'
      };
    } else if (pangkatLevel <= 7) {
      return {
        wismaName: 'Wisma Kartika',
        roomCode: 'B-101',
        roomFloor: 'Lantai 1'
      };
    } else {
      return {
        wismaName: 'Wisma Garuda',
        roomCode: padNum,
        roomFloor: 'Lantai 1'
      };
    }
  }

  /**
   * Automatically assigns seat and wisma room when guest checks in.
   * Matra colors are strictly preserved and priority is determined by rank hierarchy.
   * Stores assignment in separate assignments entity with foreign key relation.
   */
  public static assignGuestOnCheckin(guestId: string): AssignmentResult {
    const guest = db.findGuestById(guestId);
    if (!guest) {
      return { success: false, message: 'Data peserta tidak ditemukan' };
    }

    // 0. CHECK IF ALREADY ASSIGNED IN SEPARATE TABLE
    const existingAssignment = db.findAssignmentByGuestId(guestId);
    if (existingAssignment) {
      guest.assignment = existingAssignment;
      return {
        success: true,
        guest,
        assignment: existingAssignment,
        seatNumber: existingAssignment.seat_code,
        wismaAssignment: `${existingAssignment.wisma_name} - ${existingAssignment.room_code}`
      };
    }

    const seats = db.getSeats();
    const rooms = db.getAccommodations();
    const pLevel = guest.pangkat_level || 5;

    // 1. ALLOCATE SEAT
    let seatNumber = guest.seat_number || guest.seat_assignment;
    const seatArea = this.getSeatAreaLabel(pLevel);

    if (!seatNumber) {
      const targetGroup = this.getTargetSeatGroup(pLevel, guest.matra);
      
      // Look for first unoccupied, unreserved seat in target group
      let availableSeat = seats.find(s => s.group_code === targetGroup && !s.guest_id && !s.is_reserved);
      
      // Fallback: any available seat
      if (!availableSeat) {
        availableSeat = seats.find(s => !s.guest_id && !s.is_reserved);
      }

      if (availableSeat) {
        db.assignSeat(availableSeat.seat_number, guest.id);
        seatNumber = availableSeat.seat_number;
        guest.seat_number = seatNumber;
        guest.seat_assignment = seatNumber;
        guest.seat_group_id = availableSeat.group_id;

        availableSeat.guest_status = 'CHECK_IN';
        availableSeat.status = 'CHECK_IN';
      } else {
        // Generative seat number if all existing 40 seats filled
        const prefix = targetGroup;
        const count = seats.filter(s => s.seat_number.startsWith(prefix)).length;
        seatNumber = `${prefix}-${String(count + 1).padStart(2, '0')}`;
        guest.seat_number = seatNumber;
        guest.seat_assignment = seatNumber;
      }
    } else {
      const seat = seats.find(s => s.seat_number === seatNumber);
      if (seat) {
        seat.guest_status = 'CHECK_IN';
        seat.status = 'CHECK_IN';
        seat.guest_id = guest.id;
        seat.peserta_id = guest.id;
        seat.guest_name = guest.nama;
        seat.guest_rank = guest.pangkat;
        seat.guest_matra = guest.matra;
      }
      guest.seat_assignment = seatNumber;
    }

    // 2. ALLOCATE WISMA & ROOM
    const defaultAccom = this.getTargetAccommodation(pLevel, Math.floor(Math.random() * 50) + 1);
    let wismaName = defaultAccom.wismaName;
    let roomCode = defaultAccom.roomCode;
    let roomFloor = defaultAccom.roomFloor;

    // Try linking with DB accommodation room if available
    let availableRoom: AccommodationRoom | undefined = rooms.find(
      r => (!r.slot_a_guest_id || (r.capacity === 2 && !r.slot_b_guest_id))
    );

    if (availableRoom) {
      const slot: 'A' | 'B' = !availableRoom.slot_a_guest_id ? 'A' : 'B';
      db.assignRoom(availableRoom.id, slot, guest.id);
      wismaName = availableRoom.wisma_name;
      roomCode = `${availableRoom.room_number} (${slot})`;
      roomFloor = `Lantai ${availableRoom.floor}`;
      guest.room_id = availableRoom.id;
      guest.room_slot = slot;
    }

    const wismaAssignment = `${wismaName} - ${roomCode} (${roomFloor})`;
    guest.wisma_assignment = wismaAssignment;

    // 3. CREATE PERSISTENT RECORD IN SEPARATE ASSIGNMENTS ENTITY
    const seatParts = (seatNumber || 'A-01').split('-');
    const seatRow = seatParts[0] || 'A';
    const seatNum = seatParts[1] || '01';

    const assignment: Assignment = {
      id: `assign_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      peserta_id: guest.id,
      seat_code: seatNumber || 'A-01',
      seat_area: seatArea,
      gedung: 'Ahmad Yani',
      seat_row: seatRow,
      seat_num: seatNum,
      wisma_name: wismaName,
      room_code: roomCode,
      room_floor: roomFloor,
      assigned_at: new Date().toISOString()
    };

    db.saveAssignment(assignment);
    guest.assignment = assignment;

    // 4. PERSIST GUEST UPDATE
    db.updateGuest(guest.id, {
      seat_number: seatNumber,
      seat_assignment: seatNumber,
      seat_group_id: guest.seat_group_id,
      room_id: guest.room_id,
      room_slot: guest.room_slot,
      wisma_assignment: wismaAssignment,
      assignment
    });

    return {
      success: true,
      guest,
      assignment,
      seatNumber,
      wismaAssignment
    };
  }

  /**
   * Batch auto-assign for all checked-in participants who have missing seat or room
   */
  public static autoAssignAllCheckedIn(): { processedCount: number } {
    const guests = db.getGuests().filter((g: Guest) => g.status_kehadiran === 'CHECK_IN');
    let count = 0;
    for (const g of guests) {
      if (!g.seat_assignment || !g.wisma_assignment) {
        this.assignGuestOnCheckin(g.id);
        count++;
      }
    }
    return { processedCount: count };
  }
}
