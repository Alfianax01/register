import { MatraType } from '@/types';

export function formatDateTimeID(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateID(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatIndonesianDate(isoString?: string, monthFormat: 'long' | 'short' = 'long'): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: monthFormat,
      year: 'numeric'
    }).format(d);
  } catch {
    return String(isoString);
  }
}

export function formatTimeID(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatIndonesianTimeWIB(isoString?: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return String(isoString);
    const timeFormatted = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d).replace('.', ':');
    return `${timeFormatted} WIB`;
  } catch {
    return String(isoString);
  }
}

export function getMatraBadgeInfo(matra: MatraType): {
  label: string;
  badgeClass: string;
  borderClass: string;
  textColor: string;
  motto: string;
} {
  switch (matra) {
    case 'AD':
      return {
        label: 'TNI AD',
        badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-600',
        borderClass: 'border-emerald-600',
        textColor: 'text-emerald-400',
        motto: 'Kartika Eka Paksi'
      };
    case 'AL':
      return {
        label: 'TNI AL',
        badgeClass: 'bg-blue-950 text-blue-300 border-blue-600',
        borderClass: 'border-blue-600',
        textColor: 'text-blue-400',
        motto: 'Jalesveva Jayamahe'
      };
    case 'AU':
      return {
        label: 'TNI AU',
        badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-500',
        borderClass: 'border-cyan-500',
        textColor: 'text-cyan-400',
        motto: 'Swa Bhuwana Paksa'
      };
    case 'MABES':
      return {
        label: 'Mabes TNI',
        badgeClass: 'bg-amber-950 text-amber-300 border-amber-500',
        borderClass: 'border-amber-500',
        textColor: 'text-amber-400',
        motto: 'Tri Dharma Eka Karma'
      };
    case 'NON_TNI':
    default:
      return {
        label: 'K/L (Kementerian/Lembaga)',
        badgeClass: 'bg-slate-900 text-slate-300 border-slate-600',
        borderClass: 'border-slate-600',
        textColor: 'text-slate-300',
        motto: 'Tamu Kehormatan'
      };
  }
}

