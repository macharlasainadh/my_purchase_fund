export type ThemePreference = 'system' | 'light' | 'dark';
export type PlatformModule = 'purchase-fund' | 'payment-tracker';

const THEME_KEY = 'platform_theme';
const LAST_MODULE_KEY = 'platform_last_module';
const SIDEBAR_COLLAPSED_KEY = 'platform_sidebar_collapsed';

function read(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Continue in memory when storage is unavailable. */ }
}

export function getThemePreference(): ThemePreference {
  const value = read(THEME_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}
export function setThemePreference(value: ThemePreference) {
  write(THEME_KEY, value);
  applyTheme(value);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('platform-theme-change'));
}
export function applyTheme(value = getThemePreference()) {
  const dark = value === 'dark' || (value === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', Boolean(dark));
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }
}
export function getLastModule(): PlatformModule {
  return read(LAST_MODULE_KEY) === 'payment-tracker' ? 'payment-tracker' : 'purchase-fund';
}
export function setLastModule(module: PlatformModule) { write(LAST_MODULE_KEY, module); }
export function getSidebarCollapsed() { return read(SIDEBAR_COLLAPSED_KEY) === 'true'; }
export function setSidebarCollapsed(collapsed: boolean) { write(SIDEBAR_COLLAPSED_KEY, String(collapsed)); }

