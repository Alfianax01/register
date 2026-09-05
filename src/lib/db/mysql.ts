import mysql from 'mysql2/promise';

export interface PesertaRow {
  id: string;
  nama_lengkap: string;
  pangkat: string;
  jabatan: string;
  instansi: string;
  email: string;
  no_hp: string;
  kategori_tamu: string;
  nrp: string | null;
  matra: string;
  qr_token: string;
  seat_number: string | null;
  status_hadir: 'BELUM_HADIR' | 'HADIR';
  pdf_path: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface KursiRow {
  id: string;
  kode_kursi: string;
  grup: string;
  status: 'KOSONG' | 'TERISI' | 'RESERVED';
  peserta_id: string | null;
  nama_lengkap?: string;
  pangkat?: string;
  matra?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CheckinLogRow {
  id: string;
  peserta_id: string;
  waktu_checkin: string;
  petugas: string;
  checkpoint: string;
  nama_lengkap?: string;
  pangkat?: string;
  nrp?: string;
  seat_number?: string;
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
      console.log(`[MySQL] Menginisialisasi connection pool ke ${process.env.DB_HOST}:${port}/${process.env.DB_NAME}`);

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
    if (!this.isConfigured()) {
      console.log('[MySQL] Database belum dikonfigurasi via environment variable.');
      return false;
    }

    if (this.initialized || this.isConnecting) return true;
    this.isConnecting = true;

    try {
      const pool = this.getPool();
      if (!pool) return false;

      const connection = await pool.getConnection();
      console.log('[MySQL] Berhasil terhubung ke database. Memeriksa skema tabel...');

      try {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`peserta\` (
            \`id\` VARCHAR(64) NOT NULL,
            \`nama_lengkap\` VARCHAR(255) NOT NULL,
            \`pangkat\` VARCHAR(100) NOT NULL,
            \`jabatan\` VARCHAR(255) NOT NULL,
            \`instansi\` VARCHAR(255) NOT NULL,
            \`email\` VARCHAR(255) NOT NULL,
            \`no_hp\` VARCHAR(50) NOT NULL,
            \`kategori_tamu\` VARCHAR(50) NOT NULL DEFAULT 'TNI',
            \`nrp\` VARCHAR(50) DEFAULT NULL,
            \`matra\` VARCHAR(20) NOT NULL DEFAULT 'AD',
            \`qr_token\` VARCHAR(100) NOT NULL,
            \`seat_number\` VARCHAR(50) DEFAULT NULL,
            \`status_hadir\` VARCHAR(20) NOT NULL DEFAULT 'BELUM_HADIR',
            \`pdf_path\` VARCHAR(255) DEFAULT NULL,
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`idx_peserta_qr_token\` (\`qr_token\`),
            KEY \`idx_peserta_nrp\` (\`nrp\`),
            KEY \`idx_peserta_email\` (\`email\`),
            KEY \`idx_peserta_no_hp\` (\`no_hp\`),
            KEY \`idx_peserta_status_hadir\` (\`status_hadir\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`kursi\` (
            \`id\` VARCHAR(64) NOT NULL,
            \`kode_kursi\` VARCHAR(20) NOT NULL,
            \`grup\` VARCHAR(50) NOT NULL,
            \`status\` VARCHAR(20) NOT NULL DEFAULT 'KOSONG',
            \`peserta_id\` VARCHAR(64) DEFAULT NULL,
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`idx_kursi_kode\` (\`kode_kursi\`),
            KEY \`idx_kursi_grup\` (\`grup\`),
            KEY \`idx_kursi_status\` (\`status\`),
            KEY \`idx_kursi_peserta_id\` (\`peserta_id\`),
            CONSTRAINT \`fk_kursi_peserta\` 
              FOREIGN KEY (\`peserta_id\`) REFERENCES \`peserta\` (\`id\`) 
              ON DELETE SET NULL ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        await connection.query(`
          CREATE TABLE IF NOT EXISTS \`log_checkin\` (
            \`id\` VARCHAR(64) NOT NULL,
            \`peserta_id\` VARCHAR(64) NOT NULL,
            \`waktu_checkin\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            \`petugas\` VARCHAR(100) NOT NULL DEFAULT 'Petugas Gate',
            \`checkpoint\` VARCHAR(100) NOT NULL DEFAULT 'Gate Utama Hankam',
            \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (\`id\`),
            KEY \`idx_log_peserta_id\` (\`peserta_id\`),
            KEY \`idx_log_waktu_checkin\` (\`waktu_checkin\`),
            CONSTRAINT \`fk_log_peserta\` 
              FOREIGN KEY (\`peserta_id\`) REFERENCES \`peserta\` (\`id\`) 
              ON DELETE CASCADE ON UPDATE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Seed default seats if empty
        const [existingSeats]: any = await connection.query('SELECT COUNT(*) as count FROM `kursi`');
        if (existingSeats[0]?.count === 0) {
          const defaultSeats = [
            // Grup A
            ['seat_A_01', 'A-01', 'VVIP Bintang 4', 'KOSONG'],
            ['seat_A_02', 'A-02', 'VVIP Bintang 4', 'KOSONG'],
            ['seat_A_03', 'A-03', 'VVIP Bintang 4', 'KOSONG'],
            ['seat_A_04', 'A-04', 'VVIP Bintang 4', 'KOSONG'],
            ['seat_A_05', 'A-05', 'VVIP Bintang 4', 'KOSONG'],
            ['seat_A_06', 'A-06', 'VVIP Bintang 4', 'KOSONG'],
            ['seat_A_07', 'A-07', 'VVIP Bintang 4', 'KOSONG'],
            ['seat_A_08', 'A-08', 'VVIP Bintang 4', 'KOSONG'],
            // Grup B
            ['seat_B_01', 'B-01', 'VIP Bintang 3-2', 'KOSONG'],
            ['seat_B_02', 'B-02', 'VIP Bintang 3-2', 'KOSONG'],
            ['seat_B_03', 'B-03', 'VIP Bintang 3-2', 'KOSONG'],
            ['seat_B_04', 'B-04', 'VIP Bintang 3-2', 'KOSONG'],
            ['seat_B_05', 'B-05', 'VIP Bintang 3-2', 'KOSONG'],
            ['seat_B_06', 'B-06', 'VIP Bintang 3-2', 'KOSONG'],
            ['seat_B_07', 'B-07', 'VIP Bintang 3-2', 'KOSONG'],
            ['seat_B_08', 'B-08', 'VIP Bintang 3-2', 'KOSONG'],
            // Grup C
            ['seat_C_01', 'C-01', 'Utama Bintang 1', 'KOSONG'],
            ['seat_C_02', 'C-02', 'Utama Bintang 1', 'KOSONG'],
            ['seat_C_03', 'C-03', 'Utama Bintang 1', 'KOSONG'],
            ['seat_C_04', 'C-04', 'Utama Bintang 1', 'KOSONG'],
            ['seat_C_05', 'C-05', 'Utama Bintang 1', 'KOSONG'],
            ['seat_C_06', 'C-06', 'Utama Bintang 1', 'KOSONG'],
            ['seat_C_07', 'C-07', 'Utama Bintang 1', 'KOSONG'],
            ['seat_C_08', 'C-08', 'Utama Bintang 1', 'KOSONG'],
            // Grup D
            ['seat_D_01', 'D-01', 'Pamen Kolonel', 'KOSONG'],
            ['seat_D_02', 'D-02', 'Pamen Kolonel', 'KOSONG'],
            ['seat_D_03', 'D-03', 'Pamen Kolonel', 'KOSONG'],
            ['seat_D_04', 'D-04', 'Pamen Kolonel', 'KOSONG'],
            ['seat_D_05', 'D-05', 'Pamen Kolonel', 'KOSONG'],
            ['seat_D_06', 'D-06', 'Pamen Kolonel', 'KOSONG'],
            ['seat_D_07', 'D-07', 'Pamen Kolonel', 'KOSONG'],
            ['seat_D_08', 'D-08', 'Pamen Kolonel', 'KOSONG'],
            // Grup E
            ['seat_E_01', 'E-01', 'Undangan Kementerian', 'KOSONG'],
            ['seat_E_02', 'E-02', 'Undangan Kementerian', 'KOSONG'],
            ['seat_E_03', 'E-03', 'Undangan Kementerian', 'KOSONG'],
            ['seat_E_04', 'E-04', 'Undangan Kementerian', 'KOSONG'],
            ['seat_E_05', 'E-05', 'Undangan Kementerian', 'KOSONG'],
            ['seat_E_06', 'E-06', 'Undangan Kementerian', 'KOSONG'],
            ['seat_E_07', 'E-07', 'Undangan Kementerian', 'KOSONG'],
            ['seat_E_08', 'E-08', 'Undangan Kementerian', 'KOSONG'],
            // Grup F
            ['seat_F_01', 'F-01', 'Delegasi Kehormatan', 'KOSONG'],
            ['seat_F_02', 'F-02', 'Delegasi Kehormatan', 'KOSONG'],
            ['seat_F_03', 'F-03', 'Delegasi Kehormatan', 'KOSONG'],
            ['seat_F_04', 'F-04', 'Delegasi Kehormatan', 'KOSONG'],
            ['seat_F_05', 'F-05', 'Delegasi Kehormatan', 'KOSONG'],
            ['seat_F_06', 'F-06', 'Delegasi Kehormatan', 'KOSONG'],
            ['seat_F_07', 'F-07', 'Delegasi Kehormatan', 'KOSONG'],
            ['seat_F_08', 'F-08', 'Delegasi Kehormatan', 'KOSONG']
          ];

          for (const s of defaultSeats) {
            await connection.query(
              'INSERT IGNORE INTO `kursi` (`id`, `kode_kursi`, `grup`, `status`) VALUES (?, ?, ?, ?)',
              s
            );
          }
        }

        this.initialized = true;
        console.log('[MySQL] Skema tabel tni_rapim_2026 siap.');
        return true;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('[MySQL] Gagal inisialisasi skema tabel:', err);
      return false;
    } finally {
      this.isConnecting = false;
    }
  }

  // ==========================================================
  // PESERTA CRUD
  // ==========================================================
  public async savePeserta(data: PesertaRow): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;

    await this.initSchema();

    const sql = `
      INSERT INTO \`peserta\` (
        \`id\`, \`nama_lengkap\`, \`pangkat\`, \`jabatan\`, \`instansi\`, 
        \`email\`, \`no_hp\`, \`kategori_tamu\`, \`nrp\`, \`matra\`, 
        \`qr_token\`, \`seat_number\`, \`status_hadir\`, \`pdf_path\`
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`nama_lengkap\` = VALUES(\`nama_lengkap\`),
        \`pangkat\` = VALUES(\`pangkat\`),
        \`jabatan\` = VALUES(\`jabatan\`),
        \`instansi\` = VALUES(\`instansi\`),
        \`email\` = VALUES(\`email\`),
        \`no_hp\` = VALUES(\`no_hp\`),
        \`kategori_tamu\` = VALUES(\`kategori_tamu\`),
        \`nrp\` = VALUES(\`nrp\`),
        \`matra\` = VALUES(\`matra\`),
        \`seat_number\` = VALUES(\`seat_number\`),
        \`status_hadir\` = VALUES(\`status_hadir\`),
        \`pdf_path\` = VALUES(\`pdf_path\`);
    `;

    const values = [
      data.id,
      data.nama_lengkap,
      data.pangkat,
      data.jabatan,
      data.instansi,
      data.email,
      data.no_hp,
      data.kategori_tamu || 'TNI',
      data.nrp || null,
      data.matra || 'AD',
      data.qr_token,
      data.seat_number || null,
      data.status_hadir || 'BELUM_HADIR',
      data.pdf_path || null
    ];

    try {
      await pool.execute(sql, values);
      console.log(`[MySQL] Peserta berhasil disimpan: ${data.nama_lengkap} (${data.id})`);
      return true;
    } catch (err) {
      console.error('[MySQL] Gagal menyimpan peserta:', err);
      throw err;
    }
  }

  public async getPesertaById(id: string): Promise<PesertaRow | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `peserta` WHERE `id` = ? LIMIT 1', [id]);
      return rows[0] || null;
    } catch (err) {
      console.error('[MySQL] Gagal getPesertaById:', err);
      return null;
    }
  }

  public async getPesertaByToken(qr_token: string): Promise<PesertaRow | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `peserta` WHERE `qr_token` = ? LIMIT 1', [qr_token]);
      return rows[0] || null;
    } catch (err) {
      console.error('[MySQL] Gagal getPesertaByToken:', err);
      return null;
    }
  }

  public async getPesertaByNRP(nrp: string): Promise<PesertaRow | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `peserta` WHERE `nrp` = ? LIMIT 1', [nrp]);
      return rows[0] || null;
    } catch (err) {
      console.error('[MySQL] Gagal getPesertaByNRP:', err);
      return null;
    }
  }

  public async getPesertaByPhone(no_hp: string): Promise<PesertaRow | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `peserta` WHERE `no_hp` = ? LIMIT 1', [no_hp]);
      return rows[0] || null;
    } catch (err) {
      console.error('[MySQL] Gagal getPesertaByPhone:', err);
      return null;
    }
  }

  public async getPesertaByEmail(email: string): Promise<PesertaRow | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [rows]: any = await pool.execute('SELECT * FROM `peserta` WHERE `email` = ? LIMIT 1', [email]);
      return rows[0] || null;
    } catch (err) {
      console.error('[MySQL] Gagal getPesertaByEmail:', err);
      return null;
    }
  }

  public async searchPeserta(query: string): Promise<PesertaRow[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    const searchTerm = `%${query}%`;
    const sql = `
      SELECT * FROM \`peserta\` 
      WHERE \`nama_lengkap\` LIKE ? 
         OR \`nrp\` LIKE ? 
         OR \`no_hp\` LIKE ? 
         OR \`email\` LIKE ? 
         OR \`jabatan\` LIKE ? 
         OR \`instansi\` LIKE ? 
         OR \`qr_token\` LIKE ?
      ORDER BY \`created_at\` DESC
      LIMIT 100;
    `;

    try {
      const [rows]: any = await pool.execute(sql, [
        searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
      ]);
      return rows || [];
    } catch (err) {
      console.error('[MySQL] Gagal searchPeserta:', err);
      return [];
    }
  }

  public async getAllPeserta(filters?: { matra?: string; status?: string; search?: string }): Promise<PesertaRow[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    let sql = 'SELECT * FROM `peserta` WHERE 1=1';
    const params: any[] = [];

    if (filters?.matra) {
      sql += ' AND `matra` = ?';
      params.push(filters.matra);
    }

    if (filters?.status) {
      sql += ' AND `status_hadir` = ?';
      params.push(filters.status);
    }

    if (filters?.search) {
      const s = `%${filters.search}%`;
      sql += ' AND (`nama_lengkap` LIKE ? OR `nrp` LIKE ? OR `no_hp` LIKE ? OR `email` LIKE ? OR `jabatan` LIKE ?)';
      params.push(s, s, s, s, s);
    }

    sql += ' ORDER BY `created_at` DESC;';

    try {
      const [rows]: any = await pool.execute(sql, params);
      return rows || [];
    } catch (err) {
      console.error('[MySQL] Gagal getAllPeserta:', err);
      return [];
    }
  }

  public async updatePeserta(id: string, updates: Partial<PesertaRow>): Promise<PesertaRow | null> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    const allowedFields = [
      'nama_lengkap', 'pangkat', 'jabatan', 'instansi', 'email', 
      'no_hp', 'kategori_tamu', 'nrp', 'matra', 'seat_number', 
      'status_hadir', 'pdf_path'
    ];

    const setClauses: string[] = [];
    const values: any[] = [];

    for (const [key, val] of Object.entries(updates)) {
      if (allowedFields.includes(key) && val !== undefined) {
        setClauses.push(`\`${key}\` = ?`);
        values.push(val);
      }
    }

    if (setClauses.length === 0) return this.getPesertaById(id);

    values.push(id);
    const sql = `UPDATE \`peserta\` SET ${setClauses.join(', ')} WHERE \`id\` = ?;`;

    try {
      await pool.execute(sql, values);
      return await this.getPesertaById(id);
    } catch (err) {
      console.error('[MySQL] Gagal updatePeserta:', err);
      throw err;
    }
  }

  public async updatePdfPath(id: string, pdf_path: string): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    try {
      await pool.execute('UPDATE `peserta` SET `pdf_path` = ? WHERE `id` = ?', [pdf_path, id]);
      return true;
    } catch (err) {
      console.error('[MySQL] Gagal updatePdfPath:', err);
      return false;
    }
  }

  public async deletePeserta(id: string): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    await this.initSchema();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Free seat
      await connection.execute(
        'UPDATE `kursi` SET `status` = \'KOSONG\', `peserta_id` = NULL WHERE `peserta_id` = ?',
        [id]
      );

      // Delete checkin logs
      await connection.execute('DELETE FROM `log_checkin` WHERE `peserta_id` = ?', [id]);

      // Delete participant
      await connection.execute('DELETE FROM `peserta` WHERE `id` = ?', [id]);

      await connection.commit();
      console.log(`[MySQL] Peserta berhasil dihapus: ${id}`);
      return true;
    } catch (err) {
      await connection.rollback();
      console.error('[MySQL] Gagal deletePeserta:', err);
      return false;
    } finally {
      connection.release();
    }
  }

  // ==========================================================
  // KURSI CRUD & ALLOCATION
  // ==========================================================
  public async getKursiList(): Promise<KursiRow[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    const sql = `
      SELECT 
        k.id, k.kode_kursi, k.grup, k.status, k.peserta_id,
        p.nama_lengkap, p.pangkat, p.matra
      FROM \`kursi\` k
      LEFT JOIN \`peserta\` p ON k.peserta_id = p.id
      ORDER BY k.kode_kursi ASC;
    `;

    try {
      const [rows]: any = await pool.execute(sql);
      return rows || [];
    } catch (err) {
      console.error('[MySQL] Gagal getKursiList:', err);
      return [];
    }
  }

  public async assignKursi(kode_kursi: string, peserta_id: string | null): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) return false;
    await this.initSchema();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. If peserta_id already has another seat, free that seat
      if (peserta_id) {
        await connection.execute(
          'UPDATE `kursi` SET `status` = \'KOSONG\', `peserta_id` = NULL WHERE `peserta_id` = ? AND `kode_kursi` != ?',
          [peserta_id, kode_kursi]
        );
      }

      // 2. If target seat is currently held by someone else, clear their seat_number
      const [existingTarget]: any = await connection.execute(
        'SELECT `peserta_id` FROM `kursi` WHERE `kode_kursi` = ?',
        [kode_kursi]
      );
      const prevPesertaId = existingTarget[0]?.peserta_id;
      if (prevPesertaId && prevPesertaId !== peserta_id) {
        await connection.execute(
          'UPDATE `peserta` SET `seat_number` = NULL WHERE `id` = ?',
          [prevPesertaId]
        );
      }

      // 3. Update target seat
      if (peserta_id) {
        await connection.execute(
          'UPDATE `kursi` SET `status` = \'TERISI\', `peserta_id` = ? WHERE `kode_kursi` = ?',
          [peserta_id, kode_kursi]
        );
        await connection.execute(
          'UPDATE `peserta` SET `seat_number` = ? WHERE `id` = ?',
          [kode_kursi, peserta_id]
        );
      } else {
        await connection.execute(
          'UPDATE `kursi` SET `status` = \'KOSONG\', `peserta_id` = NULL WHERE `kode_kursi` = ?',
          [kode_kursi]
        );
        if (prevPesertaId) {
          await connection.execute(
            'UPDATE `peserta` SET `seat_number` = NULL WHERE `id` = ?',
            [prevPesertaId]
          );
        }
      }

      await connection.commit();
      console.log(`[MySQL] Kursi ${kode_kursi} berhasil dialokasikan untuk ${peserta_id || 'KOSONG'}`);
      return true;
    } catch (err) {
      await connection.rollback();
      console.error('[MySQL] Gagal assignKursi:', err);
      return false;
    } finally {
      connection.release();
    }
  }

  // ==========================================================
  // CHECK-IN & LOGS
  // ==========================================================
  public async recordCheckin(
    peserta_id: string,
    petugas: string = 'Petugas Gate',
    checkpoint: string = 'Gate Utama Hankam'
  ): Promise<{ alreadyCheckedIn: boolean; firstTimestamp?: string }> {
    const pool = this.getPool();
    if (!pool) return { alreadyCheckedIn: false };
    await this.initSchema();

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check current presence status
      const [pRows]: any = await connection.execute(
        'SELECT `status_hadir` FROM `peserta` WHERE `id` = ? LIMIT 1',
        [peserta_id]
      );

      const isHadir = pRows[0]?.status_hadir === 'HADIR';

      if (isHadir) {
        // Fetch first checkin timestamp
        const [logRows]: any = await connection.execute(
          'SELECT `waktu_checkin` FROM `log_checkin` WHERE `peserta_id` = ? ORDER BY `waktu_checkin` ASC LIMIT 1',
          [peserta_id]
        );
        await connection.commit();
        return {
          alreadyCheckedIn: true,
          firstTimestamp: logRows[0]?.waktu_checkin
        };
      }

      // Mark as HADIR
      await connection.execute(
        'UPDATE `peserta` SET `status_hadir` = \'HADIR\' WHERE `id` = ?',
        [peserta_id]
      );

      // Insert log
      const logId = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await connection.execute(
        'INSERT INTO `log_checkin` (`id`, `peserta_id`, `petugas`, `checkpoint`) VALUES (?, ?, ?, ?)',
        [logId, peserta_id, petugas, checkpoint]
      );

      await connection.commit();
      console.log(`[MySQL] Checkin sukses tercatat: Peserta ${peserta_id} oleh ${petugas}`);
      return { alreadyCheckedIn: false };
    } catch (err) {
      await connection.rollback();
      console.error('[MySQL] Gagal recordCheckin:', err);
      throw err;
    } finally {
      connection.release();
    }
  }

  public async getCheckinLogs(limit: number = 50): Promise<CheckinLogRow[]> {
    const pool = this.getPool();
    if (!pool) return [];
    await this.initSchema();

    const sql = `
      SELECT 
        l.id, l.peserta_id, l.waktu_checkin, l.petugas, l.checkpoint,
        p.nama_lengkap, p.pangkat, p.nrp, p.seat_number
      FROM \`log_checkin\` l
      LEFT JOIN \`peserta\` p ON l.peserta_id = p.id
      ORDER BY l.waktu_checkin DESC
      LIMIT ?;
    `;

    try {
      const [rows]: any = await pool.execute(sql, [limit]);
      return rows || [];
    } catch (err) {
      console.error('[MySQL] Gagal getCheckinLogs:', err);
      return [];
    }
  }

  // ==========================================================
  // STATISTIK
  // ==========================================================
  public async getStats(): Promise<any> {
    const pool = this.getPool();
    if (!pool) return null;
    await this.initSchema();

    try {
      const [pStats]: any = await pool.query(`
        SELECT 
          COUNT(*) as total_peserta,
          SUM(CASE WHEN \`status_hadir\` = 'HADIR' THEN 1 ELSE 0 END) as total_hadir,
          SUM(CASE WHEN \`status_hadir\` != 'HADIR' THEN 1 ELSE 0 END) as total_belum_hadir,
          SUM(CASE WHEN \`matra\` = 'AD' THEN 1 ELSE 0 END) as total_ad,
          SUM(CASE WHEN \`matra\` = 'AL' THEN 1 ELSE 0 END) as total_al,
          SUM(CASE WHEN \`matra\` = 'AU' THEN 1 ELSE 0 END) as total_au,
          SUM(CASE WHEN \`matra\` = 'MABES' THEN 1 ELSE 0 END) as total_mabes,
          SUM(CASE WHEN \`matra\` = 'NON_TNI' THEN 1 ELSE 0 END) as total_sipil
        FROM \`peserta\`;
      `);

      const [kStats]: any = await pool.query(`
        SELECT 
          COUNT(*) as total_kursi,
          SUM(CASE WHEN \`status\` = 'TERISI' THEN 1 ELSE 0 END) as kursi_terisi,
          SUM(CASE WHEN \`status\` = 'KOSONG' THEN 1 ELSE 0 END) as kursi_kosong
        FROM \`kursi\`;
      `);

      return {
        peserta: pStats[0] || {},
        kursi: kStats[0] || {}
      };
    } catch (err) {
      console.error('[MySQL] Gagal getStats:', err);
      return null;
    }
  }
}

export const mysqlAdapter = new MySQLAdapter();

