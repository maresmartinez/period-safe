import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button.tsx';

const PRIVACY_KEY = 'periodSafe_privacyAcknowledged';

function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    const acknowledged = localStorage.getItem(PRIVACY_KEY);
    return !acknowledged;
  });

  const handleDismiss = () => {
    localStorage.setItem(PRIVACY_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
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
        <div className="flex gap-2 flex-shrink-0 items-center">
          <Link
            to="/privacy"
            className="text-sm text-rose-600 dark:text-rose-400 underline hover:no-underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded"
          >
            Learn more
          </Link>
          <Button onClick={handleDismiss} variant="primary" size="sm">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyBanner;
