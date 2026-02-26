import { useState, useEffect, useCallback } from 'react';
import {
  getAllPeriods,
  createPeriod as svcCreate,
  updatePeriod as svcUpdate,
  deletePeriod as svcDelete,
} from '../services/periodService.js';

/**
 * Provides period data and CRUD actions.
 * Returns: { periods, loading, error, createPeriod, updatePeriod, deletePeriod }
 */
export default function usePeriodData() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    async (data) => {
      const period = await svcCreate(data);
      await refresh();
      return period;
    },
    [refresh]
  );

  const updatePeriod = useCallback(
    async (id, data) => {
      const period = await svcUpdate(id, data);
      await refresh();
      return period;
    },
    [refresh]
  );

  const deletePeriod = useCallback(
    async (id) => {
      await svcDelete(id);
      await refresh();
    },
    [refresh]
  );

  return { periods, loading, error, createPeriod, updatePeriod, deletePeriod };
}
