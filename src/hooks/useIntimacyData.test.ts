import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { resetDB } from '../services/db.ts';
import { clearAllIntimacy, getIntimacy } from '../services/intimacyService.ts';
import useIntimacyData from './useIntimacyData.ts';

describe('useIntimacyData', () => {
  beforeEach(async () => {
    resetDB();
    await clearAllIntimacy();
  });

  it('starts with empty intimacy array and loading true', () => {
    const { result } = renderHook(() => useIntimacyData());

    expect(result.current.intimacy).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('loads intimacy entries on mount', async () => {
    const { result } = renderHook(() => useIntimacyData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.intimacy).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('creates intimacy entry', async () => {
    const { result } = renderHook(() => useIntimacyData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntry = await act(async () => {
      return result.current.createIntimacy({
        date: '2024-01-15',
        protection: 'protected',
        notes: 'Test notes',
      });
    });

    expect(newEntry.id).toBeDefined();
    expect(newEntry.date).toBe('2024-01-15');
    expect(newEntry.protection).toBe('protected');
    expect(newEntry.notes).toBe('Test notes');
    expect(newEntry.schemaVersion).toBe(1);

    await waitFor(() => {
      expect(result.current.intimacy).toHaveLength(1);
    });

    expect(result.current.intimacy[0]).toEqual(newEntry);
  });

  it('updates intimacy entry', async () => {
    const { result } = renderHook(() => useIntimacyData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const created = await act(async () => {
      return result.current.createIntimacy({
        date: '2024-01-15',
        protection: 'protected',
        notes: 'Original notes',
      });
    });

    const updated = await act(async () => {
      return result.current.updateIntimacy(created.id, {
        protection: 'unprotected',
        notes: 'Updated notes',
      });
    });

    expect(updated.id).toBe(created.id);
    expect(updated.protection).toBe('unprotected');
    expect(updated.notes).toBe('Updated notes');
    expect(updated.date).toBe('2024-01-15');

    await waitFor(() => {
      expect(result.current.intimacy).toHaveLength(1);
    });

    expect(result.current.intimacy[0]).toEqual(updated);
  });

  it('deletes intimacy entry', async () => {
    const { result } = renderHook(() => useIntimacyData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const created = await act(async () => {
      return result.current.createIntimacy({
        date: '2024-01-15',
        protection: null,
        notes: null,
      });
    });

    await waitFor(() => {
      expect(result.current.intimacy).toHaveLength(1);
    });

    await act(async () => {
      await result.current.deleteIntimacy(created.id);
    });

    await waitFor(() => {
      expect(result.current.intimacy).toHaveLength(0);
    });

    const fromDb = await getIntimacy(created.id);
    expect(fromDb).toBeNull();
  });
});
