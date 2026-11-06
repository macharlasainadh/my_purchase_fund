import { afterEach, describe, expect, it } from 'vitest';
import { getLastModule, getThemePreference, setLastModule, setThemePreference } from '../src/platform/preferences';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  },
});

afterEach(() => values.clear());
afterEach(() => {
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else delete (globalThis as { localStorage?: Storage }).localStorage;
});

describe('shared application preferences', () => {
  it('persists one theme choice while the active module changes', () => {
    setThemePreference('dark');
    setLastModule('payment-tracker');
    expect(getThemePreference()).toBe('dark');
    expect(getLastModule()).toBe('payment-tracker');

    setLastModule('purchase-fund');
    expect(getLastModule()).toBe('purchase-fund');
    expect(getThemePreference()).toBe('dark');

    setThemePreference('light');
    expect(getThemePreference()).toBe('light');
    expect(getLastModule()).toBe('purchase-fund');
  });
});
