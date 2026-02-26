import { useState } from 'react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

const PRIVACY_KEY = 'periodSafe_privacyAcknowledged';

function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    // Initialize state based on localStorage on first render
    const acknowledged = localStorage.getItem(PRIVACY_KEY);
    return !acknowledged;
  });
  const [showDetails, setShowDetails] = useState(false);

  const handleDismiss = () => {
    localStorage.setItem(PRIVACY_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div
        className="fixed bottom-20 md:bottom-0 left-0 right-0 bg-rose-50 dark:bg-rose-950 border-t-2 border-rose-500 p-4 shadow-lg z-10"
        role="region"
        aria-live="polite"
        aria-label="Privacy notice"
      >
        <div className="max-w-2xl mx-auto flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-neutral-800 dark:text-neutral-200">
              <strong>Your privacy matters.</strong> PeriodSafe stores all data locally on your device. Nothing is sent to any server.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowDetails(true)}
              className="text-sm text-rose-600 dark:text-rose-400 underline hover:no-underline font-medium"
            >
              Learn more
            </button>
            <Button onClick={handleDismiss} variant="primary" size="sm">
              Got it
            </Button>
          </div>
        </div>
      </div>

      {showDetails && (
        <Modal
          title="Our Privacy Promise"
          onClose={() => setShowDetails(false)}
        >
          <div className="space-y-4 max-h-96 overflow-y-auto text-sm text-neutral-700 dark:text-neutral-300">
            <p>
              <strong>Your data is yours alone.</strong> PeriodSafe is a <em>local&#x2d;first</em> app, which means:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All your period data is stored exclusively in your browser&apos;s local storage and IndexedDB</li>
              <li>We do not have any servers, backend, or cloud infrastructure that your data could reach</li>
              <li>Nothing is ever transmitted over the internet — no analytics, no error reporting, no tracking</li>
              <li>You can export your data at any time as a portable JSON file and keep it offline</li>
              <li>If you clear your browser data, your entries are gone — but that&apos;s under your control</li>
            </ul>
            <hr className="border-neutral-300 dark:border-neutral-700 my-4" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              PeriodSafe is free, open&#x2d;source, and respects your privacy by design.
            </p>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              onClick={() => setShowDetails(false)}
              variant="primary"
              size="md"
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default PrivacyBanner;
