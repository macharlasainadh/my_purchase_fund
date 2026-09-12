import { format, parseISO } from 'date-fns';

/**
 * Safely format an ISO date string without throwing RangeError on invalid / empty dates.
 * Returns fallback string if date is missing or invalid.
 */
export function formatDateSafe(
  dateStr?: string | null,
  formatStr: string = 'MMM d, yyyy',
  fallback: string = ''
): string {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return fallback;
  }
  try {
    const parsed = parseISO(dateStr);
    if (isNaN(parsed.getTime())) {
      return fallback;
    }
    return format(parsed, formatStr);
  } catch {
    return fallback;
  }
}

/**
 * Check if a target date string is valid and in the past.
 */
export function isPastDate(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  try {
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  } catch {
    return false;
  }
}

/**
 * Safely parse an ISO date string, returning null if invalid or missing.
 */
export function parseISOSafe(dateStr?: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) return null;
  try {
    const parsed = parseISO(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}
