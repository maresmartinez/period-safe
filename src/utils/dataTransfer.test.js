import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateImportShape,
  exportData,
  importData,
  MAX_IMPORT_FILE_SIZE,
} from './dataTransfer.js';
import { getAllPeriods, createPeriod, clearAllPeriods } from '../services/periodService.js';
import { getSettings, saveSettings, resetSettings } from '../services/settingsService.js';
import { resetDB } from '../services/db.js';

beforeEach(async () => {
  resetDB();
  resetSettings();
  await clearAllPeriods();
});

// ---------------------------------------------------------------------------
// validateImportShape
// ---------------------------------------------------------------------------
describe('validateImportShape', () => {
  it('returns valid for a well-formed payload', () => {
    const payload = {
      schemaVersion: 1,
      exportedAt: '2025-03-15T10:30:00.000Z',
      appName: 'PeriodSafe',
      data: {
        periods: [{ id: 'abc-123', startDate: '2025-01-01' }],
        settings: { cycleLengthAverage: 28 },
      },
    };
    const result = validateImportShape(payload);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns valid for an empty periods array', () => {
    const payload = {
      schemaVersion: 1,
      data: { periods: [], settings: {} },
    };
    expect(validateImportShape(payload).valid).toBe(true);
  });

  it('returns invalid when the root is not an object', () => {
    const result = validateImportShape('not-an-object');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns invalid when data.periods is missing', () => {
    const payload = { schemaVersion: 1, data: { settings: {} } };
    const result = validateImportShape(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('periods'))).toBe(true);
  });

  it('returns invalid when data field is missing entirely', () => {
    const result = validateImportShape({ schemaVersion: 1 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('data'))).toBe(true);
  });

  it('returns invalid when schemaVersion is newer than current', () => {
    const payload = { schemaVersion: 999, data: { periods: [], settings: {} } };
    const result = validateImportShape(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('newer'))).toBe(true);
  });

  it('returns invalid when schemaVersion is not a number', () => {
    const payload = { schemaVersion: 'one', data: { periods: [], settings: {} } };
    const result = validateImportShape(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('schemaVersion'))).toBe(true);
  });

  it('returns invalid when a period is missing startDate', () => {
    const payload = {
      schemaVersion: 1,
      data: {
        periods: [{ id: 'abc-123' }],
        settings: {},
      },
    };
    const result = validateImportShape(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('startDate'))).toBe(true);
  });

  it('returns invalid when a period has an invalid startDate', () => {
    const payload = {
      schemaVersion: 1,
      data: {
        periods: [{ id: 'abc-123', startDate: 'not-a-date' }],
        settings: {},
      },
    };
    const result = validateImportShape(payload);
    expect(result.valid).toBe(false);
  });

  it('returns invalid when a period is missing id', () => {
    const payload = {
      schemaVersion: 1,
      data: {
        periods: [{ startDate: '2025-01-01' }],
        settings: {},
      },
    };
    const result = validateImportShape(payload);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('id'))).toBe(true);
  });

  it('is valid when data.settings is null (recoverable — defaults used)', () => {
    const payload = { schemaVersion: 1, data: { periods: [], settings: null } };
    expect(validateImportShape(payload).valid).toBe(true);
  });

  it('reports error when data.settings is an array', () => {
    const payload = { schemaVersion: 1, data: { periods: [], settings: [] } };
    const result = validateImportShape(payload);
    expect(result.valid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// exportData
// ---------------------------------------------------------------------------
describe('exportData', () => {
  it('returns JSON with correct envelope structure when db is empty', async () => {
    const json = await exportData();
    const parsed = JSON.parse(json);
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.appName).toBe('PeriodSafe');
    expect(typeof parsed.exportedAt).toBe('string');
    expect(Array.isArray(parsed.data.periods)).toBe(true);
    expect(typeof parsed.data.settings).toBe('object');
  });

  it('includes saved periods in the export', async () => {
    await createPeriod({ startDate: '2025-01-01', flow: 'medium' });
    const json = await exportData();
    const parsed = JSON.parse(json);
    expect(parsed.data.periods).toHaveLength(1);
    expect(parsed.data.periods[0].startDate).toBe('2025-01-01');
    expect(parsed.data.periods[0].flow).toBe('medium');
  });

  it('includes settings in the export', async () => {
    saveSettings({ theme: 'dark', cycleLengthAverage: 30 });
    const json = await exportData();
    const parsed = JSON.parse(json);
    expect(parsed.data.settings.theme).toBe('dark');
    expect(parsed.data.settings.cycleLengthAverage).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// importData — overwrite strategy
// ---------------------------------------------------------------------------
describe('importData (overwrite)', () => {
  it('clears existing periods and imports all from payload', async () => {
    // Seed existing data
    await createPeriod({ startDate: '2020-01-01' });

    const payload = {
      schemaVersion: 1,
      data: {
        periods: [
          { id: 'import-1', startDate: '2025-03-01' },
          { id: 'import-2', startDate: '2025-04-01' },
        ],
        settings: { cycleLengthAverage: 30 },
      },
    };

    await importData(payload, 'overwrite');

    const periods = await getAllPeriods();
    expect(periods).toHaveLength(2);
    expect(periods.map((p) => p.id)).toContain('import-1');
    expect(periods.map((p) => p.id)).toContain('import-2');
    // Original seeded period should be gone
    expect(periods.map((p) => p.startDate)).not.toContain('2020-01-01');
  });

  it('applies settings from the payload when overwriting', async () => {
    saveSettings({ cycleLengthAverage: 28 });

    const payload = {
      schemaVersion: 1,
      data: {
        periods: [],
        settings: { cycleLengthAverage: 35, theme: 'dark' },
      },
    };

    await importData(payload, 'overwrite');

    const settings = getSettings();
    expect(settings.cycleLengthAverage).toBe(35);
    expect(settings.theme).toBe('dark');
  });

  it('preserves original period IDs from the import file', async () => {
    const payload = {
      schemaVersion: 1,
      data: {
        periods: [{ id: 'preserved-id', startDate: '2025-05-01' }],
        settings: {},
      },
    };

    await importData(payload, 'overwrite');

    const periods = await getAllPeriods();
    expect(periods[0].id).toBe('preserved-id');
  });
});

// ---------------------------------------------------------------------------
// importData — merge strategy
// ---------------------------------------------------------------------------
describe('importData (merge)', () => {
  it('adds new periods without touching existing ones', async () => {
    const existing = await createPeriod({ startDate: '2025-01-01' });

    const payload = {
      schemaVersion: 1,
      data: {
        periods: [{ id: 'new-period', startDate: '2025-06-01' }],
        settings: { cycleLengthAverage: 35 },
      },
    };

    await importData(payload, 'merge');

    const periods = await getAllPeriods();
    expect(periods).toHaveLength(2);
    expect(periods.map((p) => p.id)).toContain(existing.id);
    expect(periods.map((p) => p.id)).toContain('new-period');
  });

  it('skips periods whose id already exists in the database', async () => {
    // Insert a period manually with a known ID
    const payload1 = {
      schemaVersion: 1,
      data: {
        periods: [{ id: 'dupe-id', startDate: '2025-01-01' }],
        settings: {},
      },
    };
    await importData(payload1, 'overwrite');

    // Now merge with the same period ID
    const payload2 = {
      schemaVersion: 1,
      data: {
        periods: [{ id: 'dupe-id', startDate: '2025-01-01' }],
        settings: {},
      },
    };
    await importData(payload2, 'merge');

    const periods = await getAllPeriods();
    expect(periods).toHaveLength(1);
  });

  it('does NOT apply settings from the payload when merging', async () => {
    saveSettings({ cycleLengthAverage: 28 });

    const payload = {
      schemaVersion: 1,
      data: {
        periods: [],
        settings: { cycleLengthAverage: 99 },
      },
    };

    await importData(payload, 'merge');

    const settings = getSettings();
    expect(settings.cycleLengthAverage).toBe(28);
  });
});

// ---------------------------------------------------------------------------
// MAX_IMPORT_FILE_SIZE
// ---------------------------------------------------------------------------
describe('MAX_IMPORT_FILE_SIZE', () => {
  it('is 10MB', () => {
    expect(MAX_IMPORT_FILE_SIZE).toBe(10 * 1024 * 1024);
  });
});
