import { useState, useEffect } from 'react';
import Modal from '../Modal.jsx';
import Button from '../Button.jsx';
import { formatDisplayDate } from '../../utils/dateUtils.js';

const FLOW_LABELS = { light: 'Light', medium: 'Medium', heavy: 'Heavy' };
const MOOD_LABELS = { 1: 'Very low', 2: 'Low', 3: 'Neutral', 4: 'Good', 5: 'Great' };

/**
 * Modal displaying all fields of a logged period, with Edit and Delete actions.
 *
 * @param {Object}      props
 * @param {Object|null} props.period    - The Period to display; null = closed
 * @param {Function}    props.onClose
 * @param {Function}    [props.onEdit]    - Called with the period object when Edit is clicked
 * @param {Function}    [props.onDelete]  - Called with the period id when delete is confirmed
 */
export default function PeriodDetailModal({ period, onClose, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  // Reset confirmation state whenever the period changes
  useEffect(() => {
    setShowConfirm(false);
  }, [period]);

  return (
    <Modal isOpen={period !== null} onClose={onClose} title="Period Details" size="sm">
      {period && (
        <>
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

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            {showConfirm ? (
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                  Delete this period? This can&apos;t be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete?.(period.id)}
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
                  onClick={() => onEdit?.(period)}
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
        </>
      )}
    </Modal>
  );
}
