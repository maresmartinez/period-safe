import { useState, useCallback } from 'react';
import {
  getSettings,
  saveSettings as svcSave,
  resetSettings as svcReset,
} from '../services/settingsService.ts';
import type { UserSettings } from '../types.ts';

export function applyTheme(theme: string): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export interface UseSettingsReturn {
  settings: UserSettings;
  saveSettings: (partial: Partial<UserSettings>) => UserSettings;
  resetSettings: () => UserSettings;
  loading: false;
}

export default function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());

  const saveSettings = useCallback((partial: Partial<UserSettings>) => {
    const updated = svcSave(partial);
    setSettings(updated);
    if ('theme' in partial) {
      applyTheme(updated.theme);
    }
    return updated;
  }, []);

  const resetSettings = useCallback(() => {
    const defaults = svcReset();
    setSettings(defaults);
    applyTheme(defaults.theme);
    return defaults;
  }, []);

  return { settings, saveSettings, resetSettings, loading: false };
}
