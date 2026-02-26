import Modal from '../Modal.jsx';
import { formatDisplayDate } from '../../utils/dateUtils.js';

const FLOW_LABELS = { light: 'Light', medium: 'Medium', heavy: 'Heavy' };
const MOOD_LABELS = { 1: 'Very low', 2: 'Low', 3: 'Neutral', 4: 'Good', 5: 'Great' };

/**
 * Read-only modal displaying all fields of a logged period.
 *
 * @param {Object}   props
 * @param {Object|null} props.period  - The Period to display; null = closed
 * @param {Function} props.onClose
 */
export default function PeriodDetailModal({ period, onClose }) {
  return (
    <Modal isOpen={period !== null} onClose={onClose} title="Period Details" size="sm">
      {period && (
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

          {period.mood && (
            <div>
              <dt className="font-medium text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wide mb-0.5">
                Mood
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                {period.mood} / 5 &mdash; {MOOD_LABELS[period.mood]}
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
      )}
    </Modal>
  );
}
