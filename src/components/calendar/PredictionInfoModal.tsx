import Modal from '../Modal.tsx';

interface PredictionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PredictionInfoModal({ isOpen, onClose }: PredictionInfoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About these predictions" size="md">
      <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-200">
        <div className="space-y-3">
          <p>
            These dates are estimated from the periods you&apos;ve logged so far. When cycles vary a lot
            or there isn&apos;t much history yet, the predictions become more approximate.
          </p>
          <p>
            They&apos;re meant as a helpful guide, not an exact schedule. If something in your cycle
            doesn&apos;t feel right for you, it may help to check in with a trusted healthcare
            professional.
          </p>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            How ovulation &amp; fertility dates are estimated
          </h3>
          <p>
            Ovulation is predicted to occur approximately 14 days before your next expected period.
            This uses the luteal phase — the time between ovulation and the start of your period —
            which stays relatively constant at around 14 days regardless of overall cycle length.
          </p>
          <p>
            The fertile window is typically 5 days before ovulation through 1 day after ovulation
            — a 6-day window. Sperm can survive for up to 5 days, so pregnancy is most possible
            during this window.
          </p>
          <p>
            These estimates assume a typical luteal phase. Actual ovulation timing can vary due to
            stress, illness, or irregular cycles.
          </p>
        </div>
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

