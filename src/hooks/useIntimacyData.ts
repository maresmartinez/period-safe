import { useState, useEffect, useCallback } from 'react';
import {
  getAllIntimacy,
  createIntimacy as svcCreate,
  updateIntimacy as svcUpdate,
  deleteIntimacy as svcDelete,
} from '../services/intimacyService.ts';
import type { Intimacy } from '../types.ts';

export interface UseIntimacyDataReturn {
  intimacy: Intimacy[];
  loading: boolean;
  error: unknown;
  createIntimacy: (data: Omit<Intimacy, 'id' | 'schemaVersion'>) => Promise<Intimacy>;
  updateIntimacy: (id: string, data: Partial<Omit<Intimacy, 'id' | 'schemaVersion'>>) => Promise<Intimacy>;
  deleteIntimacy: (id: string) => Promise<void>;
}

export default function useIntimacyData(): UseIntimacyDataReturn {
  const [intimacy, setIntimacy] = useState<Intimacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllIntimacy();
      setIntimacy(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createIntimacy = useCallback(
    async (data: Omit<Intimacy, 'id' | 'schemaVersion'>) => {
      const entry = await svcCreate(data);
      await refresh();
      return entry;
    },
    [refresh]
  );

  const updateIntimacy = useCallback(
    async (id: string, data: Partial<Omit<Intimacy, 'id' | 'schemaVersion'>>) => {
      const entry = await svcUpdate(id, data);
      await refresh();
      return entry;
    },
    [refresh]
  );

  const deleteIntimacy = useCallback(
    async (id: string) => {
      await svcDelete(id);
      await refresh();
    },
    [refresh]
  );

  return { intimacy, loading, error, createIntimacy, updateIntimacy, deleteIntimacy };
}
