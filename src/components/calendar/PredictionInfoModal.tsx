import Modal from '../Modal.tsx';

interface PredictionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PredictionInfoModal({ isOpen, onClose }: PredictionInfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About these predictions" size="md">
      <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-200">
        <p>
          Your predicted dates are based on patterns in the period history you&apos;ve logged so far.
          When the timing between periods changes a lot or there isn&apos;t much data yet, the
          predictions can be less precise.
        </p>
        <p>
          Cycle length can shift for many different reasons, and all bodies are different — having
          irregular cycles is very common. These predictions are meant as a gentle guide rather than
          an exact schedule.
        </p>
        <p>
          If something in your cycle doesn&apos;t feel right for you, or you have questions about your
          bleeding pattern, it may help to check in with a trusted healthcare professional.
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

