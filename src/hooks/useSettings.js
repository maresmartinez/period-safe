import { useState, useEffect, useCallback } from 'react';
import {
  getSettings,
  saveSettings as svcSave,
  resetSettings as svcReset,
} from '../services/settingsService.js';

export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export default function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSettings();
    setSettings(s);
    applyTheme(s.theme);
    setLoading(false);
  }, []);

  const saveSettings = useCallback((partial) => {
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

  return { settings, saveSettings, resetSettings, loading };
}
