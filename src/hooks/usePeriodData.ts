import { useState, useEffect, useCallback } from 'react';
import {
  getAllPeriods,
  createPeriod as svcCreate,
  updatePeriod as svcUpdate,
  deletePeriod as svcDelete,
} from '../services/periodService.ts';
import type { Period } from '../types.ts';

export interface UsePeriodDataReturn {
  periods: Period[];
  loading: boolean;
  error: unknown;
  createPeriod: (data: Omit<Period, 'id' | 'schemaVersion'>) => Promise<Period>;
  updatePeriod: (id: string, data: Partial<Omit<Period, 'id' | 'schemaVersion'>>) => Promise<Period>;
  deletePeriod: (id: string) => Promise<void>;
}

/**
 * Provides period data and CRUD actions.
 */
export default function usePeriodData(): UsePeriodDataReturn {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPeriods();
      setPeriods(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createPeriod = useCallback(
    async (data: Omit<Period, 'id' | 'schemaVersion'>) => {
      const period = await svcCreate(data);
      await refresh();
      return period;
    },
    [refresh]
  );

  const updatePeriod = useCallback(
    async (id: string, data: Partial<Omit<Period, 'id' | 'schemaVersion'>>) => {
      const period = await svcUpdate(id, data);
      await refresh();
      return period;
    },
    [refresh]
  );

  const deletePeriod = useCallback(
    async (id: string) => {
      await svcDelete(id);
      await refresh();
    },
    [refresh]
  );

  return { periods, loading, error, createPeriod, updatePeriod, deletePeriod };
}
