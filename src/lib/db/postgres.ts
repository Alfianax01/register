import { Pool } from 'pg';
import { Guest, Seat, AccommodationRoom, CheckinLog, AdminUser, AuditLog, SeatGroup } from '@/types';

class PostgresAdapter {
  private pool: Pool | null = null;
  private isConnected: boolean = false;
  private initPromise: Promise<boolean> | null = null;

  constructor() {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (connectionString) {
      try {
        this.pool = new Pool({
          connectionString,
          ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });
      } catch (err) {
        console.error('Gagal inisialisasi PostgreSQL Pool:', err);
      }
    }
  }

  public isAvailable(): boolean {
    return !!this.pool;
  }

  public async ensureTables(): Promise<boolean> {
    if (!this.pool) return false;
    if (this.isConnected) return true;

    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const client = await this.pool!.connect();
        try {
          await client.query(`
            CREATE TABLE IF NOT EXISTS tni_guests (
              id VARCHAR(100) PRIMARY KEY,
              registration_id VARCHAR(50),
              ticket_id VARCHAR(50),
              nrp VARCHAR(50),
              nama VARCHAR(255) NOT NULL,
              gelar_depan VARCHAR(50),
              gelar_belakang VARCHAR(50),
              matra VARCHAR(20) NOT NULL,
              pangkat VARCHAR(100) NOT NULL,
              pangkat_level INT DEFAULT 10,
              jabatan VARCHAR(255) NOT NULL,
              satker VARCHAR(255) NOT NULL,
              satuan VARCHAR(255),
              negara_instansi VARCHAR(255),
              no_hp VARCHAR(50) NOT NULL,
              email VARCHAR(100),
              butuh_akomodasi INT DEFAULT 0,
              tgl_checkin VARCHAR(20),
              tgl_checkout VARCHAR(20),
              catatan_khusus TEXT,
              seat_group_id VARCHAR(50),
              seat_number VARCHAR(50),
              room_id VARCHAR(100),
              room_slot VARCHAR(10),
              qr_token VARCHAR(100) UNIQUE NOT NULL,
              token_hash VARCHAR(100),
              status_kehadiran VARCHAR(20) DEFAULT 'BELUM_HADIR',
              waktu_kehadiran_pertama VARCHAR(50),
              created_at VARCHAR(50),
              updated_at VARCHAR(50)
            );

            CREATE TABLE IF NOT EXISTS tni_checkin_logs (
              id VARCHAR(100) PRIMARY KEY,
              guest_id VARCHAR(100),
              guest_nama VARCHAR(255),
              guest_nrp VARCHAR(50),
              guest_pangkat VARCHAR(100),
              guest_matra VARCHAR(20),
              checkpoint_code VARCHAR(50),
              checkpoint_name VARCHAR(100),
              scanned_by_admin_id VARCHAR(100),
              scanned_by_admin_name VARCHAR(100),
              scanned_at VARCHAR(50),
              ip_address VARCHAR(50)
            );

            CREATE TABLE IF NOT EXISTS tni_state (
              key VARCHAR(50) PRIMARY KEY,
              value JSONB NOT NULL,
              updated_at VARCHAR(50)
            );

            CREATE INDEX IF NOT EXISTS idx_tni_guests_token ON tni_guests(qr_token);
            CREATE INDEX IF NOT EXISTS idx_tni_guests_nrp ON tni_guests(nrp);
            CREATE INDEX IF NOT EXISTS idx_tni_guests_phone ON tni_guests(no_hp);
            CREATE INDEX IF NOT EXISTS idx_tni_guests_email ON tni_guests(email);
          `);
          this.isConnected = true;
          console.log('[PostgreSQL] Database persistence tables verified & connected.');
          return true;
        } finally {
          client.release();
        }
      } catch (err) {
        console.error('[PostgreSQL] Connection / Table init warning:', err);
        return false;
      }
    })();

    return this.initPromise;
  }

  public async saveGuest(guest: Guest): Promise<boolean> {
    if (!this.pool) return false;
    try {
      await this.ensureTables();
      const query = `
        INSERT INTO tni_guests (
          id, registration_id, ticket_id, nrp, nama, gelar_depan, gelar_belakang,
          matra, pangkat, pangkat_level, jabatan, satker, satuan, negara_instansi,
          no_hp, email, butuh_akomodasi, tgl_checkin, tgl_checkout, catatan_khusus,
          seat_group_id, seat_number, room_id, room_slot, qr_token, token_hash,
          status_kehadiran, waktu_kehadiran_pertama, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26,
          $27, $28, $29, $30
        )
        ON CONFLICT (id) DO UPDATE SET
          nama = EXCLUDED.nama,
          pangkat = EXCLUDED.pangkat,
          jabatan = EXCLUDED.jabatan,
          seat_number = EXCLUDED.seat_number,
          room_id = EXCLUDED.room_id,
          room_slot = EXCLUDED.room_slot,
          status_kehadiran = EXCLUDED.status_kehadiran,
          waktu_kehadiran_pertama = EXCLUDED.waktu_kehadiran_pertama,
          updated_at = EXCLUDED.updated_at;
      `;
      await this.pool.query(query, [
        guest.id,
        guest.registration_id || null,
        guest.ticket_id || null,
        guest.nrp,
        guest.nama,
        guest.gelar_depan || null,
        guest.gelar_belakang || null,
        guest.matra,
        guest.pangkat,
        guest.pangkat_level || 10,
        guest.jabatan,
        guest.satker,
        guest.satuan || null,
        guest.negara_instansi || null,
        guest.no_hp,
        guest.email || null,
        guest.butuh_akomodasi ? 1 : 0,
        guest.tgl_checkin || null,
        guest.tgl_checkout || null,
        guest.catatan_khusus || null,
        guest.seat_group_id || null,
        guest.seat_number || null,
        guest.room_id || null,
        guest.room_slot || null,
        guest.qr_token,
        guest.token_hash || null,
        guest.status_kehadiran || 'BELUM_HADIR',
        guest.waktu_kehadiran_pertama || null,
        guest.created_at,
        guest.updated_at
      ]);
      console.log('[PostgreSQL] DATA TERSIMPAN KE DATABASE PERMANEN:', { id: guest.id, nrp: guest.nrp, token: guest.qr_token });
      return true;
    } catch (err) {
      console.error('[PostgreSQL] DATA ERROR SAAT SIMPAN KE DATABASE:', err);
      return false;
    }
  }

  public async getAllGuests(): Promise<Guest[] | null> {
    if (!this.pool) return null;
    try {
      await this.ensureTables();
      const res = await this.pool.query('SELECT * FROM tni_guests ORDER BY created_at DESC');
      return res.rows.map(r => ({
        id: r.id,
        registration_id: r.registration_id,
        ticket_id: r.ticket_id,
        nrp: r.nrp,
        nama: r.nama,
        gelar_depan: r.gelar_depan || '',
        gelar_belakang: r.gelar_belakang || '',
        matra: r.matra,
        pangkat: r.pangkat,
        pangkat_level: r.pangkat_level,
        jabatan: r.jabatan,
        satker: r.satker,
        satuan: r.satuan,
        negara_instansi: r.negara_instansi,
        no_hp: r.no_hp,
        email: r.email,
        butuh_akomodasi: r.butuh_akomodasi ? 1 : 0,
        tgl_checkin: r.tgl_checkin,
        tgl_checkout: r.tgl_checkout,
        catatan_khusus: r.catatan_khusus,
        seat_group_id: r.seat_group_id,
        seat_number: r.seat_number,
        room_id: r.room_id,
        room_slot: r.room_slot,
        qr_token: r.qr_token,
        token_hash: r.token_hash,
        status_kehadiran: r.status_kehadiran,
        waktu_kehadiran_pertama: r.waktu_kehadiran_pertama,
        created_at: r.created_at,
        updated_at: r.updated_at
      }));
    } catch (err) {
      console.error('[PostgreSQL] Gagal membaca tamu dari database:', err);
      return null;
    }
  }

  public async saveCheckinLog(log: CheckinLog): Promise<boolean> {
    if (!this.pool) return false;
    try {
      await this.ensureTables();
      await this.pool.query(`
        INSERT INTO tni_checkin_logs (
          id, guest_id, guest_nama, guest_nrp, guest_pangkat, guest_matra,
          checkpoint_code, checkpoint_name, scanned_by_admin_id, scanned_by_admin_name,
          scanned_at, ip_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING;
      `, [
        log.id,
        log.guest_id,
        log.guest_nama,
        log.guest_nrp,
        log.guest_pangkat,
        log.guest_matra,
        log.checkpoint_code,
        log.checkpoint_name,
        log.scanned_by_admin_id || null,
        log.scanned_by_admin_name || null,
        log.scanned_at,
        log.ip_address || null
      ]);
      return true;
    } catch (err) {
      console.error('[PostgreSQL] Gagal mencatat log checkin:', err);
      return false;
    }
  }

  public async saveSeatsAndRooms(seats: Seat[], rooms: AccommodationRoom[]): Promise<boolean> {
    if (!this.pool) return false;
    try {
      await this.ensureTables();
      await this.pool.query(`
        INSERT INTO tni_state (key, value, updated_at)
        VALUES ('seats_and_rooms', $1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;
      `, [JSON.stringify({ seats, rooms }), new Date().toISOString()]);
      return true;
    } catch (err) {
      console.error('[PostgreSQL] Gagal menyimpan status kursi & wisma:', err);
      return false;
    }
  }

  public async getSeatsAndRooms(): Promise<{ seats: Seat[]; rooms: AccommodationRoom[] } | null> {
    if (!this.pool) return null;
    try {
      await this.ensureTables();
      const res = await this.pool.query("SELECT value FROM tni_state WHERE key = 'seats_and_rooms'");
      if (res.rows.length > 0 && res.rows[0].value) {
        return res.rows[0].value;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const postgresAdapter = new PostgresAdapter();

