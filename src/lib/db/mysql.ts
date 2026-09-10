import mysql from 'mysql2/promise';
import {
  Guest,
  Seat,
  AccommodationRoom,
  CheckinLog,
  AdminUser,
  EmailLog,
  MatraType
} from '@/types';
import { getInstansiCategory, getSeatColorAlias } from '@/lib/constants/matra-colors';
import bcrypt from 'bcryptjs';

export interface PesertaRow {
  id: number | string;
  registration_id: string;
  nama: string;
  email: string;
  phone: string | null;
  matra: string | null;
  pangkat: string | null;
  nrp: string | null;
  jabatan: string | null;
  kesatuan: string | null;
  status_kehadiran: 'REGISTRASI' | 'CHECK_IN';
  seat_number: string | null;
  seat_block: string | null;
  building: string | null;
  room_name: string | null;
  wisma_name: string | null;
  room_number: string | null;
  bed_number: string | null;
  status_akomodasi: string | null;
  checkin_gate: string | null;
  checkin_time: string | Date | null;
  email_status: string | null;
  qr_token: string | null;
  email_retry_count?: number;
  last_email_error?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
}

function rowToGuest(r: any): Guest {
  const isCheckIn = r.status_kehadiran === 'CHECK_IN' || r.status === 'CHECK_IN';
  const matraVal = (r.matra || 'AD') as MatraType;
  const kategori_instansi = getInstansiCategory(matraVal);
  const warna_kursi = getSeatColorAlias(kategori_instansi);
  const wantsStay = r.status_akomodasi === 'MENGINAP' || (r.wisma_name && r.wisma_name !== 'Tidak Menginap');

  const formattedCheckinTime = r.checkin_time 
    ? (r.checkin_time instanceof Date ? r.checkin_time.toISOString() : String(r.checkin_time))
    : undefined;

  return {
    id: String(r.id),
    registration_id: r.registration_id || `REG-2026-${String(r.id).padStart(6, '0')}`,
    nrp: r.nrp || '-',
    nama: r.nama || r.nama_lengkap || '',
    matra: matraVal,
    pangkat: r.pangkat || 'Perwira',
    pangkat_level: 5,
    jabatan: r.jabatan || '-',
    satker: r.kesatuan || r.satker || '-',
    satuan: r.kesatuan || r.satuan || '-',
    negara_instansi: r.negara_instansi || 'Indonesia / TNI',
    no_hp: r.phone || r.no_hp || undefined,
    phone: r.phone || r.no_hp || undefined,
    kesatuan: r.kesatuan || r.satuan || undefined,
    email: r.email || '',
    butuh_akomodasi: wantsStay ? 1 : 0,
    status_akomodasi: r.status_akomodasi || (wantsStay ? 'MENGINAP' : 'Tidak Menginap'),
    tgl_checkin: r.tgl_checkin || '2026-09-04',
    tgl_checkout: r.tgl_checkout || '2026-09-06',
    qr_token: r.qr_token || `TNI-2026-${r.registration_id || r.id}`,
    token: r.qr_token || `TNI-2026-${r.registration_id || r.id}`,
    token_hash: '',
    seat_number: r.seat_number || undefined,
    seat_assignment: r.seat_number || undefined,
    seat_block: r.seat_block || undefined,
    building: r.building || 'Gedung Ahmad Yani',
    room: r.room_name || 'Ruang Sidang Utama',
    room_name: r.room_name || 'Ruang Sidang Utama',
    wisma_name: r.wisma_name || (wantsStay ? 'Wisma Kartika' : 'Tidak Menginap'),
    room_number: r.room_number || undefined,
    bed_number: r.bed_number || undefined,
    wisma_assignment: r.wisma_name && r.wisma_name !== 'Tidak Menginap'
      ? `${r.wisma_name} - Kamar ${r.room_number || '-'}${r.bed_number ? ` (Bed ${r.bed_number})` : ''}`
      : 'Tidak Menginap',
    status_kehadiran: isCheckIn ? 'CHECK-IN' : 'TEREGISTRASI',
    guest_status: isCheckIn ? 'CHECK-IN' : 'TEREGISTRASI',
    checkin_gate: r.checkin_gate || undefined,
    checkin_time: formattedCheckinTime,
    waktu_kehadiran_pertama: formattedCheckinTime,
    email_status: (r.email_status as any) || 'PENDING',
    email_retry_count: r.email_retry_count ?? 0,
    last_email_error: r.last_email_error || undefined,
    emailSent: r.email_status === 'SENT',
    kategori_instansi,
    warna_kursi,
    seatColorAlias: warna_kursi,
    assignment: r.seat_number ? {
      id: `assign_${r.id}`,
      peserta_id: String(r.id),
      seat_code: r.seat_number,
      seat_area: r.seat_block || 'Ruang Sidang Utama',
      gedung: r.building || 'Gedung Ahmad Yani',
      wisma_name: r.wisma_name || 'Tidak Menginap',
      room_code: r.room_number || '-',
      room_floor: 'Lantai 1',
      assigned_at: r.created_at ? (r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at)) : new Date().toISOString()
    } : undefined,
    created_at: r.created_at ? (r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at)) : new Date().toISOString(),
    updated_at: r.updated_at ? (r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at)) : new Date().toISOString()
  };
}

class MySQLAdapter {
  private pool: mysql.Pool | null = null;
  private initialized = false;
  private isConnecting = false;

  public isConfigured(): boolean {
    return !!(
      process.env.DB_HOST &&
      process.env.DB_USER &&
      process.env.DB_NAME
    );
  }

  private getPool(): mysql.Pool | null {
    if (!this.isConfigured()) {
      return null;
    }

    if (!this.pool) {
      const port = Number(process.env.DB_PORT) || 3306;
      this.pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: port,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
      });
    }

    return this.pool;
  }

  public async initSchema(): Promise<boolean> {
    if (!this.isConfigured()) return false;
    if (this.initialized || this.isConnecting) return true;
    this.isConnecting = true;

    try {
      const pool = this.getPool();
      if (!pool) return false;

      const connection = await pool.getConnection();
      try {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`guests\` (
            \`id\` INT(11) NOT NULL AUTO_INCREMENT,
            \`registration_id\` VARCHAR(100) NOT NULL,
            \`nama\` VARCHAR(255) NOT NULL,
            \`email\` VARCHAR(255) NOT NULL,
            \`phone\` VARCHAR(50) DEFAULT NULL,
            \`matra\` VARCHAR(50) DEFAULT NULL,
            \`pangkat\` VARCHAR(100) DEFAULT NULL,
            \`nrp\` VARCHAR(100) DEFAULT NULL,
            \`jabatan\` VARCHAR(255) DEFAULT NULL,
            \`kesatuan\` VARCHAR(255) DEFAULT NULL,
            \`status_kehadiran\` ENUM('REGISTRASI','CHECK_IN') NOT NULL DEFAULT 'REGISTRASI',
            \`status_kehadiran\` VARCHAR(50) NOT NULL DEFAULT 'TEREGISTRASI',
            \`seat_number\` VARCHAR(50) DEFAULT NULL,
            \`seat_block\` VARCHAR(50) DEFAULT NULL,
            \`building\` VARCHAR(100) DEFAULT NULL,
            \`room_name\` VARCHAR(100) DEFAULT NULL,
            \`wisma_name\` VARCHAR(100) DEFAULT NULL,
            \`room_number\` VARCHAR(50) DEFAULT NULL,
            \`bed_number\` VARCHAR(50) DEFAULT NULL,
            \`status_akomodasi\` VARCHAR(50) DEFAULT 'Tidak Menginap',
            \`checkin_gate\` VARCHAR(100) DEFAULT NULL,
            \`checkin_time\` DATETIME DEFAULT NULL,
            \`email_status\` VARCHAR(50) DEFAULT 'PENDING',
            \`qr_token\` VARCHAR(100) DEFAULT NULL,
            \`email_retry_count\` INT DEFAULT 0,
            \`last_email_error\` TEXT DEFAULT NULL,
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`idx_registration_id\` (\`registration_id\`),
            KEY \`idx_qr_token\` (\`qr_token\`),
            KEY \`idx_email\` (\`email\`),
            KEY \`idx_nrp\` (\`nrp\`),
            KEY \`idx_status\` (\`status_kehadiran\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`site_settings\` (
            \`setting_key\` VARCHAR(100) NOT NULL,
            \`setting_value\` TEXT DEFAULT NULL,
            \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`setting_key\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        this.initialized = true;
        return true;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[MySQL] Gagal initSchema:', err);
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  // ==========================================================
  // GUESTS CRUD
  // ==========================================================
  public async createGuest(guest: Partial<Guest>): Promise<Guest> {
    const pool = this.getPool();
    if (!pool) throw new Error('MySQL connection pool not available');
    await this.initSchema();

    let regId = guest.registration_id;
    if (!regId || !regId.match(/^REG-2026-\d{6}$/)) {
      const randNum = Math.floor(100000 + Math.random() * 900000);
      regId = `REG-2026-${randNum}`;
    }

    const qrToken = guest.qr_token || guest.token || `TNI-2026-${regId}`;

    const sql = `
      INSERT INTO \`guests\` (
        \`registration_id\`, \`nama\`, \`email\`, \`phone\`, \`matra\`, 
        \`pangkat\`, \`nrp\`, \`jabatan\`, \`kesatuan\`, \`status_kehadiran\`, 
        \`seat_number\`, \`seat_block\`, \`building\`, \`room_name\`, 
        \`wisma_name\`, \`room_number\`, \`bed_number\`, \`status_akomodasi\`, 
        \`checkin_gate\`, \`checkin_time\`, \`email_status\`, \`qr_token\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const wantsStay = guest.status_akomodasi === 'MENGINAP' || (guest.wisma_name && guest.wisma_name !== 'Tidak Menginap');
    const wismaName = wantsStay ? (guest.wisma_name || 'Wisma Kartika') : 'Tidak Menginap';
    const roomNumber = wantsStay ? (guest.room_number || null) : null;
    const bedNumber = wantsStay ? (guest.bed_number ? String(guest.bed_number) : '1') : null;
    const statusAkomodasi = wantsStay ? 'MENGINAP' : 'Tidak Menginap';

    const values = [
      regId,
      guest.nama || '',
      guest.email || '',
      guest.phone || guest.no_hp || null,
      guest.matra || 'AD',
      guest.pangkat || '',
      guest.nrp || null,
      guest.jabatan || '',
      guest.kesatuan || guest.satuan || guest.satker || '',
      guest.status_kehadiran || 'REGISTRASI',
      guest.seat_number || null,
      guest.seat_block || null,
      guest.building || 'Gedung Ahmad Yani',
      guest.room_name || guest.room || 'Ruang Sidang Utama',
      wismaName,
      roomNumber,
      bedNumber,
      statusAkomodasi,
      guest.checkin_gate || null,
      guest.checkin_time ? new Date(guest.checkin_time) : null,
      guest.email_status || 'PENDING',
      qrToken
    ];

    const [result]: any = await pool.execute(sql, values);
    const insertId = result.insertId;

    // Update seat if assigned
    if (guest.seat_number) {
      try {
        await pool.execute(
          'UPDATE `seats` SET `status` = ?, `guest_id` = ?, `guest_name` = ?, `guest_matra` = ? WHERE `seat_number` = ?',
          ['TERISI', insertId, guest.nama, guest.matra, guest.seat_number]
        );
      } catch (err) {}
    }

    // Update accommodation if assigned
    if (wantsStay && roomNumber) {
      try {
        await pool.execute(
          'UPDATE `accommodations` SET `status` = ?, `guest_id` = ?, `guest_name` = ? WHERE `wisma_name` = ? AND `room_number` = ?',
          ['TERISI', insertId, guest.nama, wismaName, roomNumber]
        );
      } catch (err) {}
    }

    const created = await this.getGuestById(insertId);
    if (!created) throw new Error('Failed to retrieve newly created guest');
    return created;
  }

  public async getGuestById(id: number | string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `guests` WHERE `id` = ? LIMIT 1', [id]);
      if (!rows || rows.length === 0) return null;
      return rowToGuest(rows[0]);
    } catch (err) {
      console.error('[MySQL] Gagal getGuestById:', err);
      return null;
    }
  }

  public async getGuestByToken(token: string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute(
        'SELECT * FROM `guests` WHERE `qr_token` = ? OR `registration_id` = ? LIMIT 1',
        [token, token]
      );
      if (!rows || rows.length === 0) return null;
      return rowToGuest(rows[0]);
    } catch (err) {
      console.error('[MySQL] Gagal getGuestByToken:', err);
      return null;
    }
  }

  public async getGuestByRegistrationId(regId: string): Promise<Guest | null> {
    return this.getGuestByToken(regId);
  }

  public async getGuestByNRP(nrp: string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute(
        'SELECT * FROM `guests` WHERE `nrp` = ? LIMIT 1',
        [nrp]
      );
      if (!rows || rows.length === 0) return null;
      return rowToGuest(rows[0]);
    } catch (err) {
      console.error('[MySQL] Gagal getGuestByNRP:', err);
      return null;
    }
  }

  public async getGuestByPhone(phone: string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute(
        'SELECT * FROM `guests` WHERE `phone` = ? LIMIT 1',
        [phone]
      );
      if (!rows || rows.length === 0) return null;
      return rowToGuest(rows[0]);
    } catch (err) {
      console.error('[MySQL] Gagal getGuestByPhone:', err);
      return null;
    }
  }

  public async getGuestByEmail(email: string): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute(
        'SELECT * FROM `guests` WHERE `email` = ? LIMIT 1',
        [email]
      );
      if (!rows || rows.length === 0) return null;
      return rowToGuest(rows[0]);
    } catch (err) {
      console.error('[MySQL] Gagal getGuestByEmail:', err);
      return null;
    }
  }

  public async searchGuests(query: string): Promise<Guest[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    const searchTerm = `%${query}%`;
    const sql = `
      SELECT * FROM \`guests\` 
      WHERE \`nama\` LIKE ? 
         OR \`nrp\` LIKE ? 
         OR \`phone\` LIKE ? 
         OR \`email\` LIKE ? 
         OR \`jabatan\` LIKE ? 
         OR \`kesatuan\` LIKE ? 
         OR \`registration_id\` LIKE ?
         OR \`qr_token\` LIKE ?
      ORDER BY \`created_at\` DESC
      LIMIT 100;
    `;

    try {
      const [rows]: any = await pool.execute(sql, [
        searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      ]);
      return (rows || []).map(rowToGuest);
    } catch (err) {
      console.error('[MySQL] Gagal searchGuests:', err);
      return [];
    }
  }

  public async getAllGuests(filters?: { matra?: string; status?: string; search?: string }): Promise<Guest[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    let sql = 'SELECT * FROM `guests` WHERE 1=1';
    const params: any[] = [];

    if (filters?.matra) {
      sql += ' AND `matra` = ?';
      params.push(filters.matra);
    }

    if (filters?.status) {
      let st = filters.status;
      if (st === 'HADIR') st = 'CHECK_IN';
      if (st === 'BELUM_HADIR') st = 'REGISTRASI';
      sql += ' AND `status_kehadiran` = ?';
      params.push(st);
    }

    if (filters?.search) {
      const s = `%${filters.search}%`;
      sql += ' AND (`nama` LIKE ? OR `nrp` LIKE ? OR `phone` LIKE ? OR `email` LIKE ? OR `jabatan` LIKE ?)';
      params.push(s, s, s, s, s);
    }

    sql += ' ORDER BY `created_at` DESC;';

    try {
      const [rows]: any = await pool.execute(sql, params);
      return (rows || []).map(rowToGuest);
    } catch (err) {
      console.error('[MySQL] Gagal getAllGuests:', err);
      return [];
    }
  }

  public async updateGuest(idOrToken: string, data: Partial<Guest>): Promise<Guest | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    const existing = await this.getGuestByToken(idOrToken) || await this.getGuestById(idOrToken);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (data.nama !== undefined) { fields.push('`nama` = ?'); values.push(data.nama); }
    if (data.email !== undefined) { fields.push('`email` = ?'); values.push(data.email); }
    if (data.phone !== undefined || data.no_hp !== undefined) { 
      fields.push('`phone` = ?'); 
      values.push(data.phone || data.no_hp || null); 
    }
    if (data.matra !== undefined) { fields.push('`matra` = ?'); values.push(data.matra); }
    if (data.pangkat !== undefined) { fields.push('`pangkat` = ?'); values.push(data.pangkat); }
    if (data.nrp !== undefined) { fields.push('`nrp` = ?'); values.push(data.nrp); }
    if (data.jabatan !== undefined) { fields.push('`jabatan` = ?'); values.push(data.jabatan); }
    if (data.kesatuan !== undefined || data.satuan !== undefined || data.satker !== undefined) { 
      fields.push('`kesatuan` = ?'); 
      values.push(data.kesatuan || data.satuan || data.satker || null); 
    }
    if (data.status_kehadiran !== undefined) { 
      fields.push('`status_kehadiran` = ?'); 
      values.push(data.status_kehadiran); 
    }
    if (data.seat_number !== undefined) { fields.push('`seat_number` = ?'); values.push(data.seat_number); }
    if (data.seat_block !== undefined) { fields.push('`seat_block` = ?'); values.push(data.seat_block); }
    if (data.building !== undefined) { fields.push('`building` = ?'); values.push(data.building); }
    if (data.room_name !== undefined || data.room !== undefined) { 
      fields.push('`room_name` = ?'); 
      values.push(data.room_name || data.room || null); 
    }
    if (data.wisma_name !== undefined) { fields.push('`wisma_name` = ?'); values.push(data.wisma_name); }
    if (data.room_number !== undefined) { fields.push('`room_number` = ?'); values.push(data.room_number); }
    if (data.bed_number !== undefined) { 
      fields.push('`bed_number` = ?'); 
      values.push(data.bed_number ? String(data.bed_number) : null); 
    }
    if (data.status_akomodasi !== undefined) { fields.push('`status_akomodasi` = ?'); values.push(data.status_akomodasi); }
    if (data.checkin_gate !== undefined) { fields.push('`checkin_gate` = ?'); values.push(data.checkin_gate); }
    if (data.checkin_time !== undefined) { 
      fields.push('`checkin_time` = ?'); 
      values.push(data.checkin_time ? new Date(data.checkin_time) : null); 
    }
    if (data.email_status !== undefined) { fields.push('`email_status` = ?'); values.push(data.email_status); }
    if (data.email_retry_count !== undefined) { fields.push('`email_retry_count` = ?'); values.push(data.email_retry_count); }
    if (data.last_email_error !== undefined) { fields.push('`last_email_error` = ?'); values.push(data.last_email_error); }

    if (fields.length === 0) return existing;

    values.push(existing.id);
    const sql = `UPDATE \`guests\` SET ${fields.join(', ')} WHERE \`id\` = ?`;

    try {
      await pool.execute(sql, values);
      return await this.getGuestById(existing.id);
    } catch (err) {
      console.error('[MySQL] Gagal updateGuest:', err);
      return null;
    }
  }

  public async deleteGuest(id: string): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    await this.initSchema();

    try {
      await pool.execute('UPDATE `seats` SET `status` = "KOSONG", `guest_id` = NULL, `guest_name` = NULL, `guest_matra` = NULL WHERE `guest_id` = ?', [id]);
      await pool.execute('UPDATE `accommodations` SET `status` = "KOSONG", `guest_id` = NULL, `guest_name` = NULL WHERE `guest_id` = ?', [id]);
      await pool.execute('DELETE FROM `guests` WHERE `id` = ?', [id]);
      return true;
    } catch (err) {
      console.error('[MySQL] Gagal deleteGuest:', err);
      return false;
    }
  }

  // ==========================================================
  // CHECK-IN GATE
  // ==========================================================
  public async recordCheckin(
    tokenOrId: string,
    gate: string = 'Gate Utama Hankam',
    petugas: string = 'Petugas Gate'
  ): Promise<{ success: boolean; guest?: Guest; error?: string }> {
    const pool = this.getPool();
    if (!pool) return { success: false, error: 'Database MySQL tidak terhubung' };
    await this.initSchema();

    const guest = (await this.getGuestByToken(tokenOrId)) || (await this.getGuestById(tokenOrId));
    if (!guest) {
      return { success: false, error: 'Data peserta tidak ditemukan dengan token atau ID tersebut' };
    }

    if (guest.status_kehadiran === 'CHECK_IN') {
      return {
        success: true,
        guest,
        error: `Peserta ${guest.nama} sudah melakukan check-in sebelumnya pada ${guest.checkin_time || 'sesi sebelumnya'}.`
      };
    }

    const now = new Date();
    try {
      await pool.execute(
        'UPDATE `guests` SET `status_kehadiran` = "CHECK-IN", `checkin_gate` = ?, `checkin_time` = ? WHERE `id` = ?',
        [gate, now, guest.id]
      );

      await pool.execute(
        'INSERT INTO `checkin_logs` (`guest_id`, `registration_id`, `guest_name`, `nrp`, `seat_number`, `gate`, `petugas`, `checkin_time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [guest.id, guest.registration_id || null, guest.nama, guest.nrp || null, guest.seat_number || null, gate, petugas, now]
      );

      const updated = await this.getGuestById(guest.id);
      return { success: true, guest: updated || undefined };
    } catch (err: any) {
      console.error('[MySQL] Gagal recordCheckin:', err);
      return { success: false, error: err.message || 'Gagal menyimpan check-in ke database' };
    }
  }

  // ==========================================================
  // SEATS & ACCOMMODATIONS
  // ==========================================================
  public async getAllSeats(): Promise<Seat[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `seats` ORDER BY `seat_number` ASC');
      return (rows || []).map((r: any) => ({
        id: r.id,
        group_id: `grp_${r.group_code.toLowerCase()}`,
        group_code: r.group_code,
        seat_number: r.seat_number,
        row_num: 1,
        col_num: 1,
        is_reserved: 0,
        status: r.status,
        colorAlias: null,
        peserta_id: r.guest_id ? String(r.guest_id) : null,
        nama_lengkap: r.guest_name || undefined,
        matra: r.guest_matra || undefined
      }));
    } catch (err) {
      console.error('[MySQL] Gagal getAllSeats:', err);
      return [];
    }
  }

  public async getAllRooms(): Promise<AccommodationRoom[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `accommodations` ORDER BY `wisma_name` ASC, `room_number` ASC');
      const roomMap = new Map<string, AccommodationRoom>();

      for (const r of rows) {
        const key = `${r.wisma_name}_${r.room_number}`;
        if (!roomMap.has(key)) {
          roomMap.set(key, {
            id: r.id,
            wisma_name: r.wisma_name,
            room_number: r.room_number,
            floor: 1,
            capacity: 2,
            slot_a_guest_id: r.bed_slot === 'A' && r.guest_id ? String(r.guest_id) : undefined,
            slot_a_guest_name: r.bed_slot === 'A' ? (r.guest_name || undefined) : undefined,
            slot_b_guest_id: r.bed_slot === 'B' && r.guest_id ? String(r.guest_id) : undefined,
            slot_b_guest_name: r.bed_slot === 'B' ? (r.guest_name || undefined) : undefined
          });
        } else {
          const rm = roomMap.get(key)!;
          if (r.bed_slot === 'B') {
            rm.slot_b_guest_id = r.guest_id ? String(r.guest_id) : undefined;
            rm.slot_b_guest_name = r.guest_name || undefined;
          } else {
            rm.slot_a_guest_id = r.guest_id ? String(r.guest_id) : undefined;
            rm.slot_a_guest_name = r.guest_name || undefined;
          }
        }
      }

      return Array.from(roomMap.values());
    } catch (err) {
      console.error('[MySQL] Gagal getAllRooms:', err);
      return [];
    }
  }

  public async getCheckinLogs(limit: number = 50): Promise<CheckinLog[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `checkin_logs` ORDER BY `checkin_time` DESC LIMIT ?', [limit]);
      return (rows || []).map((r: any) => ({
        id: String(r.id),
        peserta_id: String(r.guest_id),
        waktu_checkin: r.checkin_time instanceof Date ? r.checkin_time.toISOString() : String(r.checkin_time),
        petugas: r.petugas,
        checkpoint: r.gate,
        nama_lengkap: r.guest_name,
        nrp: r.nrp || undefined,
        seat_number: r.seat_number || undefined
      }));
    } catch (err) {
      console.error('[MySQL] Gagal getCheckinLogs:', err);
      return [];
    }
  }

  public async getAdminByUsername(username: string): Promise<AdminUser | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `admins` WHERE `username` = ? LIMIT 1', [username]);
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        username: r.username,
        nama: r.nama,
        role: r.role,
        password_hash: r.password_hash,
        created_at: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at)
      };
    } catch (err) {
      console.error('[MySQL] Gagal getAdminByUsername:', err);
      return null;
    }
  }

  public async addEmailLog(log: { recipient: string; subject: string; status: string; error_message?: string }): Promise<any> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [res]: any = await pool.execute(
        'INSERT INTO `email_logs` (`recipient`, `subject`, `status`, `error_message`) VALUES (?, ?, ?, ?)',
        [log.recipient, log.subject, log.status, log.error_message || null]
      );
      return { id: res.insertId, ...log, sent_at: new Date().toISOString() };
    } catch (err) {
      console.error('[MySQL] Gagal addEmailLog:', err);
      return null;
    }
  }

  public async getEmailLogs(recipient?: string, limit: number = 50): Promise<EmailLog[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    try {
      let sql = 'SELECT * FROM `email_logs`';
      const params: any[] = [];
      if (recipient) {
        sql += ' WHERE `recipient` = ?';
        params.push(recipient);
      }
      sql += ' ORDER BY `sent_at` DESC LIMIT ?';
      params.push(limit);

      const [rows]: any = await pool.execute(sql, params);
      return (rows || []).map((r: any) => ({
        id: String(r.id),
        email: r.recipient,
        subject: r.subject,
        status: r.status as any,
        error_message: r.error_message || undefined,
        sent_at: r.sent_at instanceof Date ? r.sent_at.toISOString() : String(r.sent_at)
      }));
    } catch (err) {
      console.error('[MySQL] Gagal getEmailLogs:', err);
      return [];
    }
  }

  // ==========================================================
  // BACKWARDS COMPATIBILITY ALIASES FOR LEGACY ROUTES
  // ==========================================================
  public async getPesertaByToken(token: string): Promise<Guest | null> {
    return this.getGuestByToken(token);
  }

  public async getPesertaById(id: string): Promise<Guest | null> {
    return this.getGuestById(id);
  }

  public async getAllPeserta(filters?: any): Promise<Guest[]> {
    return this.getAllGuests(filters);
  }

  public async savePeserta(data: any): Promise<Guest | null> {
    if (data.id) {
      const existing = await this.getGuestById(data.id);
      if (existing) {
        return this.updateGuest(data.id, data);
      }
    }
    return this.createGuest(data);
  }

  public async updatePeserta(id: string, data: any): Promise<Guest | null> {
    return this.updateGuest(id, data);
  }

  public async deletePeserta(id: string): Promise<boolean> {
    return this.deleteGuest(id);
  }

  public async saveAssignment(assignment: any): Promise<boolean> {
    const id = assignment.guest_id || assignment.peserta_id;
    if (id) {
      await this.updateGuest(id, {
        seat_number: assignment.seat_number || assignment.seat_code,
        seat_block: assignment.seat_block || assignment.seat_row,
        wisma_name: assignment.wisma_name,
        room_number: assignment.room_number || assignment.room_code,
        bed_number: assignment.bed_number,
        status_akomodasi: assignment.status_akomodasi || (assignment.wisma_name && assignment.wisma_name !== 'Tidak Menginap' ? 'MENGINAP' : 'TIDAK_MENGINAP')
      } as any);
    }
    return true;
  }

  public async getSiteSettings(): Promise<Record<string, string> | null> {
    if (!this.isConfigured()) return null;
    await this.initSchema();
    const pool = this.getPool();
    if (!pool) return null;

    try {
      const [rows] = await pool.query('SELECT setting_key, setting_value FROM site_settings');
      if (!Array.isArray(rows)) return null;
      const res: Record<string, string> = {};
      for (const r of rows as any[]) {
        res[r.setting_key] = r.setting_value;
      }
      return res;
    } catch (err) {
      console.warn('[MySQL] Failed to get site_settings:', err);
      return null;
    }
  }

  public async saveSiteSettings(settings: Record<string, string>): Promise<boolean> {
    if (!this.isConfigured()) return false;
    await this.initSchema();
    const pool = this.getPool();
    if (!pool) return false;

    try {
      const entries = Object.entries(settings);
      for (const [k, v] of entries) {
        await pool.query(
          'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)',
          [k, v ?? '']
        );
      }
      return true;
    } catch (err) {
      console.error('[MySQL] Failed to save site_settings:', err);
      return false;
    }
  }
}

export const mysqlAdapter = new MySQLAdapter();
