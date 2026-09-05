import { Pool } from 'pg';
import { Guest, Seat, AccommodationRoom, CheckinLog } from '@/types';

class PostgresAdapter {
  private pool: Pool | null = null;
  private isConnected: boolean = false;
  private initPromise: Promise<boolean> | null = null;

  constructor() {
    this.getPool();
  }

  private getPool(): Pool | null {
    if (this.pool) return this.pool;
    const connectionString = 
      process.env.DATABASE_URL || 
      process.env.POSTGRES_URL || 
      process.env.POSTGRES_PRISMA_URL || 
      process.env.POSTGRES_URL_NON_POOLING;

    if (connectionString) {
      try {
        const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
        this.pool = new Pool({
          connectionString,
          ssl: isLocal ? false : { rejectUnauthorized: false },
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });
        console.log('[PostgreSQL] Database Pool terinisialisasi untuk Vercel Serverless / Cloud.');
      } catch (err) {
        console.error('[PostgreSQL] Gagal inisialisasi Pool:', err);
      }
    }
    return this.pool;
  }

  public isAvailable(): boolean {
    return !!this.getPool();
  }

  public async ensureTables(): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    if (this.isConnected) return true;

    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const client = await pool.connect();
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
              email VARCHAR(255),
              email_sent BOOLEAN DEFAULT FALSE,
              butuh_akomodasi INT DEFAULT 0,
              tgl_checkin VARCHAR(50),
              tgl_checkout VARCHAR(50),
              catatan_khusus TEXT,
              seat_group_id VARCHAR(50),
              seat_number VARCHAR(50),
              room_id VARCHAR(50),
              room_slot VARCHAR(10),
              qr_token VARCHAR(100) UNIQUE NOT NULL,
              token_hash VARCHAR(100),
              status_kehadiran VARCHAR(20) DEFAULT 'BELUM_HADIR',
              waktu_kehadiran_pertama VARCHAR(50),
              created_at VARCHAR(50),
              updated_at VARCHAR(50)
            );

            -- Auto-migration column for existing databases
            ALTER TABLE tni_guests ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;

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
            CREATE INDEX IF NOT EXISTS idx_tni_guests_ticket ON tni_guests(ticket_id);
            CREATE INDEX IF NOT EXISTS idx_tni_guests_reg_id ON tni_guests(registration_id);
            CREATE INDEX IF NOT EXISTS idx_tni_guests_nrp ON tni_guests(nrp);
            CREATE INDEX IF NOT EXISTS idx_tni_guests_phone ON tni_guests(no_hp);
            CREATE INDEX IF NOT EXISTS idx_tni_guests_email ON tni_guests(email);
            CREATE INDEX IF NOT EXISTS idx_tni_guests_status ON tni_guests(status_kehadiran);
            CREATE INDEX IF NOT EXISTS idx_tni_checkin_guest_id ON tni_checkin_logs(guest_id);
            CREATE INDEX IF NOT EXISTS idx_tni_checkin_scanned_at ON tni_checkin_logs(scanned_at);
          `);
          this.isConnected = true;
          console.log('[PostgreSQL] Database persistence tables verified & connected successfully.');
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

  private mapRowToGuest(r: any): Guest {
    return {
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
      emailSent: r.email_sent === true,
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
    };
  }

  public async saveGuest(guest: Guest, maxRetries: number = 3): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let client = null;
      try {
        await this.ensureTables();
        client = await pool.connect();
        await client.query('BEGIN');

        const query = `
          INSERT INTO tni_guests (
            id, registration_id, ticket_id, nrp, nama, gelar_depan, gelar_belakang,
            matra, pangkat, pangkat_level, jabatan, satker, satuan, negara_instansi,
            no_hp, email, email_sent, butuh_akomodasi, tgl_checkin, tgl_checkout,
            catatan_khusus, seat_group_id, seat_number, room_id, room_slot,
            qr_token, token_hash,
            status_kehadiran, waktu_kehadiran_pertama, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13, $14,
            $15, $16, $17, $18, $19, $20, $21,
            $22, $23, $24, $25, $26, $27,
            $28, $29, $30, $31
          )
          ON CONFLICT (id) DO UPDATE SET
            nama = EXCLUDED.nama,
            gelar_depan = EXCLUDED.gelar_depan,
            gelar_belakang = EXCLUDED.gelar_belakang,
            pangkat = EXCLUDED.pangkat,
            jabatan = EXCLUDED.jabatan,
            satker = EXCLUDED.satker,
            satuan = EXCLUDED.satuan,
            no_hp = EXCLUDED.no_hp,
            email = EXCLUDED.email,
            email_sent = EXCLUDED.email_sent,
            seat_number = EXCLUDED.seat_number,
            seat_group_id = EXCLUDED.seat_group_id,
            room_id = EXCLUDED.room_id,
            room_slot = EXCLUDED.room_slot,
            status_kehadiran = EXCLUDED.status_kehadiran,
            waktu_kehadiran_pertama = EXCLUDED.waktu_kehadiran_pertama,
            updated_at = EXCLUDED.updated_at;
        `;
        await client.query(query, [
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
          guest.emailSent ? true : false,
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

        await client.query('COMMIT');

        // Post-Insert Verification
        const verifyRes = await client.query('SELECT id, nrp, qr_token FROM tni_guests WHERE id = $1', [guest.id]);
        if (verifyRes.rowCount && verifyRes.rowCount > 0) {
          console.log('[PostgreSQL] DATA TERSIMPAN & TERVERIFIKASI KE DATABASE CLOUD:', {
            id: guest.id,
            nrp: guest.nrp,
            token: guest.qr_token,
            attempt
          });
          return true;
        }
      } catch (err: any) {
        if (client) {
          try { await client.query('ROLLBACK'); } catch {}
        }
        console.warn(`[PostgreSQL] Gagal simpan tamu pada percobaan ${attempt}/${maxRetries}:`, err?.message || err);
        if (attempt >= maxRetries) {
          console.error('[PostgreSQL] DATA ERROR: Seluruh percobaan simpan ke PostgreSQL gagal.', err);
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, attempt * 300));
      } finally {
        if (client) client.release();
      }
    }
    return false;
  }

  public async updateGuest(id: string, updates: Partial<Guest>): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    try {
      await this.ensureTables();
      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const mapping: Record<string, string> = {
        emailSent: 'email_sent',
        status_kehadiran: 'status_kehadiran',
        seat_number: 'seat_number',
        seat_group_id: 'seat_group_id',
        room_id: 'room_id',
        room_slot: 'room_slot',
        waktu_kehadiran_pertama: 'waktu_kehadiran_pertama',
        nama: 'nama',
        gelar_depan: 'gelar_depan',
        gelar_belakang: 'gelar_belakang',
        pangkat: 'pangkat',
        jabatan: 'jabatan',
        satker: 'satker',
        satuan: 'satuan',
        negara_instansi: 'negara_instansi',
        no_hp: 'no_hp',
        email: 'email',
        nrp: 'nrp',
        matra: 'matra',
        catatan_khusus: 'catatan_khusus'
      };

      for (const [key, val] of Object.entries(updates)) {
        if (key === 'id') continue;
        const col = mapping[key] || key;
        fields.push(`${col} = $${idx}`);
        values.push(val);
        idx++;
      }

      fields.push(`updated_at = $${idx}`);
      values.push(new Date().toISOString());
      idx++;

      values.push(id);

      await pool.query(
        `UPDATE tni_guests SET ${fields.join(', ')} WHERE id = $${idx}`,
        values
      );
      return true;
    } catch (err) {
      console.error('[PostgreSQL] Gagal update tamu:', err);
      return false;
    }
  }

  public async deleteGuest(id: string): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    try {
      await this.ensureTables();
      await pool.query('DELETE FROM tni_guests WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.error('[PostgreSQL] Gagal menghapus tamu:', err);
      return false;
    }
  }

  public async verifyGuestSaved(id: string): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    try {
      await this.ensureTables();
      const res = await pool.query('SELECT id FROM tni_guests WHERE id = $1', [id]);
      return !!(res.rowCount && res.rowCount > 0);
    } catch {
      return false;
    }
  }

  public async findGuestById(id: string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool || !id) return null;
    try {
      await this.ensureTables();
      const res = await pool.query('SELECT * FROM tni_guests WHERE id = $1 LIMIT 1', [id.trim()]);
      if (res.rows.length > 0) {
        return this.mapRowToGuest(res.rows[0]);
      }
      return null;
    } catch (err) {
      console.warn('[PostgreSQL] Query findGuestById notice:', err);
      return null;
    }
  }

  public async findGuestByToken(token: string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool || !token) return null;
    try {
      await this.ensureTables();
      const cleanToken = token.trim();
      const res = await pool.query(
        'SELECT * FROM tni_guests WHERE qr_token = $1 OR ticket_id = $1 OR registration_id = $1 OR id = $1 LIMIT 1',
        [cleanToken]
      );
      if (res.rows.length > 0) {
        return this.mapRowToGuest(res.rows[0]);
      }
      return null;
    } catch (err) {
      console.warn('[PostgreSQL] Query findGuestByToken notice:', err);
      return null;
    }
  }

  public async findGuestByNRP(nrp: string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool || !nrp) return null;
    try {
      await this.ensureTables();
      const clean = String(nrp).trim();
      const res = await pool.query(
        'SELECT * FROM tni_guests WHERE LOWER(nrp) = LOWER($1) LIMIT 1',
        [clean]
      );
      if (res.rows.length > 0) {
        return this.mapRowToGuest(res.rows[0]);
      }
      return null;
    } catch (err) {
      console.warn('[PostgreSQL] Query findGuestByNRP notice:', err);
      return null;
    }
  }

  public async findGuestByPhone(phone: string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool || !phone) return null;
    try {
      await this.ensureTables();
      let clean = String(phone).trim().replace(/[\s\-\(\)\+]/g, '');
      if (clean.startsWith('62')) clean = '0' + clean.slice(2);
      const res = await pool.query(
        "SELECT * FROM tni_guests WHERE REPLACE(REPLACE(REPLACE(no_hp, ' ', ''), '-', ''), '+', '') LIKE $1 LIMIT 1",
        [`%${clean.slice(-8)}%`]
      );
      if (res.rows.length > 0) {
        return this.mapRowToGuest(res.rows[0]);
      }
      return null;
    } catch (err) {
      console.warn('[PostgreSQL] Query findGuestByPhone notice:', err);
      return null;
    }
  }

  public async findGuestByEmail(email: string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool || !email) return null;
    try {
      await this.ensureTables();
      const clean = String(email).trim().toLowerCase();
      const res = await pool.query(
        'SELECT * FROM tni_guests WHERE LOWER(email) = $1 LIMIT 1',
        [clean]
      );
      if (res.rows.length > 0) {
        return this.mapRowToGuest(res.rows[0]);
      }
      return null;
    } catch (err) {
      console.warn('[PostgreSQL] Query findGuestByEmail notice:', err);
      return null;
    }
  }

  public async searchGuests(searchTerm: string): Promise<Guest[]> {
    const pool = this.getPool();
    if (!pool) return [];
    try {
      await this.ensureTables();
      const term = `%${searchTerm.trim().toLowerCase()}%`;
      const res = await pool.query(`
        SELECT * FROM tni_guests 
        WHERE LOWER(nama) LIKE $1 
           OR LOWER(nrp) LIKE $1 
           OR LOWER(no_hp) LIKE $1 
           OR LOWER(email) LIKE $1 
           OR LOWER(satker) LIKE $1 
           OR LOWER(jabatan) LIKE $1 
           OR qr_token = $2
        ORDER BY created_at DESC 
        LIMIT 100
      `, [term, searchTerm.trim()]);
      return res.rows.map(r => this.mapRowToGuest(r));
    } catch (err) {
      console.warn('[PostgreSQL] Query searchGuests notice:', err);
      return [];
    }
  }

  public async getAllGuests(): Promise<Guest[] | null> {
    const pool = this.getPool();
    if (!pool) return null;
    try {
      await this.ensureTables();
      const res = await pool.query('SELECT * FROM tni_guests ORDER BY created_at DESC');
      return res.rows.map(r => this.mapRowToGuest(r));
    } catch (err) {
      console.error('[PostgreSQL] Gagal membaca tamu dari database:', err);
      return null;
    }
  }

  public async saveCheckinLog(log: CheckinLog): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    try {
      await this.ensureTables();
      await pool.query(`
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

  public async getAllCheckinLogs(): Promise<CheckinLog[]> {
    const pool = this.getPool();
    if (!pool) return [];
    try {
      await this.ensureTables();
      const res = await pool.query('SELECT * FROM tni_checkin_logs ORDER BY scanned_at DESC LIMIT 200');
      return res.rows.map(r => ({
        id: r.id,
        guest_id: r.guest_id,
        guest_nama: r.guest_nama,
        guest_nrp: r.guest_nrp,
        guest_pangkat: r.guest_pangkat,
        guest_matra: r.guest_matra,
        checkpoint_code: r.checkpoint_code,
        checkpoint_name: r.checkpoint_name,
        scanned_by_admin_id: r.scanned_by_admin_id,
        scanned_by_admin_name: r.scanned_by_admin_name,
        scanned_at: r.scanned_at,
        ip_address: r.ip_address
      }));
    } catch (err) {
      console.error('[PostgreSQL] Gagal membaca log checkin:', err);
      return [];
    }
  }

  public async saveSeatsAndRooms(seats: Seat[], rooms: AccommodationRoom[]): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    try {
      await this.ensureTables();
      await pool.query(`
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
    const pool = this.getPool();
    if (!pool) return null;
    try {
      await this.ensureTables();
      const res = await pool.query("SELECT value FROM tni_state WHERE key = 'seats_and_rooms'");
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
