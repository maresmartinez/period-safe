import { useToastContext } from '../stores/ToastContext.jsx';

export function useToast() {
  const { showToast } = useToastContext();
  return { showToast };
}
