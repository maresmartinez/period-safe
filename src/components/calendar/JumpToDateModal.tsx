import { useState } from 'react';
import Modal from '../Modal.tsx';
import { toISODateString } from '../../utils/dateUtils.ts';

interface JumpToDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  anchorDate: Date;
  onJump: (iso: string) => void;
}

export default function JumpToDateModal({ isOpen, onClose, anchorDate, onJump }: JumpToDateModalProps) {
  const [value, setValue] = useState(() => toISODateString(anchorDate));
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value) {
      setError('Please enter a date.');
      return;
    }
    const parsed = new Date(value + 'T00:00:00');
    if (isNaN(parsed.getTime())) {
      setError('Please enter a valid date.');
      return;
    }
    onJump(value);
    onClose();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (error) setError(null);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Jump to Date" size="sm">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label
            htmlFor="jump-date-input"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            Date
          </label>
          <input
            id="jump-date-input"
            type="date"
            value={value}
            onChange={handleChange}
            aria-describedby={error ? 'jump-date-error' : undefined}
            className="w-full min-h-[48px] px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          {error && (
            <p id="jump-date-error" role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-4 text-sm font-medium rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-[48px] px-4 text-sm font-medium rounded-lg bg-rose-500 text-white hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-colors"
          >
            Go
          </button>
        </div>
      </form>
    </Modal>
  );
}
