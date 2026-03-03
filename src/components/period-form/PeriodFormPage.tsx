import { useNavigate, useLocation } from 'react-router-dom';
import LogEntryForm from './LogEntryForm.tsx';
import usePeriodData from '../../hooks/usePeriodData.ts';
import type { Period } from '../../types.ts';

export default function PeriodFormPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editPeriod = (state as { period?: Period } | null)?.period ?? null;
  const { periods } = usePeriodData();

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        {editPeriod ? 'Edit Period' : 'Log Entry'}
      </h1>
      <LogEntryForm
        initialData={editPeriod}
        existingPeriods={periods}
        onSuccess={() => navigate('/')}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
