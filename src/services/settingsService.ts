import { SCHEMA_VERSION } from '../config.ts';
import type { UserSettings } from '../types.ts';

const SETTINGS_KEY = 'periodSafe_userSettings';

const DEFAULTS: UserSettings = {
  cycleLengthAverage: 28,
  cycleVariance: 3,
  reminderEnabled: false,
  reminderDaysBefore: 2,
  theme: 'light',
  schemaVersion: SCHEMA_VERSION,
};

export function getSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<UserSettings>) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(data: Partial<UserSettings>): UserSettings {
  const current = getSettings();
  const updated = { ...current, ...data };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function resetSettings(): UserSettings {
  localStorage.removeItem(SETTINGS_KEY);
  return { ...DEFAULTS };
}
