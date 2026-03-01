import Modal from '../Modal.tsx';

interface PredictionUncertaintyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PredictionUncertaintyModal({
  isOpen,
  onClose,
}: PredictionUncertaintyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Why these dates may shift"
      size="sm"
    >
      <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
        <p>
          Your logged cycles vary quite a bit or there is limited data, so treat
          these dates as a gentle guide, not an exact schedule.
        </p>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[48px] px-4 text-sm font-medium rounded-lg bg-rose-500 text-white hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-colors"
        >
          Got it
        </button>
      </div>
    </Modal>
  );
}

