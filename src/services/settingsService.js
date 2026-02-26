import { SCHEMA_VERSION } from '../config.js';

const SETTINGS_KEY = 'periodSafe_userSettings';

const DEFAULTS = {
  cycleLengthAverage: 28,
  cycleVariance: 3,
  reminderEnabled: false,
  reminderDaysBefore: 2,
  theme: 'light',
  schemaVersion: SCHEMA_VERSION,
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(data) {
  const current = getSettings();
  const updated = { ...current, ...data };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export function resetSettings() {
  localStorage.removeItem(SETTINGS_KEY);
  return { ...DEFAULTS };
}
