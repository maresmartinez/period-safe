import { useState, useEffect } from 'react';
import Modal from '../Modal.tsx';
import Button from '../Button.tsx';
import { formatDisplayDate } from '../../utils/dateUtils.ts';
import type { Period, Intimacy, FlowLevel, ProtectionLevel } from '../../types.ts';

const FLOW_LABELS: Record<FlowLevel, string> = { light: 'Light', medium: 'Medium', heavy: 'Heavy' };
const MOOD_CONFIG: Record<1 | 2 | 3 | 4 | 5, { face: string; label: string }> = {
  1: { face: '\u{1F623}', label: 'Horrible' },
  2: { face: '\u{1F61F}', label: 'Bad' },
  3: { face: '\u{1F610}', label: 'Okay' },
  4: { face: '\u{1F642}', label: 'Good' },
  5: { face: '\u{1F604}', label: 'Great' },
};
const PROTECTION_LABELS: Record<ProtectionLevel, string> = {
  protected: 'Protected',
  unprotected: 'Unprotected',
};

type TabType = 'period' | 'intimacy';

interface DualEntryModalProps {
  period: Period;
  intimacy: Intimacy;
  onClose: () => void;
  onEditPeriod: (period: Period) => void;
  onEditIntimacy: (intimacy: Intimacy) => void;
  onDeletePeriod: (id: string) => void;
  onDeleteIntimacy: (id: string) => void;
}

export default function DualEntryModal({
  period,
  intimacy,
  onClose,
  onEditPeriod,
  onEditIntimacy,
  onDeletePeriod,
  onDeleteIntimacy,
}: DualEntryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('period');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowConfirm(false);
  }, [activeTab, period, intimacy]);

  function handleDelete() {
    if (activeTab === 'period') {
      onDeletePeriod(period.id);
    } else {
      onDeleteIntimacy(intimacy.id);
    }
  }

  function handleEdit() {
    if (activeTab === 'period') {
      onEditPeriod(period);
    } else {
      onEditIntimacy(intimacy);
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Day Details" size="sm">
      <div role="tablist" className="flex border-b border-neutral-200 dark:border-neutral-700 mb-4">
        <button
          role="tab"
          aria-selected={activeTab === 'period'}
          onClick={() => setActiveTab('period')}
          className={`flex-1 py-2 text-sm font-medium transition-colors min-h-[48px] ${
            activeTab === 'period'
              ? 'text-rose-600 dark:text-rose-400 border-b-2 border-rose-500'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Period
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'intimacy'}
          onClick={() => setActiveTab('intimacy')}
          className={`flex-1 py-2 text-sm font-medium transition-colors min-h-[48px] ${
            activeTab === 'intimacy'
              ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
          }`}
        >
          Intimacy
        </button>
      </div>

      {activeTab === 'period' ? (
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-0.5">
              Start Date
            </dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {formatDisplayDate(period.startDate)}
            </dd>
          </div>

          {period.endDate && (
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-0.5">
                End Date
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                {formatDisplayDate(period.endDate)}
              </dd>
            </div>
          )}

          {period.flow && (
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-0.5">
                Flow
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                {FLOW_LABELS[period.flow] ?? period.flow}
              </dd>
            </div>
          )}

          {period.symptoms?.length > 0 && (
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-1">
                Symptoms
              </dt>
              <dd>
                <ul className="flex flex-wrap gap-1.5" aria-label="Symptoms">
                  {period.symptoms.map((s) => (
                    <li
                      key={s}
                      className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded-full text-xs capitalize"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}

          {period.mood !== null && (
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-0.5">
                Mood
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                <span aria-hidden="true">{MOOD_CONFIG[period.mood].face}</span>
                {' '}
                {MOOD_CONFIG[period.mood].label}
              </dd>
            </div>
          )}

          {period.notes && (
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-0.5">
                Notes
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                {period.notes}
              </dd>
            </div>
          )}
        </dl>
      ) : (
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-0.5">
              Date
            </dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {formatDisplayDate(intimacy.date)}
            </dd>
          </div>

          <div>
            <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-0.5">
              Protection
            </dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {intimacy.protection
                ? PROTECTION_LABELS[intimacy.protection]
                : 'Not specified'}
            </dd>
          </div>

          {intimacy.notes && (
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-0.5">
                Notes
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                {intimacy.notes}
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        {showConfirm ? (
          <div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
              Delete this {activeTab === 'period' ? 'period' : 'entry'}? This can&apos;t be undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                Yes, delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowConfirm(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
