export type StatusKehadiran = 'REGISTRASI' | 'CHECK_IN';

/**
 * Normalisasi nilai status kehadiran ke standar target bisnis:
 * 1. REGISTRASI (Tampilan: "Registrasi")
 * 2. CHECK_IN   (Tampilan: "Check In")
 *
 * Mencegah error MySQL 1265: Data truncated for column 'status_kehadiran'
 */
export function canonicalizeStatusKehadiran(val: unknown): StatusKehadiran {
  if (!val || typeof val !== 'string') return 'REGISTRASI';
  const normalized = val.trim().toUpperCase().replace(/[\s-]/g, '_');
  
  if (
    normalized === 'CHECK_IN' || 
    normalized === 'CHECKIN' || 
    normalized === 'CHECK_IN' ||
    normalized === 'CHECKED_IN' || 
    normalized === 'HADIR'
  ) {
    return 'CHECK_IN';
  }

  return 'REGISTRASI';
}

/**
 * Format status untuk tampilan UI sesuai target bisnis:
 * - "Registrasi"
 * - "Check In"
 */
export function formatStatusKehadiranLabel(val: unknown): 'Registrasi' | 'Check In' {
  return canonicalizeStatusKehadiran(val) === 'CHECK_IN' ? 'Check In' : 'Registrasi';
}

