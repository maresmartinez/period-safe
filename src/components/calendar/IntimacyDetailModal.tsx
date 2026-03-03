import { useState, useEffect } from 'react';
import Modal from '../Modal.tsx';
import Button from '../Button.tsx';
import { formatDisplayDate } from '../../utils/dateUtils.ts';
import type { Intimacy, ProtectionLevel } from '../../types.ts';

const PROTECTION_LABELS: Record<ProtectionLevel, string> = {
  protected: 'Protected',
  unprotected: 'Unprotected',
};

interface IntimacyDetailModalProps {
  intimacy: Intimacy | null;
  onClose: () => void;
  onEdit: (intimacy: Intimacy) => void;
  onDelete: (id: string) => void;
}

export default function IntimacyDetailModal({ intimacy, onClose, onEdit, onDelete }: IntimacyDetailModalProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowConfirm(false);
  }, [intimacy]);

  return (
    <Modal isOpen={intimacy !== null} onClose={onClose} title="Intimacy Details" size="sm">
      {intimacy && (
        <>
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

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            {showConfirm ? (
              <div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                  Delete this entry? This can&apos;t be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(intimacy.id)}
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
                  onClick={() => onEdit(intimacy)}
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
