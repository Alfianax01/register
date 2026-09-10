import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  Guest,
  SeatGroup,
  Seat,
  AccommodationRoom,
  Checkpoint,
  CheckinLog,
  AdminUser,
  AuditLog,
  MatraType,
  Assignment,
  EmailLog,
  EmailDeliveryStatus
} from '@/types';
import { OFFICIAL_CHECKPOINTS } from '@/lib/constants/checkpoints';
import { hashToken, generateSecureToken } from '@/lib/security/tokens';
import { getInstansiCategory, getSeatColorAlias } from '@/lib/constants/matra-colors';
import { postgresAdapter } from './postgres';
import { mysqlAdapter } from './mysql';
import { AssignmentService } from '@/lib/services/assignment';

function resolveDbPaths(): { dataDir: string; dbFile: string; backupFile: string } {
  // If running in Vercel or read-only serverless environment
  if (process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDataDir = path.join('/tmp', 'data');
    const tmpDbFile = path.join(tmpDataDir, 'tni_event.json');
    return { dataDir: tmpDataDir, dbFile: tmpDbFile, backupFile: path.join(tmpDataDir, 'tni_event.json.backup') };
  }

  const defaultDataDir = path.join(process.cwd(), 'data');
  const defaultDbFile = path.join(defaultDataDir, 'tni_event.json');
  return { dataDir: defaultDataDir, dbFile: defaultDbFile, backupFile: path.join(defaultDataDir, 'tni_event.json.backup') };
}

const { dataDir: DATA_DIR, dbFile: DB_FILE, backupFile: BACKUP_FILE } = resolveDbPaths();

const globalForDb = globalThis as unknown as {
  __TNI_EVENT_DB__?: DatabaseSchema | null;
};

interface DatabaseSchema {
  guests: Guest[];
  seat_groups: SeatGroup[];
  seats: Seat[];
  accommodations: AccommodationRoom[];
  checkpoints: Checkpoint[];
  checkin_logs: CheckinLog[];
  admins: AdminUser[];
  audit_logs: AuditLog[];
  assignments?: Assignment[];
  email_logs?: EmailLog[];
}

// Initial Groups
const DEFAULT_SEAT_GROUPS: SeatGroup[] = [
  { id: 'grp_a', code: 'A', name: 'Grup A - VVIP (Bintang 4 & Tamu Negara)', description: 'Baris paling depan ruang sidang pleno', capacity: 16, color_code: '#D4AF37', sort_order: 1 },
  { id: 'grp_b', code: 'B', name: 'Grup B - VIP (Pati Bintang 3 & 2)', description: 'Baris kehormatan tengah depan', capacity: 24, color_code: '#B89325', sort_order: 2 },
  { id: 'grp_c', code: 'C', name: 'Grup C - Pati Bintang 1 (Brigjen/Laksma/Marsma)', description: 'Sektor tengah ruang sidang', capacity: 32, color_code: '#2B8754', sort_order: 3 },
  { id: 'grp_d', code: 'D', name: 'Grup D - Pamen Kolonel', description: 'Sayap kiri dan kanan sektor perwira menengah', capacity: 40, color_code: '#2058A3', sort_order: 4 },
  { id: 'grp_e', code: 'E', name: 'Grup E - Pamen Letkol & Mayor', description: 'Sektor belakang perwira menengah', capacity: 40, color_code: '#288FC4', sort_order: 5 },
  { id: 'grp_f', code: 'F', name: 'Grup F - Pama, Tamtama & Tamu Undangan', description: 'Area pendukung & atase', capacity: 40, color_code: '#700B15', sort_order: 6 },
];

function generateSeatsForGroups(groups: SeatGroup[]): Seat[] {
  const seats: Seat[] = [];
  for (const grp of groups) {
    const cols = 8;
    const rows = Math.ceil(grp.capacity / cols);
    let count = 0;
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        count++;
        if (count > grp.capacity) break;
        const seatNum = `${grp.code}-${String(count).padStart(2, '0')}`;
        seats.push({
          id: `seat_${grp.code.toLowerCase()}_${count}`,
          group_id: grp.id,
          group_code: grp.code,
          seat_number: seatNum,
          row_num: r,
          col_num: c,
          is_reserved: 0,
          status: 'KOSONG',
          colorAlias: null,
          peserta_id: null
        });
      }
    }
  }
  return seats;
}

function generateDefaultRooms(): AccommodationRoom[] {
  const rooms: AccommodationRoom[] = [];
  
  // Wisma Soedirman (VVIP & VIP) - Lantai 1 & 2
  for (let f = 1; f <= 2; f++) {
    for (let r = 1; r <= 6; r++) {
      const roomNum = `${f}0${r}`;
      rooms.push({
        id: `room_soedirman_${roomNum}`,
        wisma_name: 'Wisma Soedirman',
        floor: f,
        room_number: roomNum,
        capacity: f === 1 ? 1 : 2,
        notes: f === 1 ? 'Suite VVIP Bintang 4' : 'Deluxe Twin Pati'
      });
    }
  }

  // Wisma Kartika (Pamen) - Lantai 1 & 2
  for (let f = 1; f <= 2; f++) {
    for (let r = 1; r <= 8; r++) {
      const roomNum = `${f}0${r}`;
      rooms.push({
        id: `room_kartika_${roomNum}`,
        wisma_name: 'Wisma Kartika',
        floor: f,
        room_number: roomNum,
        capacity: 2,
        notes: 'Twin Bed Pamen Kolonel / Letkol'
      });
    }
  }

  // Wisma Gatot Subroto (Pama & Staf) - Lantai 1 s/d 3
  for (let f = 1; f <= 3; f++) {
    for (let r = 1; r <= 8; r++) {
      const roomNum = `${f}0${r}`;
      rooms.push({
        id: `room_gatot_${roomNum}`,
        wisma_name: 'Wisma Gatot Subroto',
        floor: f,
        room_number: roomNum,
        capacity: 2,
        notes: 'Twin Bed Reguler'
      });
    }
  }

  return rooms;
}

// Initial seed guests
function generateSeedGuests(): Guest[] {
  const seedList = [
    {
      nrp: '519284',
      nama: 'Agus Subiyanto',
      gelar_depan: 'Jenderal TNI',
      gelar_belakang: 'S.E., M.Si.',
      matra: 'AD' as MatraType,
      pangkat: 'Jenderal TNI',
      pangkat_level: 1,
      jabatan: 'Panglima Tentara Nasional Indonesia',
      satker: 'Mabes TNI (Cilangkap)',
      satuan: 'Mabes TNI',
      negara_instansi: 'Indonesia / Mabes TNI',
      no_hp: '08111945001',
      email: 'panglima@tni.mil.id',
      butuh_akomodasi: 0,
      status_kehadiran: 'CHECK_IN' as const,
      seat_group_id: 'grp_a',
      seat_number: 'A-01'
    },
    {
      nrp: '520193',
      nama: 'Maruli Simanjuntak',
      gelar_depan: 'Jenderal TNI',
      gelar_belakang: 'M.Sc.',
      matra: 'AD' as MatraType,
      pangkat: 'Jenderal TNI',
      pangkat_level: 1,
      jabatan: 'Kepala Staf Angkatan Darat (Kasad)',
      satker: 'Mabes TNI AD (Jakarta Pusat)',
      satuan: 'Staf Umum Kasad',
      negara_instansi: 'Indonesia / TNI AD',
      no_hp: '08129876002',
      email: 'kasad@tni-ad.mil.id',
      butuh_akomodasi: 0,
      status_kehadiran: 'CHECK_IN' as const,
      seat_group_id: 'grp_a',
      seat_number: 'A-02'
    },
    {
      nrp: '521876',
      nama: 'Muhammad Ali',
      gelar_depan: 'Laksamana TNI',
      gelar_belakang: 'S.E., M.M.',
      matra: 'AL' as MatraType,
      pangkat: 'Laksamana TNI',
      pangkat_level: 1,
      jabatan: 'Kepala Staf Angkatan Laut (Kasal)',
      satker: 'Mabes TNI AL (Cilangkap)',
      satuan: 'Staf Umum Kasal',
      negara_instansi: 'Indonesia / TNI AL',
      no_hp: '08137788003',
      email: 'kasal@tni-al.mil.id',
      butuh_akomodasi: 0,
      status_kehadiran: 'CHECK_IN' as const,
      seat_group_id: 'grp_a',
      seat_number: 'A-03'
    },
    {
      nrp: '522431',
      nama: 'M. Tonny Harjono',
      gelar_depan: 'Marsekal TNI',
      gelar_belakang: 'S.E., M.M.',
      matra: 'AU' as MatraType,
      pangkat: 'Marsekal TNI',
      pangkat_level: 1,
      jabatan: 'Kepala Staf Angkatan Udara (Kasau)',
      satker: 'Mabes TNI AU (Cilangkap)',
      satuan: 'Staf Umum Kasau',
      negara_instansi: 'Indonesia / TNI AU',
      no_hp: '08151234004',
      email: 'kasau@tni-au.mil.id',
      butuh_akomodasi: 0,
      status_kehadiran: 'REGISTRASI' as const,
      seat_group_id: 'grp_a',
      seat_number: 'A-04'
    },
    {
      nrp: '1965010190',
      nama: 'Sjafrie Sjamsoeddin',
      gelar_depan: '',
      gelar_belakang: '',
      matra: 'NON_TNI' as MatraType,
      pangkat: 'Menteri / Pejabat Setingkat Menteri',
      pangkat_level: 1,
      jabatan: 'Menteri Pertahanan Republik Indonesia',
      satker: 'Kementerian Pertahanan RI (Kemhan)',
      satuan: 'Setjen Kemhan',
      negara_instansi: 'Indonesia / Kemhan RI',
      no_hp: '08111900005',
      email: 'menhan@kemhan.go.id',
      butuh_akomodasi: 0,
      status_kehadiran: 'CHECK_IN' as const,
      seat_group_id: 'grp_a',
      seat_number: 'A-05'
    },
    {
      nrp: '524901',
      nama: 'Bambang Trisnohadi',
      gelar_depan: 'Letjen TNI',
      gelar_belakang: '',
      matra: 'AD' as MatraType,
      pangkat: 'Letnan Jenderal TNI',
      pangkat_level: 2,
      jabatan: 'Pangkostrad',
      satker: 'Komando Cadangan Strategis AD (Kostrad)',
      satuan: 'Makostrad',
      negara_instansi: 'Indonesia / TNI AD',
      no_hp: '08129000101',
      email: 'pangkostrad@tni.mil.id',
      butuh_akomodasi: 1,
      tgl_checkin: '2026-09-04',
      tgl_checkout: '2026-09-06',
      status_kehadiran: 'CHECK_IN' as const,
      seat_group_id: 'grp_b',
      seat_number: 'B-01',
      room_id: 'room_soedirman_201',
      room_slot: 'A' as const
    },
    {
      nrp: '525112',
      nama: 'Dedy Suryadi',
      gelar_depan: 'Mayor Jenderal TNI',
      gelar_belakang: 'S.I.P.',
      matra: 'AD' as MatraType,
      pangkat: 'Mayor Jenderal TNI',
      pangkat_level: 3,
      jabatan: 'Danjen Kopassus',
      satker: 'Komando Pasukan Khusus (Kopassus)',
      satuan: 'Makopassus (Cijantung)',
      negara_instansi: 'Indonesia / TNI AD',
      no_hp: '08139988102',
      email: 'danjen.kopassus@tni.mil.id',
      butuh_akomodasi: 1,
      tgl_checkin: '2026-09-04',
      tgl_checkout: '2026-09-06',
      status_kehadiran: 'REGISTRASI' as const,
      seat_group_id: 'grp_b',
      seat_number: 'B-02',
      room_id: 'room_soedirman_201',
      room_slot: 'B' as const
    },
    {
      nrp: '526330',
      nama: 'Endi Supardi',
      gelar_depan: 'Mayor Jenderal TNI (Mar)',
      gelar_belakang: 'S.E., M.Tr.Opsla.',
      matra: 'AL' as MatraType,
      pangkat: 'Mayor Jenderal TNI',
      pangkat_level: 3,
      jabatan: 'Komandan Korps Marinir (Dankormar)',
      satker: 'Korps Marinir TNI AL',
      satuan: 'Mako Korps Marinir (Jakarta)',
      negara_instansi: 'Indonesia / TNI AL',
      no_hp: '08128899103',
      email: 'dankormar@tni-al.mil.id',
      butuh_akomodasi: 0,
      status_kehadiran: 'CHECK_IN' as const,
      seat_group_id: 'grp_b',
      seat_number: 'B-03'
    },
    {
      nrp: '527441',
      nama: 'Yudi Bustami',
      gelar_depan: 'Mayor Jenderal TNI',
      gelar_belakang: 'S.Sos.',
      matra: 'AU' as MatraType,
      pangkat: 'Mayor Jenderal TNI',
      pangkat_level: 3,
      jabatan: 'Dankopasgat',
      satker: 'Kopasgat TNI AU',
      satuan: 'Mako Kopasgat (Bandung)',
      negara_instansi: 'Indonesia / TNI AU',
      no_hp: '08127766104',
      email: 'dankopasgat@tni-au.mil.id',
      butuh_akomodasi: 1,
      tgl_checkin: '2026-09-04',
      tgl_checkout: '2026-09-06',
      status_kehadiran: 'REGISTRASI' as const,
      seat_group_id: 'grp_b',
      seat_number: 'B-04',
      room_id: 'room_soedirman_202',
      room_slot: 'A' as const
    },
    {
      nrp: '531024',
      nama: 'Achiruddin',
      gelar_depan: 'Brigadir Jenderal TNI',
      gelar_belakang: 'S.E., M.Han.',
      matra: 'AD' as MatraType,
      pangkat: 'Brigadir Jenderal TNI',
      pangkat_level: 4,
      jabatan: 'Komandan Paspampres (Danpaspampres)',
      satker: 'Mabes TNI (Cilangkap)',
      satuan: 'Paspampres',
      negara_instansi: 'Indonesia / Mabes TNI',
      no_hp: '08136655105',
      email: 'danpaspampres@tni.mil.id',
      butuh_akomodasi: 0,
      status_kehadiran: 'CHECK_IN' as const,
      seat_group_id: 'grp_c',
      seat_number: 'C-01'
    },
    {
      nrp: '1102941',
      nama: 'Rizky Prakoso',
      gelar_depan: '',
      gelar_belakang: 'S.T.',
      matra: 'AD' as MatraType,
      pangkat: 'Kolonel (AD)',
      pangkat_level: 5,
      jabatan: 'Asintel Kasdam Jaya',
      satker: 'Kodam Jaya / Jayakarta',
      satuan: 'Makodam Jaya',
      negara_instansi: 'Indonesia / TNI AD',
      no_hp: '08123456789',
      email: 'rizky.prakoso@tni.mil.id',
      butuh_akomodasi: 1,
      tgl_checkin: '2026-09-04',
      tgl_checkout: '2026-09-06',
      status_kehadiran: 'REGISTRASI' as const,
      seat_group_id: 'grp_d',
      seat_number: 'D-01',
      room_id: 'room_kartika_101',
      room_slot: 'A' as const
    },
    {
      nrp: '1103852',
      nama: 'Budi Hartono',
      gelar_depan: '',
      gelar_belakang: 'M.Tr.Han.',
      matra: 'AL' as MatraType,
      pangkat: 'Letnan Kolonel (AL)',
      pangkat_level: 6,
      jabatan: 'Komandan KRI I Gusti Ngurah Rai-332',
      satker: 'Komando Armada RI (Koarmada RI)',
      satuan: 'Koarmada II (Surabaya)',
      negara_instansi: 'Indonesia / TNI AL',
      no_hp: '08129812345',
      email: 'budi.hartono@tni-al.mil.id',
      butuh_akomodasi: 1,
      tgl_checkin: '2026-09-04',
      tgl_checkout: '2026-09-06',
      status_kehadiran: 'REGISTRASI' as const,
      seat_group_id: 'grp_e',
      seat_number: 'E-01',
      room_id: 'room_kartika_101',
      room_slot: 'B' as const
    },
    {
      nrp: '1104921',
      nama: 'Ferry Hendrawan',
      gelar_depan: '',
      gelar_belakang: '',
      matra: 'AU' as MatraType,
      pangkat: 'Mayor (AU)',
      pangkat_level: 7,
      jabatan: 'Komandan Skadron Udara 3 (F-16)',
      satker: 'Koopsudnas',
      satuan: 'Koopsud II (Makassar)',
      negara_instansi: 'Indonesia / TNI AU',
      no_hp: '08125544332',
      email: 'ferry.f16@tni-au.mil.id',
      butuh_akomodasi: 1,
      tgl_checkin: '2026-09-04',
      tgl_checkout: '2026-09-06',
      status_kehadiran: 'REGISTRASI' as const,
      room_id: 'room_mess_101',
      room_slot: 'A' as const
    },
    {
      nrp: '1105819',
      nama: 'Dian Permana',
      gelar_depan: '',
      gelar_belakang: 'S.Sos.',
      matra: 'AD' as MatraType,
      pangkat: 'Kapten (AD)',
      pangkat_level: 8,
      jabatan: 'Danki Den 81 Gultor Kopassus',
      satker: 'Komando Pasukan Khusus (Kopassus)',
      satuan: 'Sat-81 Gultor Kopassus',
      negara_instansi: 'Indonesia / TNI AD',
      no_hp: '08124433221',
      email: 'dian.gultor@tni.mil.id',
      butuh_akomodasi: 0,
      status_kehadiran: 'REGISTRASI' as const
    },
    {
      nrp: 'DEF-US-091',
      nama: 'Col. Michael Vance',
      gelar_depan: 'Colonel',
      gelar_belakang: 'USAF',
      matra: 'NON_TNI' as MatraType,
      pangkat: 'Atase Pertahanan (Military Attaché)',
      pangkat_level: 4,
      jabatan: 'Senior Defense Official / Defense Attaché',
      satker: 'Korps Diplomatik / Kedutaan Besar Asing',
      satuan: 'Kedutaan Besar Negara Sahabat (Atase Pertahanan)',
      negara_instansi: 'United States Embassy / DoD',
      no_hp: '+62811880099',
      email: 'michael.vance@state.gov',
      butuh_akomodasi: 0,
      status_kehadiran: 'CHECK_IN' as const,
      seat_group_id: 'grp_c',
      seat_number: 'C-02'
    }
  ];

  const guests: Guest[] = [];
  const now = new Date().toISOString();

  for (const item of seedList) {
    const token = generateSecureToken();
    const token_hash = hashToken(token);
    guests.push({
      id: `guest_${item.nrp.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      nrp: item.nrp,
      nama: item.nama,
      gelar_depan: item.gelar_depan,
      gelar_belakang: item.gelar_belakang,
      matra: item.matra,
      pangkat: item.pangkat,
      pangkat_level: item.pangkat_level,
      jabatan: item.jabatan,
      satker: item.satker,
      satuan: item.satuan,
      negara_instansi: item.negara_instansi,
      no_hp: item.no_hp,
      email: item.email,
      butuh_akomodasi: item.butuh_akomodasi,
      tgl_checkin: item.tgl_checkin,
      tgl_checkout: item.tgl_checkout,
      qr_token: token,
      token_hash: token_hash,
      seat_group_id: item.seat_group_id,
      seat_number: item.seat_number,
      seat_assignment: item.seat_number,
      room_id: (item as any).room_id,
      room_slot: (item as any).room_slot,
      status_kehadiran: item.status_kehadiran,
      waktu_kehadiran_pertama: item.status_kehadiran === 'CHECK_IN' ? new Date(Date.now() - 3600000).toISOString() : undefined,
      created_at: now,
      updated_at: now
    });
  }

  return guests;
}

// Generate default admins with hashed passwords (OWASP 9.1)
function generateDefaultAdmins(): AdminUser[] {
  const salt = bcrypt.genSaltSync(10);
  const now = new Date().toISOString();

  return [
    {
      id: 'admin_super',
      username: 'superadmin',
      nama: 'Letkol Chb Radityo (Super Admin IT)',
      role: 'SUPER_ADMIN',
      password_hash: bcrypt.hashSync('tni2026prima', salt),
      created_at: now
    },
    {
      id: 'admin_gate',
      username: 'panitiagate',
      nama: 'Kapten Inf Hendro (Koordinator Gate 1)',
      role: 'PANITIA_GATE',
      password_hash: bcrypt.hashSync('gatepass2026', salt),
      created_at: now
    },
    {
      id: 'admin_wisma',
      username: 'panitiawisma',
      nama: 'Mayor Laut (K) Anita (Koordinator Wisma)',
      role: 'PANITIA_AKOMODASI',
      password_hash: bcrypt.hashSync('wismapass2026', salt),
      created_at: now
    }
  ];
}

class DatabaseManager {
  private data: DatabaseSchema | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private migrateLegacyStatuses() {
    if (!this.data) return;
    let modified = false;

    // Migrate guests
    if (Array.isArray(this.data.guests)) {
      for (const g of this.data.guests) {
        if ((g.status_kehadiran as any) === 'BELUM_HADIR') {
          g.status_kehadiran = 'REGISTRASI';
          modified = true;
        } else if ((g.status_kehadiran as any) === 'HADIR') {
          g.status_kehadiran = 'CHECK_IN';
          modified = true;
        }

        // Merge gelar into nama if present and separate
        const gd = (g as any).gelar_depan ? String((g as any).gelar_depan).trim() : '';
        const gb = (g as any).gelar_belakang ? String((g as any).gelar_belakang).trim() : '';
        if ((gd && gd !== '-') || (gb && gb !== '-')) {
          let full = g.nama.trim();
          if (gd && gd !== '-' && !full.startsWith(gd)) {
            full = `${gd} ${full}`;
            modified = true;
          }
          if (gb && gb !== '-' && !full.endsWith(gb)) {
            full = `${full}, ${gb}`;
            modified = true;
          }
          g.nama = full;
        }

        // Ensure seat_assignment & wisma_assignment
        if (g.seat_number && !g.seat_assignment) {
          g.seat_assignment = g.seat_number;
          modified = true;
        }
        if (g.room_id && !g.wisma_assignment && Array.isArray(this.data.accommodations)) {
          const room = this.data.accommodations.find(r => r.id === g.room_id);
          if (room) {
            g.wisma_assignment = `${room.wisma_name} - Kamar ${room.room_number} (Slot ${g.room_slot || 'A'})`;
            modified = true;
          }
        }
        // Initialize email delivery status if absent
        if (!g.email_status) {
          if (g.email && g.email.toLowerCase().includes('hendrawan.') && g.email.toLowerCase().includes('@kemhan.go.id')) {
            g.email_status = 'BOUNCED';
            g.last_email_error = '550 5.1.1 Recipient address rejected: User unknown';
            g.emailSent = false;
            modified = true;
          } else if (g.emailSent) {
            g.email_status = 'SENT';
            modified = true;
          } else {
            g.email_status = 'PENDING';
            modified = true;
          }
        }
        if (g.email_retry_count === undefined) {
          g.email_retry_count = 0;
          modified = true;
        }
      }
    }

    // Migrate seats
    if (Array.isArray(this.data.seats)) {
      for (const s of this.data.seats) {
        if ((s.guest_status as any) === 'BELUM_HADIR') {
          s.guest_status = 'REGISTRASI';
          modified = true;
        } else if ((s.guest_status as any) === 'HADIR') {
          s.guest_status = 'CHECK_IN';
          modified = true;
        }
        if ((s.status as any) === 'HADIR') {
          s.status = 'CHECK_IN';
          modified = true;
        }
      }
    }

    if (!this.data.assignments) {
      this.data.assignments = [];
      modified = true;
    }

    if (!this.data.email_logs) {
      this.data.email_logs = [];
      modified = true;
    }

    if (modified) {
      console.log('[DATABASE] Migrasi status selesai: BELUM_HADIR -> REGISTRASI, HADIR -> CHECK_IN.');
      this.persist();
    }
  }

  private ensureInitialized() {
    // 1. In-memory check for current instance
    if (this.data && Array.isArray(this.data.guests) && this.data.guests.length > 0) {
      return;
    }

    // 2. Global process memory cache (preserves state across hot serverless function invocations)
    if (globalForDb.__TNI_EVENT_DB__ && Array.isArray(globalForDb.__TNI_EVENT_DB__.guests) && globalForDb.__TNI_EVENT_DB__.guests.length > 0) {
      this.data = globalForDb.__TNI_EVENT_DB__;
      this.migrateLegacyStatuses();
      return;
    }

    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create DATA_DIR:', err);
      }
    }

    // 3. Try reading from main database file
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.guests) && parsed.guests.length > 0) {
          this.data = parsed;
          globalForDb.__TNI_EVENT_DB__ = this.data;
          this.migrateLegacyStatuses();
          this.syncPostgresBackground();
          return;
        }
      } catch (err) {
        console.error('Error reading primary DB file, checking backup:', err);
      }
    }

    // 4. Try restoring from backup database file
    if (fs.existsSync(BACKUP_FILE)) {
      try {
        const rawBackup = fs.readFileSync(BACKUP_FILE, 'utf-8');
        const parsedBackup = JSON.parse(rawBackup);
        if (parsedBackup && Array.isArray(parsedBackup.guests) && parsedBackup.guests.length > 0) {
          console.log('[DATABASE] Data dipulihkan dari file cadangan (backup).');
          this.data = parsedBackup;
          globalForDb.__TNI_EVENT_DB__ = this.data;
          this.persist();
          this.syncPostgresBackground();
          return;
        }
      } catch (backupErr) {
        console.error('Error reading backup file:', backupErr);
      }
    }

    // 5. Check if initial seed exists in process.cwd()/data/tni_event.json
    const rootSeedFile = path.join(process.cwd(), 'data', 'tni_event.json');
    if (fs.existsSync(rootSeedFile) && DB_FILE !== rootSeedFile) {
      try {
        const content = fs.readFileSync(rootSeedFile, 'utf-8');
        const parsedSeed = JSON.parse(content);
        if (parsedSeed && Array.isArray(parsedSeed.guests) && parsedSeed.guests.length > 0) {
          this.data = parsedSeed;
          globalForDb.__TNI_EVENT_DB__ = this.data;
          this.persist();
          this.syncPostgresBackground();
          return;
        }
      } catch (copyErr) {
        console.warn('Could not load seed file:', copyErr);
      }
    }

    // 6. If no file exists or readable, initialize default data
    this.initDefaultData();
    this.migrateLegacyStatuses();
  }

  private syncPostgresBackground() {
    if (!postgresAdapter.isAvailable()) return;

    postgresAdapter.ensureTables().then(() => {
      postgresAdapter.getAllGuests().then(pgGuests => {
        if (pgGuests && pgGuests.length > 0 && this.data) {
          let updated = false;
          for (const pgG of pgGuests) {
            const idx = this.data.guests.findIndex(g => g.id === pgG.id || g.qr_token === pgG.qr_token);
            if (idx >= 0) {
              this.data.guests[idx] = { ...this.data.guests[idx], ...pgG };
            } else {
              this.data.guests.unshift(pgG);
              updated = true;
            }
          }
          if (updated) {
            this.persist();
          }
        }
      }).catch(err => {
        console.warn('[PostgreSQL] Background sync guests notice:', err);
      });

      postgresAdapter.getSeatsAndRooms().then(sr => {
        if (sr && this.data) {
          if (sr.seats && Array.isArray(sr.seats)) this.data.seats = sr.seats;
          if (sr.rooms && Array.isArray(sr.rooms)) this.data.accommodations = sr.rooms;
        }
      }).catch(err => {
        console.warn('[PostgreSQL] Background sync seats/rooms notice:', err);
      });
    }).catch(err => {
      console.warn('[PostgreSQL] ensureTables error during background sync:', err);
    });
  }

  private initDefaultData() {
    const seat_groups = DEFAULT_SEAT_GROUPS;
    const seats = generateSeatsForGroups(seat_groups);
    const accommodations = generateDefaultRooms();
    const defaultGuests = generateSeedGuests();
    const checkpoints = OFFICIAL_CHECKPOINTS;
    const admins = generateDefaultAdmins();

    // Anti-wipe: merge existing registered guests so registrations are NEVER lost
    let guests = defaultGuests;
    if (this.data && Array.isArray(this.data.guests) && this.data.guests.length > 0) {
      const mergedMap = new Map<string, Guest>();
      for (const g of defaultGuests) mergedMap.set(g.id, g);
      for (const g of this.data.guests) mergedMap.set(g.id, g);
      guests = Array.from(mergedMap.values());
    }

    // Map initial assigned seats
    for (const g of guests) {
      if (g.seat_number) {
        const seat = seats.find(s => s.seat_number === g.seat_number);
        if (seat) {
          seat.guest_id = g.id;
          seat.guest_name = g.nama;
          seat.guest_rank = g.pangkat;
          seat.guest_matra = g.matra;
          seat.guest_status = g.status_kehadiran;
        }
      }

      if (g.room_id) {
        const room = accommodations.find(r => r.id === g.room_id);
        if (room) {
          if (g.room_slot === 'A' || !room.slot_a_guest_id) {
            room.slot_a_guest_id = g.id;
            room.slot_a_guest_name = g.nama;
            room.slot_a_guest_rank = g.pangkat;
            room.slot_a_guest_matra = g.matra;
          } else if (g.room_slot === 'B') {
            room.slot_b_guest_id = g.id;
            room.slot_b_guest_name = g.nama;
            room.slot_b_guest_rank = g.pangkat;
            room.slot_b_guest_matra = g.matra;
          }
        }
      }
    }

    // Initial checkin logs for present seed guests
    const checkin_logs: CheckinLog[] = [];
    for (const g of guests.filter(x => x.status_kehadiran === 'CHECK_IN')) {
      checkin_logs.push({
        id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        guest_id: g.id,
        guest_nama: g.nama,
        guest_nrp: g.nrp || '-',
        guest_pangkat: g.pangkat,
        guest_matra: g.matra,
        checkpoint_code: 'GATE_UTAMA',
        checkpoint_name: 'Gate 1: Pintu Masuk Utama (Absensi Awal)',
        scanned_by_admin_name: 'Kapten Inf Hendro (Koordinator Gate 1)',
        scanned_at: g.waktu_kehadiran_pertama || new Date().toISOString()
      });
    }

    const audit_logs: AuditLog[] = [
      {
        id: `aud_${Date.now()}`,
        admin_id: 'admin_super',
        admin_username: 'superadmin',
        action: 'INITIALIZE_SYSTEM',
        details: 'Sistem diinisialisasi dengan data pejabat TNI dan tata letak ruang',
        created_at: new Date().toISOString()
      }
    ];

    this.data = {
      guests,
      seat_groups,
      seats,
      accommodations,
      checkpoints,
      checkin_logs,
      admins,
      audit_logs,
      assignments: [],
      email_logs: []
    };

    globalForDb.__TNI_EVENT_DB__ = this.data;
    this.persist();
  }

  private persist() {
    if (!this.data) return;
    // Always sync into process global memory
    globalForDb.__TNI_EVENT_DB__ = this.data;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const jsonStr = JSON.stringify(this.data, null, 2);

      // Atomic file write using a temporary file in same folder
      const tmpFile = path.join(DATA_DIR, `.tni_event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.tmp`);
      fs.writeFileSync(tmpFile, jsonStr, 'utf-8');

      try {
        fs.renameSync(tmpFile, DB_FILE);
      } catch (renameErr) {
        fs.copyFileSync(tmpFile, DB_FILE);
        try { fs.unlinkSync(tmpFile); } catch {}
      }

      // Always maintain backup copy
      try {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      } catch {}

    } catch (err: any) {
      console.error("Database persist error:", err);
    }
  }

  // GUESTS
  public getGuests(): Guest[] {
    this.ensureInitialized();
    return this.data!.guests;
  }

  public async getAllGuests(filters?: { matra?: string; status?: string; search?: string }): Promise<Guest[]> {
    this.ensureInitialized();
    if (mysqlAdapter.isConfigured()) {
      try {
        const myGuests = await mysqlAdapter.getAllGuests(filters);
        if (myGuests && myGuests.length > 0) {
          this.data!.guests = myGuests;
          return myGuests;
        } else if (this.data && Array.isArray(this.data.guests) && this.data.guests.length > 0) {
          // One-time initial seed migration to MySQL if table is currently empty
          for (const g of this.data.guests) {
            try {
              await mysqlAdapter.createGuest(g);
            } catch {}
          }
          const seeded = await mysqlAdapter.getAllGuests(filters);
          if (seeded && seeded.length > 0) {
            this.data!.guests = seeded;
            return seeded;
          }
        }
      } catch (err) {
        console.error('[MySQL] Error in getAllGuests:', err);
        throw err;
      }
    }
    if (postgresAdapter.isAvailable()) {
      try {
        const pgGuests = await postgresAdapter.getAllGuests();
        if (pgGuests && pgGuests.length > 0) {
          this.data!.guests = pgGuests;
          return pgGuests;
        }
      } catch (err) {
        console.error('[PostgreSQL] Error in getAllGuests:', err);
        throw err;
      }
    }
    return this.data!.guests;
  }

  public async getGuestsAsync(): Promise<Guest[]> {
    return this.getAllGuests();
  }

  public async searchGuests(query: string): Promise<Guest[]> {
    this.ensureInitialized();
    if (mysqlAdapter.isConfigured()) {
      try {
        return await mysqlAdapter.searchGuests(query);
      } catch (err) {
        console.error('[MySQL] Error in searchGuests:', err);
        throw err;
      }
    }
    return this.searchGuestsAsync(query);
  }

  public async getGuestByNRP(nrp: string): Promise<Guest | null> {
    const res = await this.findGuestByNRPAsync(nrp);
    return res || null;
  }

  public async getGuestByToken(token: string): Promise<Guest | null> {
    const res = await this.findGuestByTokenAsync(token);
    return res || null;
  }

  public async getGuestById(id: string): Promise<Guest | null> {
    const res = await this.findGuestByIdAsync(id);
    return res || null;
  }

  public findGuestById(id: string): Guest | undefined {
    this.ensureInitialized();
    return this.data!.guests.find(g => g.id === id);
  }

  public async findGuestByIdAsync(id: string): Promise<Guest | undefined> {
    if (mysqlAdapter.isConfigured()) {
      try {
        const myGuest = await mysqlAdapter.getGuestById(id);
        if (myGuest) return myGuest;
      } catch (err) {
        console.warn('[MySQL] Error in findGuestByIdAsync:', err);
      }
    }
    const local = this.findGuestById(id);
    if (local) return local;

    if (postgresAdapter.isAvailable()) {
      const pgGuest = await postgresAdapter.findGuestById(id);
      if (pgGuest) {
        this.data!.guests.unshift(pgGuest);
        this.persist();
        return pgGuest;
      }
    }
    return undefined;
  }

  public findGuestByToken(token: string): Guest | undefined {
    this.ensureInitialized();
    const tokenTrimmed = token.trim();
    // Compare directly with token, token_hash, ticket_id, or registration_id
    const hashed = hashToken(tokenTrimmed);
    const guest = this.data!.guests.find(g => 
      g.qr_token === tokenTrimmed || 
      g.token_hash === hashed ||
      g.id === tokenTrimmed ||
      (g.ticket_id && g.ticket_id.toUpperCase() === tokenTrimmed.toUpperCase()) ||
      (g.registration_id && g.registration_id.toUpperCase() === tokenTrimmed.toUpperCase())
    );

    if (guest) {
      console.log("DATA DITEMUKAN:", {
        id: guest.id,
        nama: guest.nama,
        nrp: guest.nrp,
        token: guest.qr_token,
        ticket_id: guest.ticket_id,
        registration_id: guest.registration_id
      });
    }

    return guest;
  }

  public findGuestByNRP(nrp: string): Guest | undefined {
    this.ensureInitialized();
    if (!nrp) return undefined;
    const clean = String(nrp).trim().toLowerCase().replace(/[\s\-\.]/g, '');
    // Do not match empty, dash, or generic non-tni strings
    if (!clean || clean === 'nontni' || clean === 'sipil' || clean.length < 3) {
      return undefined;
    }
    const guest = this.data!.guests.find(g => {
      const gClean = String(g.nrp || '').toLowerCase().replace(/[\s\-\.]/g, '');
      return gClean && gClean !== 'nontni' && gClean !== 'sipil' && gClean === clean;
    });
    if (guest) {
      console.log("DATA DITEMUKAN BERDASARKAN NRP:", {
        id: guest.id,
        nama: guest.nama,
        nrp: guest.nrp
      });
    }
    return guest;
  }

  public findGuestByEmail(email: string): Guest | undefined {
    this.ensureInitialized();
    if (!email || !String(email).trim()) return undefined;
    const clean = String(email).trim().toLowerCase();
    const guest = this.data!.guests.find(g => g.email && String(g.email).trim().toLowerCase() === clean);
    if (guest) {
      console.log("DATA DITEMUKAN:", {
        id: guest.id,
        nama: guest.nama,
        email: guest.email
      });
    }
    return guest;
  }

  public findGuestByPhone(phone: string): Guest | undefined {
    this.ensureInitialized();
    if (!phone || !String(phone).trim()) return undefined;
    let clean = String(phone).trim().replace(/[\s\-\(\)\+]/g, '');
    if (clean.startsWith('62')) clean = '0' + clean.slice(2);

    const guest = this.data!.guests.find(g => {
      if (!g.no_hp) return false;
      let guestPhone = String(g.no_hp).trim().replace(/[\s\-\(\)\+]/g, '');
      if (guestPhone.startsWith('62')) guestPhone = '0' + guestPhone.slice(2);
      return guestPhone === clean;
    });

    if (guest) {
      console.log("DATA DITEMUKAN:", {
        id: guest.id,
        nama: guest.nama,
        phone: guest.no_hp
      });
    }

    return guest;
  }

  public createGuest(guestData: Omit<Guest, 'id' | 'qr_token' | 'token_hash' | 'status_kehadiran' | 'created_at' | 'updated_at'>): Guest {
    this.ensureInitialized();
    const now = new Date().toISOString();
    const token = generateSecureToken();
    const token_hash = hashToken(token);

    const randSuffix = Math.floor(100000 + Math.random() * 900000);
    const regId = guestData.registration_id || (guestData.nrp && guestData.nrp !== '-' && guestData.nrp.toUpperCase() !== 'NON-TNI'
      ? `REG-2026-${guestData.nrp.replace(/[^A-Za-z0-9]/g, '')}-${randSuffix}`
      : `REG-2026-${Date.now().toString().slice(-4)}-${randSuffix}`);
    const ticketId = guestData.ticket_id || `TCK-2026-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const katInstansi = guestData.kategori_instansi || getInstansiCategory(guestData.matra || guestData.satker);
    const warnaKursi = guestData.warna_kursi || getSeatColorAlias(katInstansi);

    const newGuest: Guest = {
      ...guestData,
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      registration_id: regId,
      ticket_id: ticketId,
      qr_token: token,
      token_hash: token_hash,
      status_kehadiran: 'REGISTRASI',
      email_status: 'PENDING',
      email_retry_count: 0,
      emailSent: false,
      kategori_instansi: katInstansi,
      warna_kursi: warnaKursi,
      seatColorAlias: warnaKursi,
      created_at: now,
      updated_at: now
    };

    this.data!.guests.unshift(newGuest);
    this.persist();

    // Auto-allocate seat, wisma and room immediately upon registration
    try {
      const wantsAccom = Boolean(newGuest.butuh_akomodasi === 1 || newGuest.butuh_akomodasi);
      const alloc = AssignmentService.assignGuestOnRegistration(newGuest.id, wantsAccom);
      if (alloc.success && alloc.guest) {
        Object.assign(newGuest, alloc.guest);
      }
    } catch (allocErr) {
      console.error('[Database] Auto-allocation on createGuest failed:', allocErr);
    }

    // Persist to Postgres database if configured (async background)
    if (postgresAdapter.isAvailable()) {
      postgresAdapter.saveGuest(newGuest).catch(err => {
        console.error('[PostgreSQL] DATA ERROR simpan ke postgres:', err);
      });
    }

    console.log("Database Result (insertResult):", {
      id: newGuest.id,
      registration_id: newGuest.registration_id,
      ticket_id: newGuest.ticket_id,
      nama: newGuest.nama,
      nrp: newGuest.nrp,
      token: newGuest.qr_token,
      created_at: newGuest.created_at
    });

    return newGuest;
  }

  public async createGuestAsync(guestData: Omit<Guest, 'id' | 'qr_token' | 'token_hash' | 'status_kehadiran' | 'created_at' | 'updated_at'>): Promise<Guest> {
    this.ensureInitialized();
    const now = new Date().toISOString();
    const token = generateSecureToken();
    const token_hash = hashToken(token);

    // Format auto-generate: REG-2026-XXXXXX (6 digit unik)
    const randCode = Math.floor(100000 + Math.random() * 900000);
    const regId = guestData.registration_id || `REG-2026-${randCode}`;
    const ticketId = guestData.ticket_id || `TCK-2026-${randCode}`;

    const katInstansi = guestData.kategori_instansi || getInstansiCategory(guestData.matra || guestData.satker);
    const warnaKursi = guestData.warna_kursi || getSeatColorAlias(katInstansi);

    const newGuest: Guest = {
      ...guestData,
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      registration_id: regId,
      ticket_id: ticketId,
      qr_token: token,
      token_hash: token_hash,
      status_kehadiran: 'TEREGISTRASI',
      email_status: 'PENDING',
      email_retry_count: 0,
      emailSent: false,
      kategori_instansi: katInstansi,
      warna_kursi: warnaKursi,
      seatColorAlias: warnaKursi,
      registered_at: now,
      created_at: now,
      updated_at: now
    };

    // 1. Save locally to in-memory & atomic JSON file
    this.data!.guests.unshift(newGuest);
    this.persist();

    // Auto-allocate seat, wisma and room immediately upon registration
    try {
      const wantsAccom = Boolean(newGuest.butuh_akomodasi === 1 || newGuest.butuh_akomodasi);
      const seatAlloc = AssignmentService.allocateSeat(newGuest);
      const accomAlloc = AssignmentService.allocateAccommodation(newGuest, wantsAccom);

      newGuest.seat_number = seatAlloc.seatNumber;
      newGuest.seat_assignment = seatAlloc.seatNumber;
      newGuest.seat_block = seatAlloc.seatBlock;
      newGuest.building = seatAlloc.building;
      newGuest.room = seatAlloc.room;
      newGuest.room_name = seatAlloc.room;
      newGuest.seat_group_id = seatAlloc.seatGroupId;

      newGuest.wisma_name = accomAlloc.wismaName;
      newGuest.room_number = accomAlloc.wismaName === 'Tidak Menginap' ? undefined : (accomAlloc.roomNumber || undefined);
      newGuest.bed_number = accomAlloc.wismaName === 'Tidak Menginap' ? undefined : (accomAlloc.bedNumber || undefined);
      newGuest.wisma_assignment = accomAlloc.wismaAssignment;
      newGuest.status_akomodasi = accomAlloc.wismaName !== 'Tidak Menginap' ? 'MENGINAP' : 'Tidak Menginap';
      newGuest.assignment = {
        id: `assign_${newGuest.id}`,
        peserta_id: newGuest.id,
        seat_code: seatAlloc.seatNumber,
        seat_area: seatAlloc.room,
        gedung: seatAlloc.building,
        building: seatAlloc.building,
        room: seatAlloc.room,
        seat_row: seatAlloc.seatNumber.split('-')[0],
        seat_num: seatAlloc.seatNumber.split('-')[1] || '01',
        wisma_name: accomAlloc.wismaName,
        room_code: accomAlloc.roomNumber,
        room_number: accomAlloc.roomNumber,
        bed_number: accomAlloc.bedNumber,
        room_floor: accomAlloc.roomFloor,
        assigned_at: now
      };

      this.assignSeat(seatAlloc.seatNumber, newGuest.id);
      if (accomAlloc.roomId && accomAlloc.roomSlot) {
        this.assignRoom(accomAlloc.roomId, accomAlloc.roomSlot, newGuest.id);
      }
    } catch (allocErr) {
      console.error('[Database] Auto-allocation on createGuestAsync failed:', allocErr);
    }

    // 2. Persist to PostgreSQL if configured (with transactions & retries)
    if (postgresAdapter.isAvailable()) {
      const saved = await postgresAdapter.saveGuest(newGuest, 3);
      if (!saved) {
        console.warn('[PostgreSQL] Peringatan: Gagal menyimpan ke PostgreSQL setelah 3 percobaan. Data tetap tersimpan di file lokal.');
      } else {
        const verified = await postgresAdapter.verifyGuestSaved(newGuest.id);
        console.log('[PostgreSQL] POST-INSERT VERIFIED:', {
          id: newGuest.id,
          verified,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Persist directly to MySQL database (rapim_tni) as PRIMARY engine
    if (mysqlAdapter.isConfigured()) {
      try {
        const savedMySQL = await mysqlAdapter.createGuest(newGuest);
        if (savedMySQL) {
          this.data!.guests.unshift(savedMySQL);
          this.persist();
          console.log('[MySQL] Berhasil simpan ke rapim_tni:', {
            id: savedMySQL.id,
            registration_id: savedMySQL.registration_id,
            nama: savedMySQL.nama,
            seat_number: savedMySQL.seat_number,
            seat_block: savedMySQL.seat_block,
            building: savedMySQL.building,
            room_name: savedMySQL.room_name,
            wisma_name: savedMySQL.wisma_name,
            room_number: savedMySQL.room_number,
            bed_number: savedMySQL.bed_number,
            status_akomodasi: savedMySQL.status_akomodasi
          });
          return savedMySQL;
        }
      } catch (myErr) {
        console.error('[MySQL] Gagal createGuestAsync ke MySQL rapim_tni:', myErr);
      }
    }

    console.log("Database Result (insertResult):", {
      id: newGuest.id,
      registration_id: newGuest.registration_id,
      ticket_id: newGuest.ticket_id,
      nama: newGuest.nama,
      nrp: newGuest.nrp,
      token: newGuest.qr_token,
      created_at: newGuest.created_at
    });
    // Fallback: in-memory & atomic JSON file
    this.data!.guests.unshift(newGuest);
    this.persist();

    // Fallback: Postgres if configured
    if (postgresAdapter.isAvailable()) {
      postgresAdapter.saveGuest(newGuest, 3).catch(console.error);
    }

    return newGuest;
  }

  public async findGuestByTokenAsync(token: string): Promise<Guest | undefined> {
    if (mysqlAdapter.isConfigured()) {
      try {
        const myGuest = await mysqlAdapter.getGuestByToken(token);
        if (myGuest) return myGuest;
      } catch (err) {
        console.warn('[MySQL] Error in findGuestByTokenAsync:', err);
      }
    }
    const local = this.findGuestByToken(token);
    if (local) return local;

    // Fallback: check PostgreSQL cloud database
    if (postgresAdapter.isAvailable()) {
      const pgGuest = await postgresAdapter.findGuestByToken(token);
      if (pgGuest) {
        // Hydrate into local container memory
        this.data!.guests.unshift(pgGuest);
        this.persist();
        console.log('DATA DITEMUKAN DARI CLOUD POSTGRESQL:', {
          id: pgGuest.id,
          nama: pgGuest.nama,
          token: pgGuest.qr_token
        });
        return pgGuest;
      }
    }
    return undefined;
  }

  public async findGuestByNRPAsync(nrp: string): Promise<Guest | undefined> {
    if (mysqlAdapter.isConfigured()) {
      try {
        const myGuest = await mysqlAdapter.getGuestByNRP(nrp);
        if (myGuest) return myGuest;
      } catch (err) {
        console.warn('[MySQL] Error in findGuestByNRPAsync:', err);
      }
    }
    const local = this.findGuestByNRP(nrp);
    if (local) return local;

    if (postgresAdapter.isAvailable()) {
      const pgGuest = await postgresAdapter.findGuestByNRP(nrp);
      if (pgGuest) {
        this.data!.guests.unshift(pgGuest);
        this.persist();
        return pgGuest;
      }
    }
    return undefined;
  }

  public async findGuestByPhoneAsync(phone: string): Promise<Guest | undefined> {
    if (mysqlAdapter.isConfigured()) {
      try {
        const myGuest = await mysqlAdapter.getGuestByPhone(phone);
        if (myGuest) return myGuest;
      } catch (err) {
        console.warn('[MySQL] Error in findGuestByPhoneAsync:', err);
      }
    }
    const local = this.findGuestByPhone(phone);
    if (local) return local;

    if (postgresAdapter.isAvailable()) {
      const pgGuest = await postgresAdapter.findGuestByPhone(phone);
      if (pgGuest) {
        this.data!.guests.unshift(pgGuest);
        this.persist();
        return pgGuest;
      }
    }
    return undefined;
  }

  public async findGuestByEmailAsync(email: string): Promise<Guest | undefined> {
    if (mysqlAdapter.isConfigured()) {
      try {
        const myGuest = await mysqlAdapter.getGuestByEmail(email);
        if (myGuest) return myGuest;
      } catch (err) {
        console.warn('[MySQL] Error in findGuestByEmailAsync:', err);
      }
    }
    const local = this.findGuestByEmail(email);
    if (local) return local;

    if (postgresAdapter.isAvailable()) {
      const pgGuest = await postgresAdapter.findGuestByEmail(email);
      if (pgGuest) {
        this.data!.guests.unshift(pgGuest);
        this.persist();
        return pgGuest;
      }
    }
    return undefined;
  }

  public async searchGuestsAsync(query: string): Promise<Guest[]> {
    this.ensureInitialized();
    const clean = query.trim().toLowerCase();
    
    if (mysqlAdapter.isConfigured()) {
      try {
        const myResults = await mysqlAdapter.searchGuests(clean);
        if (myResults && myResults.length > 0) {
          return myResults;
        }
      } catch (err) {
        console.warn('[MySQL] Error in searchGuestsAsync:', err);
      }
    }

    if (!clean) return this.data!.guests.slice(0, 50);

    // If Postgres is available, combine or query Postgres
    if (postgresAdapter.isAvailable()) {
      const pgResults = await postgresAdapter.searchGuests(clean);
      if (pgResults.length > 0) {
        return pgResults;
      }
    }

    return this.data!.guests.filter(g =>
      (g.nama && g.nama.toLowerCase().includes(clean)) ||
      (g.nrp && g.nrp.toLowerCase().includes(clean)) ||
      (g.no_hp && g.no_hp.includes(clean)) ||
      (g.email && g.email.toLowerCase().includes(clean)) ||
      (g.ticket_id && g.ticket_id.toLowerCase().includes(clean)) ||
      (g.registration_id && g.registration_id.toLowerCase().includes(clean)) ||
      (g.qr_token && g.qr_token.toLowerCase().includes(clean))
    );
  }

  public updateGuest(id: string, updates: Partial<Guest>): Guest | null {
    this.ensureInitialized();
    const idx = this.data!.guests.findIndex(g => g.id === id);
    if (idx === -1) return null;

    const updated = {
      ...this.data!.guests[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.data!.guests[idx] = updated;

    // Synchronize seats
    const seat = this.data!.seats.find(s => s.guest_id === id);
    if (seat) {
      if (updates.nama) seat.guest_name = updates.nama;
      if (updates.pangkat) seat.guest_rank = updates.pangkat;
      if (updates.status_kehadiran) seat.guest_status = updates.status_kehadiran;
    }

    this.persist();

    if (postgresAdapter.isAvailable()) {
      postgresAdapter.saveGuest(updated).catch(console.error);
    }

    if (mysqlAdapter.isConfigured()) {
      mysqlAdapter.updatePeserta(id, {
        nama_lengkap: updated.nama,
        pangkat: updated.pangkat,
        jabatan: updated.jabatan,
        instansi: updated.negara_instansi || updated.satker,
        email: updated.email,
        no_hp: updated.no_hp,
        matra: updated.matra,
        seat_number: updated.seat_number,
        status_hadir: updated.status_kehadiran === 'CHECK_IN' ? 'HADIR' : 'BELUM_HADIR',
      }).catch(err => console.error('[MySQL] updatePeserta error:', err));
      mysqlAdapter.updateGuest(id, updated).catch(err => console.error('[MySQL] updateGuest error:', err));
    }

    console.log("DATA TERSIMPAN:", {
      action: "UPDATE_GUEST",
      id: updated.id,
      nama: updated.nama,
      status: updated.status_kehadiran
    });

    return updated;
  }

  public deleteGuest(id: string): boolean {
    this.ensureInitialized();
    const idx = this.data!.guests.findIndex(g => g.id === id);
    if (idx === -1) return false;

    const guest = this.data!.guests[idx];
    this.data!.guests.splice(idx, 1);

    // Free any seat
    const seat = this.data!.seats.find(s => s.guest_id === id);
    if (seat) {
      seat.guest_id = undefined;
      seat.guest_name = undefined;
      seat.guest_rank = undefined;
      seat.guest_matra = undefined;
      seat.guest_status = undefined;
    }

    // Clean checkin logs
    this.data!.checkin_logs = this.data!.checkin_logs.filter(l => l.guest_id !== id);

    this.persist();

    if (postgresAdapter.isAvailable()) {
      postgresAdapter.deleteGuest(id).catch(err => console.error('[PostgreSQL] deleteGuest error:', err));
    }

    if (mysqlAdapter.isConfigured()) {
      mysqlAdapter.deletePeserta(id).catch(err => console.error('[MySQL] deletePeserta error:', err));
      mysqlAdapter.deleteGuest(id).catch(err => console.error('[MySQL] deleteGuest error:', err));
    }

    console.log("DATA TERHAPUS:", {
      action: "DELETE_GUEST",
      id,
      nama: guest.nama,
    });

    return true;
  }

  // SEATING
  public getSeatGroups(): SeatGroup[] {
    this.ensureInitialized();
    return this.data!.seat_groups;
  }

  public getSeats(): Seat[] {
    this.ensureInitialized();
    return this.data!.seats;
  }

  public assignSeat(seatNumber: string, guestId: string | null): { success: boolean; message: string } {
    this.ensureInitialized();
    const seat = this.data!.seats.find(s => s.seat_number === seatNumber);
    if (!seat) return { success: false, message: 'Nomor kursi tidak ditemukan' };

    // Clear seat currently occupied by this guest
    if (guestId) {
      const oldSeat = this.data!.seats.find(s => s.guest_id === guestId);
      if (oldSeat && oldSeat.seat_number !== seatNumber) {
        oldSeat.guest_id = undefined;
        oldSeat.peserta_id = null;
        oldSeat.guest_name = undefined;
        oldSeat.guest_rank = undefined;
        oldSeat.guest_matra = undefined;
        oldSeat.guest_status = undefined;
        oldSeat.kategori_instansi = undefined;
        oldSeat.colorAlias = null;
        oldSeat.warna = undefined;
        oldSeat.status = 'KOSONG';
      }
    }

    // If seat already occupied by someone else, clear their seat assignment
    if (seat.guest_id && seat.guest_id !== guestId) {
      const prevGuest = this.data!.guests.find(g => g.id === seat.guest_id);
      if (prevGuest) {
        prevGuest.seat_group_id = undefined;
        prevGuest.seat_number = undefined;
      }
    }

    if (guestId) {
      const guest = this.data!.guests.find(g => g.id === guestId);
      if (!guest) return { success: false, message: 'Data tamu tidak ditemukan' };

      const katInstansi = guest.kategori_instansi || getInstansiCategory(guest.matra || guest.satker);
      const colorAlias = guest.warna_kursi || getSeatColorAlias(katInstansi);

      seat.guest_id = guest.id;
      seat.peserta_id = guest.id;
      seat.guest_name = guest.nama;
      seat.guest_rank = guest.pangkat;
      seat.guest_matra = guest.matra;
      seat.guest_status = guest.status_kehadiran;
      seat.kategori_instansi = katInstansi;
      seat.colorAlias = colorAlias;
      seat.warna = colorAlias;
      seat.status = guest.status_kehadiran === 'CHECK_IN' ? 'CHECK_IN' : 'ASSIGNED';
      guest.seat_assignment = seat.seat_number;

      guest.seat_group_id = seat.group_id;
      guest.seat_number = seat.seat_number;
      guest.kategori_instansi = katInstansi;
      guest.warna_kursi = colorAlias;
      guest.seatColorAlias = colorAlias;
    } else {
      seat.guest_id = undefined;
      seat.peserta_id = null;
      seat.guest_name = undefined;
      seat.guest_rank = undefined;
      seat.guest_matra = undefined;
      seat.guest_status = undefined;
      seat.kategori_instansi = undefined;
      seat.colorAlias = null;
      seat.warna = undefined;
      seat.status = 'KOSONG';
    }

    this.persist();

    if (postgresAdapter.isAvailable()) {
      postgresAdapter.saveSeatsAndRooms(this.data!.seats, this.data!.accommodations).catch(console.error);
    }

    return { success: true, message: 'Alokasi kursi berhasil disimpan' };
  }

  // AUTO ASSIGN SEATS
  public autoAssignSeats(): { assignedCount: number } {
    this.ensureInitialized();
    const unseatedGuests = this.data!.guests
      .filter(g => !g.seat_number)
      .sort((a, b) => (a.pangkat_level || 99) - (b.pangkat_level || 99));

    let count = 0;
    for (const g of unseatedGuests) {
      // Find suitable group by level
      let targetCode = 'F';
      if (g.pangkat_level === 1) targetCode = 'A';
      else if (g.pangkat_level <= 3) targetCode = 'B';
      else if (g.pangkat_level === 4) targetCode = 'C';
      else if (g.pangkat_level === 5) targetCode = 'D';
      else if (g.pangkat_level <= 7) targetCode = 'E';

      // Find first empty seat in target group, or any empty seat
      let emptySeat = this.data!.seats.find(s => s.group_code === targetCode && !s.guest_id && !s.is_reserved);
      if (!emptySeat) {
        emptySeat = this.data!.seats.find(s => !s.guest_id && !s.is_reserved);
      }

      if (emptySeat) {
        this.assignSeat(emptySeat.seat_number, g.id);
        count++;
      }
    }

    return { assignedCount: count };
  }

  // ACCOMMODATION
  public getAccommodations(): AccommodationRoom[] {
    this.ensureInitialized();
    return this.data!.accommodations;
  }

  public assignRoom(roomId: string, slot: 'A' | 'B', guestId: string | null): { success: boolean; message: string } {
    this.ensureInitialized();
    const room = this.data!.accommodations.find(r => r.id === roomId);
    if (!room) return { success: false, message: 'Kamar tidak ditemukan' };

    // Clear previous room for this guest
    if (guestId) {
      for (const r of this.data!.accommodations) {
        if (r.slot_a_guest_id === guestId) {
          r.slot_a_guest_id = undefined;
          r.slot_a_guest_name = undefined;
          r.slot_a_guest_rank = undefined;
          r.slot_a_guest_matra = undefined;
        }
        if (r.slot_b_guest_id === guestId) {
          r.slot_b_guest_id = undefined;
          r.slot_b_guest_name = undefined;
          r.slot_b_guest_rank = undefined;
          r.slot_b_guest_matra = undefined;
        }
      }
    }

    if (slot === 'A') {
      if (guestId) {
        const guest = this.data!.guests.find(g => g.id === guestId);
        if (!guest) return { success: false, message: 'Tamu tidak ditemukan' };
        room.slot_a_guest_id = guest.id;
        room.slot_a_guest_name = guest.nama;
        room.slot_a_guest_rank = guest.pangkat;
        room.slot_a_guest_matra = guest.matra;
        guest.room_id = roomId;
        guest.room_slot = 'A';
      } else {
        if (room.slot_a_guest_id) {
          const prev = this.data!.guests.find(g => g.id === room.slot_a_guest_id);
          if (prev) {
            prev.room_id = undefined;
            prev.room_slot = undefined;
          }
        }
        room.slot_a_guest_id = undefined;
        room.slot_a_guest_name = undefined;
        room.slot_a_guest_rank = undefined;
        room.slot_a_guest_matra = undefined;
      }
    } else {
      if (guestId) {
        const guest = this.data!.guests.find(g => g.id === guestId);
        if (!guest) return { success: false, message: 'Tamu tidak ditemukan' };
        room.slot_b_guest_id = guest.id;
        room.slot_b_guest_name = guest.nama;
        room.slot_b_guest_rank = guest.pangkat;
        room.slot_b_guest_matra = guest.matra;
        guest.room_id = roomId;
        guest.room_slot = 'B';
      } else {
        if (room.slot_b_guest_id) {
          const prev = this.data!.guests.find(g => g.id === room.slot_b_guest_id);
          if (prev) {
            prev.room_id = undefined;
            prev.room_slot = undefined;
          }
        }
        room.slot_b_guest_id = undefined;
        room.slot_b_guest_name = undefined;
        room.slot_b_guest_rank = undefined;
        room.slot_b_guest_matra = undefined;
      }
    }

    this.persist();

    if (postgresAdapter.isAvailable()) {
      postgresAdapter.saveSeatsAndRooms(this.data!.seats, this.data!.accommodations).catch(console.error);
      if (guestId) {
        const updatedG = this.data!.guests.find(g => g.id === guestId);
        if (updatedG) postgresAdapter.saveGuest(updatedG).catch(console.error);
      }
    }

    return { success: true, message: 'Penempatan kamar berhasil disimpan' };
  }

  // ==========================================================
  // ASSIGNMENTS (POST CHECK-IN SEAT & WISMA ALLOCATION)
  // ==========================================================
  public getAssignments(): Assignment[] {
    this.ensureInitialized();
    return this.data!.assignments || [];
  }

  public findAssignmentByGuestId(guestId: string): Assignment | undefined {
    this.ensureInitialized();
    if (!this.data!.assignments) this.data!.assignments = [];
    return this.data!.assignments.find(a => a.peserta_id === guestId);
  }

  public saveAssignment(assignment: Assignment): Assignment {
    this.ensureInitialized();
    if (!this.data!.assignments) this.data!.assignments = [];
    const idx = this.data!.assignments.findIndex(a => a.peserta_id === assignment.peserta_id);
    if (idx >= 0) {
      this.data!.assignments[idx] = assignment;
    } else {
      this.data!.assignments.push(assignment);
    }
    this.persist();

    // Background sync to Postgres & MySQL if available
    if (postgresAdapter.isAvailable()) {
      postgresAdapter.saveAssignment(assignment).catch(err => {
        console.warn('[PostgreSQL] Error saving assignment:', err);
      });
    }
    if (mysqlAdapter.isConfigured()) {
      mysqlAdapter.saveAssignment(assignment).catch(err => {
        console.warn('[MySQL] Error saving assignment:', err);
      });
    }

    return assignment;
  }

  // CHECKIN & SCANNING
  public getCheckpoints(): Checkpoint[] {
    this.ensureInitialized();
    return this.data!.checkpoints;
  }

  public getCheckinLogs(limit: number = 50): CheckinLog[] {
    this.ensureInitialized();
    return this.data!.checkin_logs.slice(0, limit);
  }

  public async getCheckinLogsAsync(limit: number = 50): Promise<CheckinLog[]> {
    this.ensureInitialized();
    if (postgresAdapter.isAvailable()) {
      try {
        const pgLogs = await postgresAdapter.getAllCheckinLogs();
        if (pgLogs && pgLogs.length > 0) {
          this.data!.checkin_logs = pgLogs;
          return pgLogs.slice(0, limit);
        }
      } catch (err) {
        console.warn('[PostgreSQL] Error in getCheckinLogsAsync:', err);
      }
    }
    return this.data!.checkin_logs.slice(0, limit);
  }

  public recordCheckin(guestId: string, checkpointCode: string, adminUser?: { id: string; nama: string }, ip?: string): {
    success: boolean;
    alreadyCheckedIn: boolean;
    guest: Guest;
    log: CheckinLog;
    previousTimestamp?: string;
  } {
    this.ensureInitialized();
    const guest = this.data!.guests.find(g => g.id === guestId);
    if (!guest) throw new Error('Data tamu tidak ditemukan');

    const cp = this.data!.checkpoints.find(c => c.code === checkpointCode) || this.data!.checkpoints[0];

    // Check if previously checked in
    const isAlreadyCheckedIn = guest.status_kehadiran === 'CHECK-IN' || guest.status_kehadiran === 'CHECK_IN' || (guest.status_kehadiran as any) === 'HADIR';
    const existingLog = this.data!.checkin_logs.find(l => l.guest_id === guestId);
    const now = new Date().toISOString();

    const log: CheckinLog = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      guest_id: guest.id,
      guest_nama: guest.nama,
      guest_nrp: guest.nrp || '-',
      guest_pangkat: guest.pangkat,
      guest_matra: guest.matra,
      checkpoint_code: cp.code,
      checkpoint_name: cp.name,
      scanned_by_admin_id: adminUser?.id,
      scanned_by_admin_name: adminUser?.nama || 'Petugas Check-In',
      scanned_at: now,
      ip_address: ip
    };

    if (!isAlreadyCheckedIn) {
      this.data!.checkin_logs.unshift(log);

      // Update guest presence
      guest.status_kehadiran = 'CHECK-IN';
      if (!guest.waktu_kehadiran_pertama) {
        guest.waktu_kehadiran_pertama = now;
      }
      guest.updated_at = now;

      // Update seat presence to CHECK_IN (Never modify or overwrite seat assignment)
      const checkinSeat = this.data!.seats.find(s => s.guest_id === guest.id || s.peserta_id === guest.id || (guest.seat_number && s.seat_number === guest.seat_number));
      if (checkinSeat) {
        checkinSeat.guest_status = 'CHECK_IN';
        checkinSeat.status = 'CHECK_IN';
        checkinSeat.guest_id = guest.id;
        checkinSeat.peserta_id = guest.id;
      }

      this.persist();

      if (postgresAdapter.isAvailable()) {
        postgresAdapter.saveCheckinLog(log).catch(console.error);
        postgresAdapter.saveGuest(guest).catch(console.error);
        postgresAdapter.saveSeatsAndRooms(this.data!.seats, this.data!.accommodations).catch(console.error);
      }
    }

    console.log("DATA TERSIMPAN:", {
      type: "CHECKIN_LOG",
      id: log.id,
      guest_id: log.guest_id,
      checkpoint: log.checkpoint_name,
      timestamp: log.scanned_at
    });

    return {
      success: true,
      alreadyCheckedIn: isAlreadyCheckedIn,
      guest,
      log,
      previousTimestamp: existingLog?.scanned_at || guest.waktu_kehadiran_pertama || undefined
    };
  }

  // STATS
  public getStats() {
    this.ensureInitialized();
    const guests = this.data!.guests;
    const totalGuests = guests.length;
    const presentGuests = guests.filter(g => g.status_kehadiran === 'CHECK-IN' || g.status_kehadiran === 'CHECK_IN' || (g.status_kehadiran as any) === 'HADIR').length;
    const absentGuests = totalGuests - presentGuests;
    const percentagePresent = totalGuests > 0 ? Math.round((presentGuests / totalGuests) * 100) : 0;

    const accommodationNeeded = guests.filter(g => g.butuh_akomodasi === 1).length;
    const accommodationAssigned = guests.filter(g => g.butuh_akomodasi === 1 && g.room_id).length;

    // Matra breakdown
    const matraCount: Record<string, number> = { AD: 0, AL: 0, AU: 0, MABES: 0, NON_TNI: 0 };
    for (const g of guests) {
      if (matraCount[g.matra] !== undefined) {
        matraCount[g.matra]++;
      }
    }

    // Pangkat breakdown
    const pangkatCount: Record<string, number> = { PATI: 0, PAMEN: 0, PAMA: 0, BINTARA_TAMTAMA: 0, SIPIL: 0 };
    for (const g of guests) {
      if (g.pangkat_level <= 4 && g.matra !== 'NON_TNI') pangkatCount.PATI++;
      else if (g.pangkat_level <= 7 && g.matra !== 'NON_TNI') pangkatCount.PAMEN++;
      else if (g.pangkat_level <= 10 && g.matra !== 'NON_TNI') pangkatCount.PAMA++;
      else if (g.pangkat_level > 10 && g.matra !== 'NON_TNI') pangkatCount.BINTARA_TAMTAMA++;
      else pangkatCount.SIPIL++;
    }

    // Seats filled
    const totalSeats = this.data!.seats.length;
    const occupiedSeats = this.data!.seats.filter(s => !!s.guest_id).length;

    return {
      totalGuests,
      presentGuests,
      absentGuests,
      percentagePresent,
      accommodationNeeded,
      accommodationAssigned,
      totalSeats,
      occupiedSeats,
      matraCount,
      pangkatCount,
      recentLogs: this.data!.checkin_logs.slice(0, 10)
    };
  }

  public async getStatsAsync() {
    this.ensureInitialized();
    if (postgresAdapter.isAvailable()) {
      try {
        const pgGuests = await postgresAdapter.getAllGuests();
        if (pgGuests && pgGuests.length > 0) {
          this.data!.guests = pgGuests;
        }
      } catch (err) {
        console.warn('[PostgreSQL] Error in getStatsAsync:', err);
      }
    }
    return this.getStats();
  }

  // ADMINS & AUTH
  public findAdminByUsername(username: string): AdminUser | undefined {
    this.ensureInitialized();
    return this.data!.admins.find(a => a.username === username);
  }

  public recordAuditLog(adminId: string, username: string, action: string, details?: string, ip?: string) {
    this.ensureInitialized();
    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      admin_id: adminId,
      admin_username: username,
      action,
      details,
      ip_address: ip,
      created_at: new Date().toISOString()
    };
    this.data!.audit_logs.unshift(log);
    this.persist();
  }

  // EMAIL LOGS
  public addEmailLog(log: Omit<EmailLog, 'id' | 'sent_at'> & { sent_at?: string }): EmailLog {
    this.ensureInitialized();
    if (!this.data!.email_logs) {
      this.data!.email_logs = [];
    }

    const newLog: EmailLog = {
      id: `elog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      guest_id: log.guest_id,
      email: log.email,
      subject: log.subject,
      status: log.status,
      error_message: log.error_message,
      message_id: log.message_id,
      provider: log.provider,
      sent_at: log.sent_at || new Date().toISOString()
    };

    this.data!.email_logs.unshift(newLog);
    // Retain maximum 500 email logs to prevent JSON file bloat
    if (this.data!.email_logs.length > 500) {
      this.data!.email_logs = this.data!.email_logs.slice(0, 500);
    }
    this.persist();

    return newLog;
  }

  public getEmailLogs(guestId?: string, limit: number = 50): EmailLog[] {
    this.ensureInitialized();
    if (!this.data!.email_logs) {
      this.data!.email_logs = [];
    }
    if (guestId) {
      return this.data!.email_logs.filter(l => l.guest_id === guestId).slice(0, limit);
    }
    return this.data!.email_logs.slice(0, limit);
  }

  public async getEmailLogsAsync(guestId?: string, limit: number = 50): Promise<EmailLog[]> {
    return this.getEmailLogs(guestId, limit);
  }
}

export const db = new DatabaseManager();
