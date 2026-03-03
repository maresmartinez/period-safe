import { useNavigate, useLocation } from 'react-router-dom';
import LogEntryForm from './LogEntryForm.tsx';
import usePeriodData from '../../hooks/usePeriodData.ts';
import type { Period, Intimacy } from '../../types.ts';

export default function PeriodFormPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const editPeriod = (state as { period?: Period } | null)?.period ?? null;
  const editIntimacy =
    (state as { intimacy?: Intimacy } | null)?.intimacy ?? null;
  const { periods } = usePeriodData();

  const title = editPeriod
    ? 'Edit Period'
    : editIntimacy
      ? 'Edit Intimacy'
      : 'Log Entry';
  const initialMode = editIntimacy ? 'intimacy' : 'period';

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        {title}
      </h1>
      <LogEntryForm
        initialData={editPeriod}
        initialIntimacyData={editIntimacy}
        initialMode={initialMode}
        existingPeriods={periods}
        onSuccess={() => navigate('/')}
        onCancel={() => navigate('/')}
      />
    </div>
  );
}
