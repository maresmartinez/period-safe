import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePeriodData from '../../hooks/usePeriodData.ts';
import PeriodDetailModal from '../calendar/PeriodDetailModal.tsx';
import Button from '../Button.tsx';
import LoadingSpinner from '../LoadingSpinner.tsx';
import { formatDisplayDate } from '../../utils/dateUtils.ts';
import type { Period } from '../../types.ts';

const FLOW_LABELS: Record<string, string> = { light: 'Light', medium: 'Medium', heavy: 'Heavy' };
const MOOD_LABELS: Record<number, { face: string; label: string }> = {
  1: { face: '😣', label: 'Horrible' },
  2: { face: '😟', label: 'Bad' },
  3: { face: '😐', label: 'Okay' },
  4: { face: '🙂', label: 'Good' },
  5: { face: '😄', label: 'Great' },
};

function computeDuration(startDate: string, endDate: string | null): string {
  if (!endDate) return 'Ongoing';
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const diffMs = end.getTime() - start.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return `${days} day${days !== 1 ? 's' : ''}`;
}

export default function HistoryPage() {
  const { periods, loading, error, deletePeriod } = usePeriodData();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400 px-4 py-8 text-center">
        Failed to load periods: {(error as Error).message}
      </p>
    );
  }

  const sorted = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
        Period History
      </h1>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">No periods logged yet.</p>
          <Link
            to="/log"
            className="text-rose-500 dark:text-rose-400 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
          >
            Log your first period
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
          <table
            aria-label="Period history"
            className="w-full text-sm text-left text-neutral-700 dark:text-neutral-300"
          >
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <tr>
                <th scope="col" className="px-4 py-3">Start Date</th>
                <th scope="col" className="px-4 py-3">End Date</th>
                <th scope="col" className="px-4 py-3 hidden md:table-cell">Duration</th>
                <th scope="col" className="px-4 py-3">Flow</th>
                <th scope="col" className="px-4 py-3 hidden md:table-cell">Mood</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {sorted.map((period) => {
                const mood = period.mood !== null ? MOOD_LABELS[period.mood] : null;
                return (
                  <tr
                    key={period.id}
                    className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                      {formatDisplayDate(period.startDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {period.endDate ? formatDisplayDate(period.endDate) : '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                      {computeDuration(period.startDate, period.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      {period.flow ? FLOW_LABELS[period.flow] ?? period.flow : '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {mood ? (
                        <span>
                          <span aria-hidden="true">{mood.face}</span>{' '}
                          {mood.label}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPeriod(period)}
                        aria-label={`View details for period starting ${formatDisplayDate(period.startDate)}`}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PeriodDetailModal
        period={selectedPeriod}
        onClose={() => setSelectedPeriod(null)}
        onEdit={(p) => {
          setSelectedPeriod(null);
          navigate('/log', { state: { period: p } });
        }}
        onDelete={(id) => {
          deletePeriod(id);
          setSelectedPeriod(null);
        }}
      />
    </div>
  );
}
