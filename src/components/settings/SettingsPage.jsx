import { useState, useEffect } from 'react';
import Card from '../Card.jsx';
import Button from '../Button.jsx';
import LoadingSpinner from '../LoadingSpinner.jsx';
import { useToast } from '../../hooks/useToast.js';
import useSettings from '../../hooks/useSettings.js';

export default function SettingsPage() {
  const { settings, saveSettings, resetSettings, loading } = useSettings();
  const { showToast } = useToast();

  const [cycleLength, setCycleLength] = useState('');
  const [cycleLengthError, setCycleLengthError] = useState('');

  useEffect(() => {
    if (settings) {
      setCycleLength(String(settings.cycleLengthAverage));
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const handleCycleSave = () => {
    const val = Number(cycleLength);
    if (!cycleLength || isNaN(val) || !Number.isInteger(val) || val < 21 || val > 35) {
      setCycleLengthError('Please enter a whole number between 21 and 35.');
      return;
    }
    setCycleLengthError('');
    saveSettings({ cycleLengthAverage: val });
    showToast({ type: 'success', message: 'Cycle length saved.' });
  };

  const handleThemeChange = (theme) => {
    saveSettings({ theme });
  };

  const handleReset = () => {
    resetSettings();
    setCycleLengthError('');
    showToast({ type: 'info', message: 'Settings reset to defaults.' });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        Settings
      </h1>

      {/* Cycle Settings */}
      <section aria-labelledby="cycle-heading" className="mb-6">
        <Card>
          <h2
            id="cycle-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            Cycle
          </h2>
          <div className="space-y-2">
            <label
              htmlFor="cycle-length"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Average cycle length
            </label>
            <input
              id="cycle-length"
              type="number"
              min="21"
              max="35"
              value={cycleLength}
              onChange={(e) => {
                setCycleLength(e.target.value);
                setCycleLengthError('');
              }}
              aria-describedby={`cycle-length-desc${cycleLengthError ? ' cycle-length-error' : ''}`}
              className="block w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[48px]"
            />
            <p id="cycle-length-desc" className="text-xs text-neutral-500 dark:text-neutral-400">
              Used to improve prediction accuracy. Typical range: 21–35 days.
            </p>
            {cycleLengthError && (
              <p id="cycle-length-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
                {cycleLengthError}
              </p>
            )}
            <Button onClick={handleCycleSave} className="mt-2">
              Save
            </Button>
          </div>
        </Card>
      </section>

      {/* Reminders */}
      <section aria-labelledby="reminders-heading" className="mb-6">
        <Card>
          <h2
            id="reminders-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            Reminders
          </h2>
          <div className="flex items-start justify-between gap-4 opacity-50">
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Period reminders
              </p>
              <p
                id="reminders-desc"
                className="text-xs text-neutral-500 dark:text-neutral-400 mt-1"
              >
                Coming soon — notifications are not yet available in this version.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={false}
              aria-label="Period reminders"
              aria-describedby="reminders-desc"
              disabled
              className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-neutral-200 dark:bg-neutral-600 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow" />
            </button>
          </div>
        </Card>
      </section>

      {/* Appearance */}
      <section aria-labelledby="appearance-heading" className="mb-6">
        <Card>
          <h2
            id="appearance-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4"
          >
            Appearance
          </h2>
          <p
            id="theme-label"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3"
          >
            Color theme
          </p>
          <div role="group" aria-labelledby="theme-label" className="flex gap-2">
            <button
              aria-pressed={settings.theme === 'light'}
              onClick={() => handleThemeChange('light')}
              className={[
                'flex-1 rounded-lg border px-4 py-2 text-sm font-medium min-h-[48px] transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
                settings.theme === 'light'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                  : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700',
              ].join(' ')}
            >
              Light
            </button>
            <button
              aria-pressed={settings.theme === 'dark'}
              onClick={() => handleThemeChange('dark')}
              className={[
                'flex-1 rounded-lg border px-4 py-2 text-sm font-medium min-h-[48px] transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
                settings.theme === 'dark'
                  ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                  : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700',
              ].join(' ')}
            >
              Dark
            </button>
          </div>
        </Card>
      </section>

      {/* Reset */}
      <div className="text-center">
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset to defaults
        </Button>
      </div>
    </div>
  );
}
