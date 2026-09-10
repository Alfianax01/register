import { Guest } from '@/types';

export interface GuestFilterOptions {
  search?: string;
  q?: string;
  matra?: string;
  pangkat?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'nama' | 'pangkat' | 'matra' | 'status' | 'created_at' | 'waktu_kehadiran' | string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Filter dan sortir data peserta berdasarkan kriteria pencarian dan filter aktif.
 * Dipakai bersama oleh tabel client dan endpoint ekspor Excel/PDF.
 */
export function applyGuestFilters(guests: Guest[], options: GuestFilterOptions = {}): Guest[] {
  if (!guests || !Array.isArray(guests)) return [];

  const rawSearch = (options.search || options.q || '').trim().toLowerCase();
  const matra = (options.matra || '').trim().toUpperCase();
  const pangkat = (options.pangkat || '').trim().toLowerCase();
  let status = (options.status || '').trim().toUpperCase();

  // Normalisasi status lama jika ada
  if (status === 'HADIR') status = 'CHECK_IN';
  if (status === 'BELUM_HADIR') status = 'REGISTRASI';
  // Normalisasi status jika ada
  if (status === 'HADIR' || status === 'CHECK_IN') status = 'CHECK-IN';
  if (status === 'BELUM_HADIR' || status === 'REGISTRASI') status = 'TEREGISTRASI';

  const dateFrom = options.dateFrom ? new Date(options.dateFrom).getTime() : null;
  const dateTo = options.dateTo ? new Date(options.dateTo).getTime() : null;

  let filtered = guests.filter(g => {
    // 1. Text Search
    if (rawSearch) {
      const matchNama = (g.nama || '').toLowerCase().includes(rawSearch);
      const matchNrp = (g.nrp || '').toLowerCase().includes(rawSearch);
      const matchJabatan = (g.jabatan || '').toLowerCase().includes(rawSearch);
      const matchSatker = (g.satker || '').toLowerCase().includes(rawSearch);
      const matchSatuan = (g.satuan || '').toLowerCase().includes(rawSearch);
      const matchEmail = (g.email || '').toLowerCase().includes(rawSearch);
      const matchHp = (g.no_hp || '').toLowerCase().includes(rawSearch);
      const matchKursi = (g.seat_assignment || g.seat_number || '').toLowerCase().includes(rawSearch);

      if (!matchNama && !matchNrp && !matchJabatan && !matchSatker && !matchSatuan && !matchEmail && !matchHp && !matchKursi) {
        return false;
      }
    }

    // 2. Matra Filter
    if (matra && matra !== 'ALL') {
      if (g.matra?.toUpperCase() !== matra) {
        return false;
      }
    }

    // 3. Pangkat Filter
    if (pangkat && pangkat !== 'all') {
      if (!(g.pangkat || '').toLowerCase().includes(pangkat)) {
        return false;
      }
    }

    // 4. Status Kehadiran Filter
    if (status && status !== 'ALL') {
      let guestStatus = (g.status_kehadiran || '').toUpperCase();
      if (guestStatus === 'HADIR') guestStatus = 'CHECK_IN';
      if (guestStatus === 'BELUM_HADIR') guestStatus = 'REGISTRASI';
      if (guestStatus === 'HADIR' || guestStatus === 'CHECK_IN') guestStatus = 'CHECK-IN';
      if (guestStatus === 'BELUM_HADIR' || guestStatus === 'REGISTRASI') guestStatus = 'TEREGISTRASI';

      if (guestStatus !== status) {
        return false;
      }
    }

    // 5. Date From Filter (berdasarkan created_at)
    if (dateFrom) {
      const createdAt = g.created_at ? new Date(g.created_at).getTime() : 0;
      if (createdAt < dateFrom) return false;
    }

    // 6. Date To Filter (berdasarkan created_at)
    if (dateTo) {
      const createdAt = g.created_at ? new Date(g.created_at).getTime() : 0;
      if (createdAt > dateTo) return false;
    }

    return true;
  });

  // Sorting
  const sortBy = options.sortBy || 'created_at';
  const sortDir = options.sortDir === 'asc' ? 1 : -1;

  filtered.sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (sortBy) {
      case 'nama':
        valA = (a.nama || '').toLowerCase();
        valB = (b.nama || '').toLowerCase();
        return valA.localeCompare(valB) * sortDir;
      case 'pangkat':
        valA = a.pangkat_level || 99;
        valB = b.pangkat_level || 99;
        return (valA - valB) * sortDir;
      case 'matra':
        valA = (a.matra || '').toLowerCase();
        valB = (b.matra || '').toLowerCase();
        return valA.localeCompare(valB) * sortDir;
      case 'status':
        valA = (a.status_kehadiran || '').toLowerCase();
        valB = (b.status_kehadiran || '').toLowerCase();
        return valA.localeCompare(valB) * sortDir;
      case 'waktu_kehadiran':
        valA = a.waktu_kehadiran_pertama ? new Date(a.waktu_kehadiran_pertama).getTime() : 0;
        valB = b.waktu_kehadiran_pertama ? new Date(b.waktu_kehadiran_pertama).getTime() : 0;
        return (valA - valB) * sortDir;
      case 'created_at':
      default:
        valA = a.created_at ? new Date(a.created_at).getTime() : 0;
        valB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return (valA - valB) * sortDir;
    }
  });

  return filtered;
}

