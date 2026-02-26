import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPeriod,
  getAllPeriods,
  createPeriod,
  updatePeriod,
  deletePeriod,
  clearAllPeriods,
} from './periodService.js';
import { resetDB } from './db.js';
import { getSettings, saveSettings, resetSettings } from './settingsService.js';

// Reset data layer before each test.
// resetDB() clears the db singleton so each test opens a fresh connection.
// clearAllPeriods() empties the store for the test that runs after.
beforeEach(async () => {
  resetDB();
  resetSettings();
  await clearAllPeriods();
});

// ---------------------------------------------------------------------------
// createPeriod
// ---------------------------------------------------------------------------
describe('createPeriod', () => {
  it('creates a period with required startDate and returns with id and schemaVersion', async () => {
    const period = await createPeriod({ startDate: '2025-01-01' });
    expect(period.id).toBeTruthy();
    expect(period.startDate).toBe('2025-01-01');
    expect(period.schemaVersion).toBe(1);
  });

  it('defaults flow, mood, symptoms, notes to null/[]', async () => {
    const period = await createPeriod({ startDate: '2025-01-01' });
    expect(period.flow).toBeNull();
    expect(period.mood).toBeNull();
    expect(period.symptoms).toEqual([]);
    expect(period.notes).toBeNull();
  });

  it('stores optional fields when provided', async () => {
    const period = await createPeriod({
      startDate: '2025-01-01',
      endDate: '2025-01-05',
      flow: 'medium',
      mood: 3,
      symptoms: ['cramps', 'fatigue'],
      notes: 'rough week',
    });
    expect(period.endDate).toBe('2025-01-05');
    expect(period.flow).toBe('medium');
    expect(period.mood).toBe(3);
    expect(period.symptoms).toEqual(['cramps', 'fatigue']);
    expect(period.notes).toBe('rough week');
  });

  it('throws VALIDATION_ERROR when startDate is missing', async () => {
    await expect(createPeriod({ endDate: '2025-01-01' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('throws VALIDATION_ERROR for invalid startDate format', async () => {
    await expect(createPeriod({ startDate: 'not-a-date' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('throws VALIDATION_ERROR when endDate < startDate', async () => {
    await expect(
      createPeriod({ startDate: '2025-01-10', endDate: '2025-01-05' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('throws VALIDATION_ERROR for invalid flow value', async () => {
    await expect(
      createPeriod({ startDate: '2025-01-01', flow: 'extreme' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('throws VALIDATION_ERROR for mood out of range', async () => {
    await expect(
      createPeriod({ startDate: '2025-01-01', mood: 6 })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

// ---------------------------------------------------------------------------
// getAllPeriods
// ---------------------------------------------------------------------------
describe('getAllPeriods', () => {
  it('returns empty array when no records exist', async () => {
    const periods = await getAllPeriods();
    expect(periods).toEqual([]);
  });

  it('returns periods sorted by startDate descending', async () => {
    await createPeriod({ startDate: '2025-01-01' });
    await createPeriod({ startDate: '2025-03-01' });
    await createPeriod({ startDate: '2025-02-01' });
    const periods = await getAllPeriods();
    expect(periods[0].startDate).toBe('2025-03-01');
    expect(periods[1].startDate).toBe('2025-02-01');
    expect(periods[2].startDate).toBe('2025-01-01');
  });
});

// ---------------------------------------------------------------------------
// getPeriod
// ---------------------------------------------------------------------------
describe('getPeriod', () => {
  it('returns null for a missing id', async () => {
    const result = await getPeriod('non-existent-id');
    expect(result).toBeNull();
  });

  it('returns the correct record for a known id', async () => {
    const created = await createPeriod({ startDate: '2025-06-01' });
    const fetched = await getPeriod(created.id);
    expect(fetched).toEqual(created);
  });
});

// ---------------------------------------------------------------------------
// updatePeriod
// ---------------------------------------------------------------------------
describe('updatePeriod', () => {
  it('merges updated fields into existing record', async () => {
    const created = await createPeriod({ startDate: '2025-01-01' });
    const updated = await updatePeriod(created.id, { flow: 'heavy', mood: 5 });
    expect(updated.flow).toBe('heavy');
    expect(updated.mood).toBe(5);
    expect(updated.startDate).toBe('2025-01-01');
  });

  it('persists the update to the store', async () => {
    const created = await createPeriod({ startDate: '2025-01-01' });
    await updatePeriod(created.id, { notes: 'updated' });
    const fetched = await getPeriod(created.id);
    expect(fetched.notes).toBe('updated');
  });

  it('throws NOT_FOUND for a bad id', async () => {
    await expect(updatePeriod('bad-id', { flow: 'light' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

// ---------------------------------------------------------------------------
// deletePeriod
// ---------------------------------------------------------------------------
describe('deletePeriod', () => {
  it('removes the record', async () => {
    const created = await createPeriod({ startDate: '2025-01-01' });
    await deletePeriod(created.id);
    const fetched = await getPeriod(created.id);
    expect(fetched).toBeNull();
  });

  it('does not throw when deleting a missing id', async () => {
    await expect(deletePeriod('non-existent')).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// clearAllPeriods
// ---------------------------------------------------------------------------
describe('clearAllPeriods', () => {
  it('removes all periods', async () => {
    await createPeriod({ startDate: '2025-01-01' });
    await createPeriod({ startDate: '2025-02-01' });
    await clearAllPeriods();
    const periods = await getAllPeriods();
    expect(periods).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// settingsService
// ---------------------------------------------------------------------------
describe('settingsService', () => {
  it('getSettings returns defaults when localStorage is empty', () => {
    const settings = getSettings();
    expect(settings.cycleLengthAverage).toBe(28);
    expect(settings.theme).toBe('light');
    expect(settings.reminderEnabled).toBe(false);
    expect(settings.schemaVersion).toBe(1);
  });

  it('saveSettings persists and merges values', () => {
    saveSettings({ theme: 'dark', cycleLengthAverage: 30 });
    const settings = getSettings();
    expect(settings.theme).toBe('dark');
    expect(settings.cycleLengthAverage).toBe(30);
    expect(settings.reminderEnabled).toBe(false);
  });

  it('resetSettings returns defaults and clears localStorage', () => {
    saveSettings({ theme: 'dark' });
    const reset = resetSettings();
    expect(reset.theme).toBe('light');
    const settings = getSettings();
    expect(settings.theme).toBe('light');
  });
});
