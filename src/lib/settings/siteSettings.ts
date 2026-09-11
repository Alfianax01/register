import fs from 'fs';
import path from 'path';
import { mysqlAdapter } from '@/lib/db/mysql';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/types/settings';

export type { SiteSettings };
export { DEFAULT_SITE_SETTINGS };

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'site_settings.json');

/**
 * Membaca pengaturan website dengan urutan prioritas:
 * 1. Database MySQL (tabel site_settings)
 * 2. File lokal (data/site_settings.json)
 * 3. Nilai default (DEFAULT_SITE_SETTINGS)
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  let dbSettings: Record<string, string> | null = null;

  try {
    if (mysqlAdapter.isConfigured()) {
      dbSettings = await mysqlAdapter.getSiteSettings();
    }
  } catch (err) {
    console.warn('[SiteSettings] MySQL read failed, trying JSON fallback:', err);
  }

  let fileSettings: Record<string, string> = {};
  try {
    const fileContent = await fs.promises.readFile(SETTINGS_FILE_PATH, 'utf-8');
    fileSettings = JSON.parse(fileContent);
  } catch {
    // File belum ada, wajar pada inisialisasi awal
  }

  // Sanitasi data terpotong dari MySQL (jika kolom sebelumnya bertipe TEXT 65535 bytes)
  if (dbSettings) {
    for (const key of ['hero_logo', 'navbar_logo', 'hero_banner', 'favicon']) {
      const dbVal = dbSettings[key];
      const fileVal = fileSettings[key];
      if (dbVal && dbVal.length === 65535 && fileVal && fileVal.length > 65535) {
        console.warn(`[SiteSettings] Terdeteksi nilai ${key} terpotong di MySQL (65535). Memperbaiki dengan data file lokal (${fileVal.length}).`);
        dbSettings[key] = fileVal;
        // Simpan versi utuh kembali ke MySQL yang sekarang sudah LONGTEXT
        mysqlAdapter.saveSiteSettings({ [key]: fileVal }).catch(() => {});
      }
    }
  }

  // Gabungkan dengan prioritas: Default < File < DB
  const merged: SiteSettings = {
    ...DEFAULT_SITE_SETTINGS,
    ...fileSettings,
    ...(dbSettings || {})
  };

  return merged;
}

/**
 * Menyimpan pengaturan website ke Database MySQL dan File JSON secara konsisten
 */
export async function saveSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...updates
  };

  // 1. Simpan ke File JSON
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(SETTINGS_FILE_PATH, JSON.stringify(next, null, 2), 'utf-8');
  } catch (err) {
    console.error('[SiteSettings] Failed to write JSON file:', err);
  }

  // 2. Simpan ke MySQL
  try {
    if (mysqlAdapter.isConfigured()) {
      await mysqlAdapter.saveSiteSettings(next as unknown as Record<string, string>);
    }
  } catch (err) {
    console.error('[SiteSettings] Failed to save to MySQL:', err);
  }

  return next;
}
