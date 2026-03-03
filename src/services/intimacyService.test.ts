import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import {
  getIntimacy,
  getAllIntimacy,
  createIntimacy,
  updateIntimacy,
  deleteIntimacy,
  clearAllIntimacy,
} from './intimacyService.ts';
import { resetDB } from './db.ts';

beforeEach(async () => {
  resetDB();
  await clearAllIntimacy();
});

describe('createIntimacy', () => {
  it('creates entry with required date and returns with id and schemaVersion', async () => {
    const entry = await createIntimacy({ date: '2025-01-15' });
    expect(entry.id).toBeTruthy();
    expect(entry.date).toBe('2025-01-15');
    expect(entry.schemaVersion).toBe(1);
  });

  it('creates entry with all fields', async () => {
    const entry = await createIntimacy({
      date: '2025-01-15',
      protection: 'protected',
      notes: 'Test notes',
    });
    expect(entry.protection).toBe('protected');
    expect(entry.notes).toBe('Test notes');
  });

  it('defaults protection and notes to null', async () => {
    const entry = await createIntimacy({ date: '2025-01-15' });
    expect(entry.protection).toBeNull();
    expect(entry.notes).toBeNull();
  });

  it('throws VALIDATION_ERROR when date is missing', async () => {
    await expect(
      createIntimacy({} as { date: string })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('throws VALIDATION_ERROR for invalid date format', async () => {
    await expect(createIntimacy({ date: 'not-a-date' })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('throws VALIDATION_ERROR for future date', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureStr = futureDate.toISOString().split('T')[0];
    await expect(createIntimacy({ date: futureStr })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('accepts null protection', async () => {
    const entry = await createIntimacy({ date: '2025-01-15', protection: null });
    expect(entry.protection).toBeNull();
  });

  it('rejects invalid protection value', async () => {
    await expect(
      createIntimacy({ date: '2025-01-15', protection: 'invalid' as 'protected' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('rejects notes over 500 chars', async () => {
    const longNotes = 'a'.repeat(501);
    await expect(
      createIntimacy({ date: '2025-01-15', notes: longNotes })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('accepts exactly 500 char notes', async () => {
    const notes = 'a'.repeat(500);
    const entry = await createIntimacy({ date: '2025-01-15', notes });
    expect(entry.notes).toBe(notes);
  });
});

describe('getIntimacy', () => {
  it('returns null for non-existent id', async () => {
    const result = await getIntimacy('non-existent-id');
    expect(result).toBeNull();
  });

  it('returns entry by id', async () => {
    const created = await createIntimacy({ date: '2025-01-15' });
    const fetched = await getIntimacy(created.id);
    expect(fetched).toEqual(created);
  });
});

describe('getAllIntimacy', () => {
  it('returns empty array when no entries', async () => {
    const entries = await getAllIntimacy();
    expect(entries).toEqual([]);
  });

  it('returns all entries sorted by date descending', async () => {
    await createIntimacy({ date: '2025-01-15' });
    await createIntimacy({ date: '2025-03-10' });
    await createIntimacy({ date: '2025-02-20' });
    const entries = await getAllIntimacy();
    expect(entries).toHaveLength(3);
    expect(entries[0].date).toBe('2025-03-10');
    expect(entries[1].date).toBe('2025-02-20');
    expect(entries[2].date).toBe('2025-01-15');
  });
});

describe('updateIntimacy', () => {
  it('updates existing entry', async () => {
    const created = await createIntimacy({ date: '2025-01-15' });
    const updated = await updateIntimacy(created.id, { protection: 'unprotected' });
    expect(updated.protection).toBe('unprotected');
    expect(updated.date).toBe('2025-01-15');
  });

  it('persists the update', async () => {
    const created = await createIntimacy({ date: '2025-01-15' });
    await updateIntimacy(created.id, { notes: 'updated notes' });
    const fetched = await getIntimacy(created.id);
    expect(fetched!.notes).toBe('updated notes');
  });

  it('throws NOT_FOUND for non-existent id', async () => {
    await expect(
      updateIntimacy('non-existent', { protection: 'protected' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('validates updated fields', async () => {
    const created = await createIntimacy({ date: '2025-01-15' });
    await expect(
      updateIntimacy(created.id, { protection: 'invalid' as 'protected' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('deleteIntimacy', () => {
  it('deletes existing entry', async () => {
    const created = await createIntimacy({ date: '2025-01-15' });
    await deleteIntimacy(created.id);
    const fetched = await getIntimacy(created.id);
    expect(fetched).toBeNull();
  });

  it('does not throw for non-existent id', async () => {
    await expect(deleteIntimacy('non-existent')).resolves.toBeUndefined();
  });
});

describe('clearAllIntimacy', () => {
  it('clears all entries', async () => {
    await createIntimacy({ date: '2025-01-15' });
    await createIntimacy({ date: '2025-02-20' });
    await clearAllIntimacy();
    const entries = await getAllIntimacy();
    expect(entries).toEqual([]);
  });
});
