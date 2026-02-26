import { createPortal } from 'react-dom';
import { useToastContext } from '../stores/ToastContext.jsx';

const typeStyles = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-neutral-800 text-white dark:bg-neutral-700',
};

const icons = {
  success: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
    </svg>
  ),
};

function ToastItem({ toast, onDismiss }) {
  const isError = toast.type === 'error';
  return (
    <div
      role="alert"
      aria-live={isError ? 'assertive' : 'polite'}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg min-w-[280px] max-w-sm ${typeStyles[toast.type] ?? typeStyles.info}`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center rounded opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useToastContext();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 sm:items-end items-center sm:left-auto left-4"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>,
    document.body
  );
}
