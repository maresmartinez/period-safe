import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import usePeriodData from '../../hooks/usePeriodData.ts';
import useIntimacyData from '../../hooks/useIntimacyData.ts';
import PeriodDetailModal from '../calendar/PeriodDetailModal.tsx';
import IntimacyDetailModal from '../calendar/IntimacyDetailModal.tsx';
import Button from '../Button.tsx';
import LoadingSpinner from '../LoadingSpinner.tsx';
import { formatDisplayDate } from '../../utils/dateUtils.ts';
import type { Period, Intimacy } from '../../types.ts';

const FLOW_LABELS: Record<string, string> = { light: 'Light', medium: 'Medium', heavy: 'Heavy' };
const MOOD_LABELS: Record<number, { face: string; label: string }> = {
  1: { face: '😣', label: 'Horrible' },
  2: { face: '😟', label: 'Bad' },
  3: { face: '😐', label: 'Okay' },
  4: { face: '🙂', label: 'Good' },
  5: { face: '😄', label: 'Great' },
};

type HistoryEntry =
  | { type: 'period'; date: string; data: Period }
  | { type: 'intimacy'; date: string; data: Intimacy };

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
  const { periods, loading: periodsLoading, error: periodsError, deletePeriod } = usePeriodData();
  const { intimacy, loading: intimacyLoading, error: intimacyError, deleteIntimacy } = useIntimacyData();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [selectedIntimacy, setSelectedIntimacy] = useState<Intimacy | null>(null);
  const [filter, setFilter] = useState<'all' | 'period' | 'intimacy'>('all');

  const allEntries = useMemo((): HistoryEntry[] => {
    const periodEntries: HistoryEntry[] = periods.map((p) => ({
      type: 'period' as const,
      date: p.startDate,
      data: p,
    }));
    const intimacyEntries: HistoryEntry[] = intimacy.map((i) => ({
      type: 'intimacy' as const,
      date: i.date,
      data: i,
    }));

    const combined = [...periodEntries, ...intimacyEntries];
    combined.sort((a, b) => b.date.localeCompare(a.date));

    if (filter === 'period') return combined.filter((e) => e.type === 'period');
    if (filter === 'intimacy') return combined.filter((e) => e.type === 'intimacy');
    return combined;
  }, [periods, intimacy, filter]);

  if (periodsLoading || intimacyLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (periodsError || intimacyError) {
    const errorMsg = periodsError
      ? (periodsError as Error).message
      : (intimacyError as Error).message;
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400 px-4 py-8 text-center">
        Failed to load data: {errorMsg}
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
        History
      </h1>

      <div className="mb-4" role="tablist" aria-label="Filter entries">
        <div className="flex gap-2">
          {(['all', 'period', 'intimacy'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={[
                'min-h-[40px] px-4 rounded-lg border font-medium text-sm transition-colors',
                filter === f
                  ? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100 text-white dark:text-neutral-900'
                  : 'border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400',
              ].join(' ')}
            >
              {f === 'all' ? 'All' : f === 'period' ? 'Periods' : 'Intimacy'}
            </button>
          ))}
        </div>
      </div>

      {allEntries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">
            {filter === 'all'
              ? 'No entries logged yet.'
              : filter === 'period'
                ? 'No periods logged yet.'
                : 'No intimacy entries logged yet.'}
          </p>
          <Link
            to="/log"
            className="text-rose-500 dark:text-rose-400 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
          >
            Log your first entry
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
          <table
            aria-label="History entries"
            className="w-full text-sm text-left text-neutral-700 dark:text-neutral-300"
          >
            <thead className="bg-neutral-50 dark:bg-neutral-800 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              <tr>
                <th scope="col" className="px-4 py-3">Type</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3 hidden md:table-cell">End Date</th>
                <th scope="col" className="px-4 py-3 hidden md:table-cell">Duration</th>
                <th scope="col" className="px-4 py-3">Details</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {allEntries.map((entry) => {
                if (entry.type === 'period') {
                  const period = entry.data;
                  const mood = period.mood !== null ? MOOD_LABELS[period.mood] : null;
                  return (
                    <tr
                      key={period.id}
                      className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                          Period
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        {formatDisplayDate(period.startDate)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                        {period.endDate ? formatDisplayDate(period.endDate) : '—'}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">
                        {computeDuration(period.startDate, period.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          {period.flow ? FLOW_LABELS[period.flow] ?? period.flow : '—'}
                          {mood && (
                            <>
                              <span aria-hidden="true">{mood.face}</span>
                              <span className="sr-only">{mood.label}</span>
                            </>
                          )}
                        </span>
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
                } else {
                  const intim = entry.data;
                  return (
                    <tr
                      key={intim.id}
                      className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                          Intimacy
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                        {formatDisplayDate(intim.date)}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">—</td>
                      <td className="px-4 py-3 hidden md:table-cell whitespace-nowrap">—</td>
                      <td className="px-4 py-3">
                        {intim.protection === 'protected'
                          ? 'Protected'
                          : intim.protection === 'unprotected'
                            ? 'Unprotected'
                            : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedIntimacy(intim)}
                          aria-label={`View details for intimacy on ${formatDisplayDate(intim.date)}`}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                }
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

      <IntimacyDetailModal
        intimacy={selectedIntimacy}
        onClose={() => setSelectedIntimacy(null)}
        onEdit={(i) => {
          setSelectedIntimacy(null);
          navigate('/log', { state: { intimacy: i } });
        }}
        onDelete={(id) => {
          deleteIntimacy(id);
          setSelectedIntimacy(null);
        }}
      />
    </div>
  );
}
