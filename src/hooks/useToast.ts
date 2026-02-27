import { useToastContext } from '../stores/ToastContext.tsx';
import type { ShowToastOptions } from '../types.ts';

export function useToast(): { showToast: (opts: ShowToastOptions) => void } {
  const { showToast } = useToastContext();
  return { showToast };
}
