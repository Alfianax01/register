import { db } from '@/lib/db';
import { Guest, Seat, AccommodationRoom } from '@/types';

export interface AssignmentResult {
  success: boolean;
  message?: string;
  guest?: Guest;
  seatNumber?: string;
  wismaAssignment?: string;
}

export class AssignmentService {
  /**
   * Determine target seat group code based on military/civilian rank level (1-12)
   */
  public static getTargetSeatGroup(pangkatLevel: number = 10, matra?: string): string {
    if (pangkatLevel === 1) return 'A'; // VVIP Bintang 4 & Tamu Negara / Menteri
    if (pangkatLevel <= 3) return 'B';  // VIP Pati Bintang 3 & 2
    if (pangkatLevel === 4) return 'C';  // Pati Bintang 1 (Brigjen/Laksma/Marsma)
    if (pangkatLevel === 5) return 'D';  // Pamen Kolonel
    if (pangkatLevel <= 7) return 'E';  // Pamen Letkol & Mayor
    return 'F';                         // Pama, Tamtama & Tamu Undangan / Sipil
  }

  /**
   * Determine target wisma based on rank level
   */
  public static getTargetWismaName(pangkatLevel: number = 10): string {
    if (pangkatLevel <= 4) {
      return 'Wisma Soedirman (VVIP)';
    } else if (pangkatLevel <= 7) {
      return 'Wisma Kartika (Pamen)';
    } else {
      return 'Wisma Bahari / Mess Perwira';
    }
  }

  /**
   * Automatically assigns seat and wisma room when guest checks in.
   * Matra colors are strictly preserved and priority is determined by rank hierarchy.
   */
  public static assignGuestOnCheckin(guestId: string): AssignmentResult {
    const guest = db.findGuestById(guestId);
    if (!guest) {
      return { success: false, message: 'Data peserta tidak ditemukan' };
    }

    const seats = db.getSeats();
    const rooms = db.getAccommodations();

    let seatNumber = guest.seat_number || guest.seat_assignment;

    // 1. ALLOCATE SEAT IF NOT ALREADY ASSIGNED
    if (!seatNumber) {
      const targetGroup = this.getTargetSeatGroup(guest.pangkat_level, guest.matra);
      
      // Look for first unoccupied, unreserved seat in the target group
      let availableSeat = seats.find(s => s.group_code === targetGroup && !s.guest_id && !s.is_reserved);
      
      // Fallback: if target group is fully occupied, find first available seat anywhere
      if (!availableSeat) {
        availableSeat = seats.find(s => !s.guest_id && !s.is_reserved);
      }

      if (availableSeat) {
        db.assignSeat(availableSeat.seat_number, guest.id);
        seatNumber = availableSeat.seat_number;
        guest.seat_number = seatNumber;
        guest.seat_assignment = seatNumber;
        guest.seat_group_id = availableSeat.group_id;

        // Ensure seat status reflects check-in
        availableSeat.guest_status = 'CHECK_IN';
        availableSeat.status = 'CHECK_IN';
      }
    } else {
      // If already assigned, ensure seat records are updated to CHECK_IN
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

    // 2. ALLOCATE ACCOMMODATION IF NEEDED
    let wismaAssignment = guest.wisma_assignment;
    if (guest.butuh_akomodasi === 1) {
      if (!guest.room_id) {
        const targetWisma = this.getTargetWismaName(guest.pangkat_level);

        // Find available room in preferred wisma
        let availableRoom: AccommodationRoom | undefined = rooms.find(
          r => r.wisma_name === targetWisma && (!r.slot_a_guest_id || (r.capacity === 2 && !r.slot_b_guest_id))
        );

        // Fallback: any wisma with available slot
        if (!availableRoom) {
          availableRoom = rooms.find(
            r => !r.slot_a_guest_id || (r.capacity === 2 && !r.slot_b_guest_id)
          );
        }

        if (availableRoom) {
          const slot: 'A' | 'B' = !availableRoom.slot_a_guest_id ? 'A' : 'B';
          db.assignRoom(availableRoom.id, slot, guest.id);
          wismaAssignment = `${availableRoom.wisma_name} - Kamar ${availableRoom.room_number} (Slot ${slot})`;
          guest.wisma_assignment = wismaAssignment;
          guest.room_id = availableRoom.id;
          guest.room_slot = slot;
        }
      } else {
        const room = rooms.find(r => r.id === guest.room_id);
        if (room) {
          wismaAssignment = `${room.wisma_name} - Kamar ${room.room_number} (Slot ${guest.room_slot || 'A'})`;
          guest.wisma_assignment = wismaAssignment;
        }
      }
    }

    // Save updates
    db.updateGuest(guest.id, {
      seat_number: seatNumber,
      seat_assignment: seatNumber,
      seat_group_id: guest.seat_group_id,
      room_id: guest.room_id,
      room_slot: guest.room_slot,
      wisma_assignment: wismaAssignment
    });

    return {
      success: true,
      guest,
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
      if (!g.seat_number || (g.butuh_akomodasi === 1 && !g.room_id)) {
        this.assignGuestOnCheckin(g.id);
        count++;
      }
    }
    return { processedCount: count };
  }
}
