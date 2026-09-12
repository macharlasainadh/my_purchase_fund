/**
 * URL sanitization and normalization utilities to prevent XSS (javascript:, data: URIs, etc.)
 */

const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Normalizes user-input URL strings.
 * - Prepends 'https://' if no protocol was provided (e.g., 'amazon.in/item')
 * - Returns empty string if dangerous protocol (e.g. 'javascript:', 'data:', 'vbscript:')
 */
export function normalizeUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Reject dangerous protocols explicitly before any URL parsing
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return '';
  }

  try {
    // If it starts with http:// or https://, validate with URL constructor
    if (/^https?:\/\//i.test(trimmed)) {
      const parsed = new URL(trimmed);
      return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.href : '';
    }

    // If it has another protocol (e.g., ftp:, custom:), reject
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      return '';
    }

    // Default to https:// for bare domains/paths
    const withHttps = `https://${trimmed}`;
    const parsed = new URL(withHttps);
    return SAFE_PROTOCOLS.has(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

/**
 * Validates whether a given URL is a safe http(s) URL.
 */
export function isSafeHttpUrl(rawUrl?: string | null): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;

  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitizes a URL for safe rendering in an <a href="..."> tag.
 * Returns safe fallback '#' if invalid or dangerous.
 */
export function sanitizeUrl(rawUrl?: string | null): string {
  const normalized = normalizeUrl(rawUrl);
  return normalized || '#';
}
